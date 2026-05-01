import {
  commandBus,
  type CommandContext,
  type CommandProposalStatus,
} from './CommandBus';
import { commandRecorder } from './CommandRecorder';
import { registerMicropolisCommands } from './micropolisCommands';

export interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface McpToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

type McpToolArguments = Record<string, unknown>;

registerMicropolisCommands();
commandRecorder.attach(commandBus);

export const commandMcpTools: McpToolDescriptor[] = [
  {
    name: 'command_list',
    description: 'List available Micropolis command bus commands with labels, contexts, shortcuts, and LLM policies.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'command_preview',
    description: 'Preview a command without executing it. Use before proposing or dispatching actions.',
    inputSchema: {
      type: 'object',
      required: ['commandId'],
      additionalProperties: false,
      properties: {
        commandId: { type: 'string' },
        args: { type: 'object' },
        actor: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'command_propose',
    description: 'Create a pending LLM command proposal. Reversible/destructive actions must be approved before execution.',
    inputSchema: {
      type: 'object',
      required: ['commandId'],
      additionalProperties: false,
      properties: {
        commandId: { type: 'string' },
        args: { type: 'object' },
        actor: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'command_dispatch',
    description: 'Dispatch a command directly. LLM-sourced risky commands are queued as proposals instead of executed.',
    inputSchema: {
      type: 'object',
      required: ['commandId'],
      additionalProperties: false,
      properties: {
        commandId: { type: 'string' },
        args: { type: 'object' },
        source: { type: 'string' },
        actor: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'command_proposal_list',
    description: 'List command proposals, optionally filtered by status.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'executed'] },
      },
    },
  },
  {
    name: 'command_proposal_approve',
    description: 'Approve and execute a pending command proposal.',
    inputSchema: {
      type: 'object',
      required: ['proposalId'],
      additionalProperties: false,
      properties: {
        proposalId: { type: 'string' },
        actor: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'command_proposal_reject',
    description: 'Reject a pending command proposal.',
    inputSchema: {
      type: 'object',
      required: ['proposalId'],
      additionalProperties: false,
      properties: {
        proposalId: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
  {
    name: 'command_recording_list',
    description: 'List command records captured by the in-memory command recorder for this process.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'command_recording_jsonl',
    description: 'Export command records captured by the in-memory command recorder as JSONL.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'command_recording_clear',
    description: 'Clear command records captured by the in-memory command recorder for this process.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'command_dispatch_recorded',
    description: 'Clear current in-memory recordings, dispatch a command, and return the dispatch result plus generated command records.',
    inputSchema: {
      type: 'object',
      required: ['commandId'],
      additionalProperties: false,
      properties: {
        commandId: { type: 'string' },
        args: { type: 'object' },
        source: { type: 'string' },
        actor: { type: 'string' },
        reason: { type: 'string' },
      },
    },
  },
];

export async function callCommandMcpTool(
  toolName: string,
  args: McpToolArguments = {},
): Promise<McpToolResult> {
  switch (toolName) {
    case 'command_list':
      return textResult(JSON.stringify(listCommands(), null, 2));

    case 'command_preview':
      return textResult(JSON.stringify(await previewCommand(args), null, 2));

    case 'command_propose':
      return textResult(JSON.stringify(await proposeCommand(args), null, 2));

    case 'command_dispatch':
      return textResult(JSON.stringify(await dispatchCommand(args), null, 2));

    case 'command_proposal_list':
      return textResult(JSON.stringify(listProposals(args), null, 2));

    case 'command_proposal_approve':
      return textResult(JSON.stringify(await approveProposal(args), null, 2));

    case 'command_proposal_reject':
      return textResult(JSON.stringify(rejectProposal(args), null, 2));

    case 'command_recording_list':
      return textResult(JSON.stringify(commandRecorder.list(), null, 2));

    case 'command_recording_jsonl':
      return textResult(commandRecorder.exportJsonl());

    case 'command_recording_clear':
      commandRecorder.clear();
      return textResult(JSON.stringify({ handled: true, message: 'Command recording buffer cleared' }, null, 2));

    case 'command_dispatch_recorded':
      return textResult(JSON.stringify(await dispatchRecorded(args), null, 2));

    default:
      throw new Error(`Unknown command MCP tool: ${toolName}`);
  }
}

function listCommands() {
  return commandBus.list().map((command) => ({
    id: command.id,
    label: command.label,
    icon: command.icon,
    description: command.description,
    context: command.context,
    group: command.group,
    shortcut: command.shortcut,
    policy: command.policy,
  }));
}

async function previewCommand(args: McpToolArguments) {
  const commandId = requireString(args.commandId, 'commandId');
  const context = contextFromArgs(args, 'llm');
  return {
    commandId,
    enabled: commandBus.isEnabled(commandId, context),
    preview: await commandBus.preview(commandId, context),
  };
}

async function proposeCommand(args: McpToolArguments) {
  const commandId = requireString(args.commandId, 'commandId');
  return commandBus.propose(commandId, contextFromArgs(args, 'llm'));
}

async function dispatchCommand(args: McpToolArguments) {
  const commandId = requireString(args.commandId, 'commandId');
  const source = typeof args.source === 'string' ? args.source : 'llm';
  return commandBus.dispatch(commandId, contextFromArgs(args, source));
}

async function dispatchRecorded(args: McpToolArguments) {
  commandRecorder.clear();
  const result = await dispatchCommand(args);
  const records = commandRecorder.list();
  return {
    result,
    records,
    jsonl: commandRecorder.exportJsonl(records),
  };
}

function listProposals(args: McpToolArguments) {
  const status = typeof args.status === 'string'
    ? args.status as CommandProposalStatus
    : undefined;
  return commandBus.listProposals(status);
}

async function approveProposal(args: McpToolArguments) {
  const proposalId = requireString(args.proposalId, 'proposalId');
  return commandBus.approveProposal(proposalId, contextFromArgs(args, 'button'));
}

function rejectProposal(args: McpToolArguments) {
  const proposalId = requireString(args.proposalId, 'proposalId');
  return commandBus.rejectProposal(
    proposalId,
    typeof args.reason === 'string' ? args.reason : undefined,
  );
}

function contextFromArgs(args: McpToolArguments, source: string): CommandContext {
  return {
    source,
    args: isRecord(args.args) ? args.args : {},
    actor: typeof args.actor === 'string' ? args.actor : undefined,
    reason: typeof args.reason === 'string' ? args.reason : undefined,
  };
}

function textResult(text: string): McpToolResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Expected non-empty string argument: ${name}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
