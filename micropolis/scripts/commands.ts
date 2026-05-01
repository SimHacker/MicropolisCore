#!/usr/bin/env tsx

import { callCommandMcpTool, commandMcpTools } from '../src/lib/CommandMcpService';

type JsonRecord = Record<string, unknown>;

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  try {
    switch (command) {
      case 'tools':
        print(commandMcpTools);
        break;

      case 'list':
        await callAndPrint('command_list', {});
        break;

      case 'preview':
        await callAndPrint('command_preview', parseCommandArgs(rest));
        break;

      case 'propose':
        await callAndPrint('command_propose', parseCommandArgs(rest));
        break;

      case 'dispatch':
        await callAndPrint('command_dispatch', parseCommandArgs(rest));
        break;

      case 'record-dispatch':
        await callAndPrint('command_dispatch_recorded', parseCommandArgs(rest));
        break;

      case 'proposals':
        await callAndPrint('command_proposal_list', parseStatusArgs(rest));
        break;

      case 'approve':
        await callAndPrint('command_proposal_approve', parseProposalArgs(rest));
        break;

      case 'reject':
        await callAndPrint('command_proposal_reject', parseProposalArgs(rest));
        break;

      case 'recordings':
        await callAndPrint('command_recording_list', {});
        break;

      case 'recordings-jsonl':
        await callAndPrint('command_recording_jsonl', {});
        break;

      case 'recordings-clear':
        await callAndPrint('command_recording_clear', {});
        break;

      default:
        usage(command);
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function callAndPrint(toolName: string, args: JsonRecord) {
  const result = await callCommandMcpTool(toolName, args);
  const text = result.content.map((item) => item.text).join('\n');
  console.log(text);
}

function parseCommandArgs(args: string[]): JsonRecord {
  const [commandId, ...rest] = args;
  if (!commandId) {
    throw new Error('Missing command id');
  }

  return {
    commandId,
    ...parseFlags(rest),
  };
}

function parseStatusArgs(args: string[]): JsonRecord {
  return parseFlags(args);
}

function parseProposalArgs(args: string[]): JsonRecord {
  const [proposalId, ...rest] = args;
  if (!proposalId) {
    throw new Error('Missing proposal id');
  }
  return {
    proposalId,
    ...parseFlags(rest),
  };
}

function parseFlags(args: string[]): JsonRecord {
  const result: JsonRecord = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--actor':
        result.actor = requireValue(args, ++i, arg);
        break;
      case '--reason':
        result.reason = requireValue(args, ++i, arg);
        break;
      case '--source':
        result.source = requireValue(args, ++i, arg);
        break;
      case '--status':
        result.status = requireValue(args, ++i, arg);
        break;
      case '--args':
        result.args = JSON.parse(requireValue(args, ++i, arg));
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

function usage(command?: string) {
  if (command) {
    console.error(`Unknown command: ${command}`);
  }

  console.log(`Usage:
  npx tsx scripts/commands.ts tools
  npx tsx scripts/commands.ts list
  npx tsx scripts/commands.ts preview <command-id> [--args JSON] [--actor NAME] [--reason TEXT]
  npx tsx scripts/commands.ts propose <command-id> [--args JSON] [--actor NAME] [--reason TEXT]
  npx tsx scripts/commands.ts dispatch <command-id> [--args JSON] [--source llm|chat|keyboard|button]
  npx tsx scripts/commands.ts record-dispatch <command-id> [--args JSON] [--source llm|chat|keyboard|button]
  npx tsx scripts/commands.ts proposals [--status pending|approved|rejected|executed]
  npx tsx scripts/commands.ts approve <proposal-id> [--actor NAME] [--reason TEXT]
  npx tsx scripts/commands.ts reject <proposal-id> [--reason TEXT]
  npx tsx scripts/commands.ts recordings
  npx tsx scripts/commands.ts recordings-jsonl
  npx tsx scripts/commands.ts recordings-clear
`);
}

void main();
