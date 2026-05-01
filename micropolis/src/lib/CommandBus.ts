export type CommandSource =
  | 'button'
  | 'chat'
  | 'keyboard'
  | 'llm'
  | 'pie-menu'
  | 'script'
  | 'system'
  | string;

export interface CommandContext {
  source?: CommandSource;
  commandId?: string;
  args?: Record<string, unknown>;
  event?: Event;
  actor?: string;
  reason?: string;
  target?: EventTarget | null;
  now?: number;
  [key: string]: unknown;
}

export interface CommandPreview {
  label?: string;
  message?: string;
  affectedObjects?: unknown[];
  data?: unknown;
}

export interface CommandUndo {
  label?: string;
  run: (context: CommandContext) => void | Promise<void>;
}

export interface CommandResult {
  handled?: boolean;
  message?: string;
  undo?: CommandUndo;
  data?: unknown;
}

export type CommandRisk = 'safe' | 'reversible' | 'destructive' | 'external';

export interface CommandPolicy {
  risk?: CommandRisk;
  allowLLM?: boolean;
  requiresApproval?: boolean | CommandPredicate;
}

export type CommandProposalStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export interface CommandProposal {
  id: string;
  commandId: string;
  label: string;
  icon?: string;
  actor?: string;
  reason?: string;
  context: CommandContext;
  preview?: CommandPreview;
  status: CommandProposalStatus;
  createdAt: number;
  decidedAt?: number;
  result?: CommandResult;
}

export type CommandPredicate<Context extends CommandContext = CommandContext> =
  (context: Context) => boolean;

export type CommandRunner<Context extends CommandContext = CommandContext> =
  (context: Context) => void | CommandResult | Promise<void | CommandResult>;

export type CommandPreviewer<Context extends CommandContext = CommandContext> =
  (context: Context) => CommandPreview | undefined | Promise<CommandPreview | undefined>;

export interface Command<Context extends CommandContext = CommandContext> {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  context?: string | string[];
  group?: string;
  shortcut?: string | string[];
  policy?: CommandPolicy;
  enabled?: boolean | CommandPredicate<Context>;
  run: CommandRunner<Context>;
  preview?: CommandPreviewer<Context>;
  undo?: (context: Context) => CommandUndo | undefined;
}

export interface CommandDispatch<Context extends CommandContext = CommandContext> {
  command: Command<Context>;
  context: Context;
  result?: CommandResult;
}

export type CommandListener = (dispatch: CommandDispatch) => void;

export class CommandBus {
  private commands = new Map<string, Command>();
  private shortcuts = new Map<string, string>();
  private listeners = new Set<CommandListener>();
  private undoStack: CommandUndo[] = [];
  private proposals = new Map<string, CommandProposal>();

  register<Context extends CommandContext>(command: Command<Context>): () => void {
    if (this.commands.has(command.id)) {
      throw new Error(`Command already registered: ${command.id}`);
    }

    this.commands.set(command.id, command as Command);
    this.registerShortcuts(command as Command);

    return () => this.unregister(command.id);
  }

  registerAll(commands: Command[]): () => void {
    const unregister = commands.map((command) => this.register(command));
    return () => {
      for (let i = unregister.length - 1; i >= 0; i -= 1) {
        unregister[i]();
      }
    };
  }

  unregister(id: string): void {
    const command = this.commands.get(id);
    if (!command) return;

    this.commands.delete(id);

    for (const [shortcut, commandId] of this.shortcuts) {
      if (commandId === id) {
        this.shortcuts.delete(shortcut);
      }
    }
  }

  get(id: string): Command | undefined {
    return this.commands.get(id);
  }

  list(context?: CommandContext): Command[] {
    const commands = [...this.commands.values()];
    if (!context) return commands;
    return commands.filter((command) => this.isEnabled(command.id, context));
  }

  isEnabled(id: string, context: CommandContext = {}): boolean {
    const command = this.commands.get(id);
    if (!command) return false;

    if (command.enabled === undefined) return true;
    if (typeof command.enabled === 'boolean') return command.enabled;
    return command.enabled({ ...context, commandId: id });
  }

  async preview(id: string, context: CommandContext = {}): Promise<CommandPreview | undefined> {
    const command = this.commands.get(id);
    if (!command?.preview || !this.isEnabled(id, context)) return undefined;
    return command.preview({ ...context, commandId: id });
  }

  async dispatch(id: string, context: CommandContext = {}): Promise<CommandResult> {
    const command = this.commands.get(id);
    if (!command) {
      return { handled: false, message: `Unknown command: ${id}` };
    }

    const commandContext = {
      ...context,
      commandId: id,
      now: context.now ?? Date.now(),
    };

    if (!this.isEnabled(id, commandContext)) {
      return { handled: false, message: `Command disabled: ${id}` };
    }

    if (context.source === 'llm' && this.requiresApproval(command, commandContext)) {
      const proposal = await this.propose(id, commandContext);
      return {
        handled: true,
        message: `Command proposal queued for approval: ${proposal.id}`,
        data: proposal,
      };
    }

    const rawResult = await command.run(commandContext);
    const result = this.normalizeResult(rawResult);
    const undo = result.undo ?? command.undo?.(commandContext);

    if (undo) {
      this.undoStack.push(undo);
    }

    const dispatch = { command, context: commandContext, result };
    this.emit(dispatch);

    return result;
  }

