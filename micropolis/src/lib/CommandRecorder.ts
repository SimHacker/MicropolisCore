import {
  commandBus,
  type CommandBus,
  type CommandContext,
  type CommandDispatch,
  type CommandPolicy,
  type CommandResult,
  type CommandSource,
} from './CommandBus';

export interface CommandRecord {
  id: string;
  sequence: number;
  command_id: string;
  label: string;
  source?: CommandSource;
  actor?: string;
  reason?: string;
  created_at: string;
  created_at_ms: number;
  filename: string;
  context: {
    args?: Record<string, unknown>;
    branch?: string;
    object_path?: string;
    city_id?: string;
    sim_tick?: number;
    approved_proposal_id?: string;
  };
  policy?: SerializableCommandPolicy;
  result?: SerializableCommandResult;
}

export interface SerializableCommandPolicy {
  risk?: CommandPolicy['risk'];
  allowLLM?: boolean;
  requiresApproval?: boolean | 'predicate';
}

export interface SerializableCommandResult {
  handled?: boolean;
  message?: string;
  data?: unknown;
}

export interface CommandRecorderOptions {
  directory?: string;
  maxRecords?: number;
}

const DEFAULT_DIRECTORY = 'timeline/commands';
const DEFAULT_MAX_RECORDS = 1000;

export class CommandRecorder {
  private records: CommandRecord[] = [];
  private sequence = 0;
  private unsubscribe?: () => void;
  private directory: string;
  private maxRecords: number;

  constructor(options: CommandRecorderOptions = {}) {
    this.directory = options.directory ?? DEFAULT_DIRECTORY;
    this.maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
  }

  attach(bus: CommandBus = commandBus): void {
    if (this.unsubscribe) return;
    this.unsubscribe = bus.subscribe((dispatch) => {
      this.record(dispatch);
    });
  }

  detach(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }

  clear(): void {
    this.records = [];
    this.sequence = 0;
  }

  list(): CommandRecord[] {
    return [...this.records];
  }

  latest(): CommandRecord | undefined {
    return this.records.at(-1);
  }

  exportJsonl(records: CommandRecord[] = this.records): string {
    return records.map((record) => JSON.stringify(record)).join('\n');
  }

  record(dispatch: CommandDispatch): CommandRecord {
    const sequence = this.sequence + 1;
    this.sequence = sequence;

    const createdAtMs = numberFromContext(dispatch.context.now) ?? Date.now();
    const createdAt = new Date(createdAtMs).toISOString();
    const commandId = dispatch.command.id;
    const recordId = createRecordId(sequence);
    const filename = createTimestampedCommandFilename({
      directory: this.directory,
      timestamp: createdAt,
      commandId,
      recordId,
    });

    const record: CommandRecord = {
      id: recordId,
      sequence,
      command_id: commandId,
      label: dispatch.command.label,
      source: dispatch.context.source,
      actor: stringFromContext(dispatch.context.actor),
      reason: stringFromContext(dispatch.context.reason),
      created_at: createdAt,
      created_at_ms: createdAtMs,
      filename,
      context: serializeContext(dispatch.context),
      policy: serializePolicy(dispatch.command.policy),
      result: serializeResult(dispatch.result),
    };

    this.records.push(record);
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(-this.maxRecords);
    }

    return record;
  }
}

export function createTimestampedCommandFilename(options: {
  directory?: string;
  timestamp: string;
  commandId: string;
  recordId: string;
}): string {
  const directory = options.directory ?? DEFAULT_DIRECTORY;
  const timestamp = options.timestamp.replace(/:/g, '-');
  return `${directory}/${timestamp}_${options.recordId}_${slugify(options.commandId)}.json`;
}

function serializeContext(context: CommandContext): CommandRecord['context'] {
  return {
    args: isRecord(context.args) ? sanitizeJson(context.args) as Record<string, unknown> : undefined,
    branch: stringFromContext(context.branch),
    object_path: stringFromContext(context.objectPath ?? context.object_path),
    city_id: stringFromContext(context.cityId ?? context.city_id),
    sim_tick: numberFromContext(context.simTick ?? context.sim_tick),
    approved_proposal_id: stringFromContext(context.approvedProposalId ?? context.approved_proposal_id),
  };
}

function serializeResult(result: CommandResult | undefined): SerializableCommandResult | undefined {
  if (!result) return undefined;
  return {
    handled: result.handled,
    message: result.message,
    data: sanitizeJson(result.data),
  };
}

function serializePolicy(policy: CommandPolicy | undefined): SerializableCommandPolicy | undefined {
  if (!policy) return undefined;
  return {
    risk: policy.risk,
    allowLLM: policy.allowLLM,
    requiresApproval: typeof policy.requiresApproval === 'function'
      ? 'predicate'
      : policy.requiresApproval,
  };
}

function sanitizeJson(value: unknown, depth = 0): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (depth > 8) return '[MaxDepth]';
  if (Array.isArray(value)) return value.map((item) => sanitizeJson(item, depth + 1));
  if (isRecord(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const sanitized = sanitizeJson(child, depth + 1);
      if (sanitized !== undefined) output[key] = sanitized;
    }
    return output;
  }
  return String(value);
}

function createRecordId(sequence: number): string {
  return `cmd_${sequence.toString().padStart(6, '0')}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'command';
}

function stringFromContext(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberFromContext(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const commandRecorder = new CommandRecorder();