  async dispatchShortcut(shortcut: string, context: CommandContext = {}): Promise<CommandResult> {
    const commandId = this.shortcuts.get(normalizeShortcut(shortcut));
    if (!commandId) {
      return { handled: false, message: `No command bound to shortcut: ${shortcut}` };
    }
    return this.dispatch(commandId, { ...context, source: context.source ?? 'keyboard' });
  }

  async undo(context: CommandContext = {}): Promise<CommandResult> {
    const undo = this.undoStack.pop();
    if (!undo) {
      return { handled: false, message: 'Nothing to undo' };
    }
    await undo.run({ ...context, source: context.source ?? 'system' });
    return { handled: true, message: undo.label ? `Undid ${undo.label}` : 'Undo complete' };
  }

  async propose(id: string, context: CommandContext = {}): Promise<CommandProposal> {
    const command = this.commands.get(id);
    if (!command) {
      throw new Error(`Unknown command: ${id}`);
    }

    const commandContext = {
      ...context,
      commandId: id,
      source: context.source ?? 'llm',
      now: context.now ?? Date.now(),
    };

    if (commandContext.source === 'llm' && command.policy?.allowLLM === false) {
      throw new Error(`Command does not allow LLM proposals: ${id}`);
    }

    const preview = await this.preview(id, commandContext);
    const proposal: CommandProposal = {
      id: createProposalId(id),
      commandId: id,
      label: command.label,
      icon: command.icon,
      actor: commandContext.actor,
      reason: commandContext.reason,
      context: commandContext,
      preview,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  getProposal(id: string): CommandProposal | undefined {
    return this.proposals.get(id);
  }

  restoreProposal(proposal: CommandProposal): void {
    this.proposals.set(proposal.id, proposal);
  }

  restoreProposals(proposals: CommandProposal[]): void {
    for (const proposal of proposals) {
      this.restoreProposal(proposal);
    }
  }

  listProposals(status?: CommandProposalStatus): CommandProposal[] {
    const proposals = [...this.proposals.values()];
    if (!status) return proposals;
    return proposals.filter((proposal) => proposal.status === status);
  }

  rejectProposal(id: string, reason?: string): CommandProposal | undefined {
    const proposal = this.proposals.get(id);
    if (!proposal || proposal.status !== 'pending') return proposal;

    proposal.status = 'rejected';
    proposal.decidedAt = Date.now();
    proposal.result = {
      handled: true,
      message: reason ?? 'Proposal rejected',
    };
    return proposal;
  }

  async approveProposal(id: string, context: CommandContext = {}): Promise<CommandResult> {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      return { handled: false, message: `Unknown proposal: ${id}` };
    }
    if (proposal.status !== 'pending') {
      return { handled: false, message: `Proposal is not pending: ${id}` };
    }

    proposal.status = 'approved';
    proposal.decidedAt = Date.now();

    const result = await this.dispatch(proposal.commandId, {
      ...proposal.context,
      ...context,
      source: context.source ?? 'button',
      approvedProposalId: proposal.id,
    });

    proposal.status = result.handled === false ? 'approved' : 'executed';
    proposal.result = result;

    return result;
  }

  subscribe(listener: CommandListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private registerShortcuts(command: Command): void {
    const shortcuts = Array.isArray(command.shortcut)
      ? command.shortcut
      : command.shortcut
        ? [command.shortcut]
        : [];

    for (const shortcut of shortcuts) {
      this.shortcuts.set(normalizeShortcut(shortcut), command.id);
    }
  }

  private normalizeResult(result: void | CommandResult): CommandResult {
    if (result === undefined) return { handled: true };
    return { handled: true, ...result };
  }

  private emit(dispatch: CommandDispatch): void {
    for (const listener of this.listeners) {
      listener(dispatch);
    }
  }

  private requiresApproval(command: Command, context: CommandContext): boolean {
    if (context.approvedProposalId) return false;

    const requiresApproval = command.policy?.requiresApproval;
    if (typeof requiresApproval === 'boolean') return requiresApproval;
    if (typeof requiresApproval === 'function') return requiresApproval(context);

    return command.policy?.risk !== 'safe';
  }
}

export function normalizeShortcut(shortcut: string): string {
  if (shortcut === ' ') return 'space';
  if (shortcut === '+') return 'plus';

  return shortcut
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === 'cmd') return 'meta';
      if (lower === 'command') return 'meta';
      if (lower === 'ctrl') return 'control';
      if (lower === 'esc') return 'escape';
      if (lower === 'space') return 'space';
      if (lower === 'plus') return 'plus';
      if (part.length === 1) return part;
      return lower;
    })
    .sort((a, b) => modifierOrder(a) - modifierOrder(b) || a.localeCompare(b))
    .join('+');
}

export function shortcutFromKeyboardEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.altKey) parts.push('alt');
  if (event.ctrlKey) parts.push('control');
  if (event.metaKey) parts.push('meta');
  if (event.shiftKey) parts.push('shift');
  if (event.key === ' ') {
    parts.push('space');
  } else if (event.key === '+') {
    parts.push('plus');
  } else {
    parts.push(event.key.length === 1 ? event.key : event.key.toLowerCase());
  }
  return normalizeShortcut(parts.join('+'));
}

function modifierOrder(part: string): number {
  switch (part) {
    case 'control': return 0;
    case 'meta': return 1;
    case 'alt': return 2;
    case 'shift': return 3;
    default: return 4;
  }
}

function createProposalId(commandId: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${commandId}:${Date.now().toString(36)}:${suffix}`;
}

export const commandBus = new CommandBus();
