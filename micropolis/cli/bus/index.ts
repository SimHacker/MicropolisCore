/**
 * Command-bus CLI: same behavior as `CommandMcpService` tool calls.
 *
 * `extendBusCommands(argv)` adds `micropolis bus <subcommand>`.
 * Parent option `--format` / `-f`: `json` | `yaml` | `yml` for structured tool text.
 */

import type { Argv } from 'yargs';
import { callCommandMcpTool, commandMcpTools } from '../../src/lib/CommandMcpService';
import { normalizeStructuredFormat, stringifyStructured } from '../lib/format.js';

type JsonRecord = Record<string, unknown>;

function fmt(argv: { format?: string }): string {
	return typeof argv.format === 'string' && argv.format.length > 0 ? argv.format : 'json';
}

function print(value: unknown, format: string) {
	const f = normalizeStructuredFormat(format);
	if (f === 'csv') {
		throw new Error('bus output: use json or yaml.');
	}
	if (typeof value === 'string') {
		if (f === 'yaml') {
			try {
				console.log(stringifyStructured(JSON.parse(value), 'yaml'));
				return;
			} catch {
				console.log(value);
				return;
			}
		}
		console.log(value);
		return;
	}
	console.log(stringifyStructured(value, format));
}

async function callAndPrint(toolName: string, args: JsonRecord, format: string) {
	const result = await callCommandMcpTool(toolName, args);
	const text = result.content.map((item) => item.text).join('\n');
	print(text, format);
}

export function extendBusCommands(argv: Argv): Argv {
	return argv.command('bus', 'Inspect and drive the Micropolis command bus', (y) =>
		y
			.option('format', {
				alias: 'f',
				type: 'string',
				default: 'json',
				choices: ['json', 'yaml', 'yml'],
				describe: 'Structured output for JSON tool payloads'
			})
			.command(
				'tools',
				'Print MCP-style tool descriptors',
				() => {},
				(argv) => {
					print(commandMcpTools, fmt(argv));
				}
			)
			.command(
				'list',
				'List registered commands',
				() => {},
				async (argv) => {
					await callAndPrint('command_list', {}, fmt(argv));
				}
			)
			.command(
				'preview <command-id>',
				'Preview a command',
				(ys) =>
					ys
						.positional('command-id', { type: 'string', demandOption: true })
						.option('args', { type: 'string', describe: 'JSON object' })
						.option('actor', { type: 'string' })
						.option('reason', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = { commandId: argv.commandId };
					if (argv.args) payload.args = JSON.parse(argv.args as string);
					if (argv.actor) payload.actor = argv.actor;
					if (argv.reason) payload.reason = argv.reason;
					await callAndPrint('command_preview', payload, fmt(argv));
				}
			)
			.command(
				'propose <command-id>',
				'Create a pending proposal',
				(ys) =>
					ys
						.positional('command-id', { type: 'string', demandOption: true })
						.option('args', { type: 'string' })
						.option('actor', { type: 'string' })
						.option('reason', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = { commandId: argv.commandId };
					if (argv.args) payload.args = JSON.parse(argv.args as string);
					if (argv.actor) payload.actor = argv.actor;
					if (argv.reason) payload.reason = argv.reason;
					await callAndPrint('command_propose', payload, fmt(argv));
				}
			)
			.command(
				'dispatch <command-id>',
				'Dispatch a command',
				(ys) =>
					ys
						.positional('command-id', { type: 'string', demandOption: true })
						.option('args', { type: 'string' })
						.option('source', { type: 'string', choices: ['llm', 'chat', 'keyboard', 'button', 'script'] }),
				async (argv) => {
					const payload: JsonRecord = { commandId: argv.commandId };
					if (argv.args) payload.args = JSON.parse(argv.args as string);
					if (argv.source) payload.source = argv.source;
					await callAndPrint('command_dispatch', payload, fmt(argv));
				}
			)
			.command(
				'record-dispatch <command-id>',
				'Dispatch with recording metadata',
				(ys) =>
					ys
						.positional('command-id', { type: 'string', demandOption: true })
						.option('args', { type: 'string' })
						.option('source', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = { commandId: argv.commandId };
					if (argv.args) payload.args = JSON.parse(argv.args as string);
					if (argv.source) payload.source = argv.source;
					await callAndPrint('command_dispatch_recorded', payload, fmt(argv));
				}
			)
			.command(
				'proposals',
				'List proposals',
				(ys) => ys.option('status', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = {};
					if (argv.status) payload.status = argv.status;
					await callAndPrint('command_proposal_list', payload, fmt(argv));
				}
			)
			.command(
				'approve <proposal-id>',
				'Approve a proposal',
				(ys) =>
					ys
						.positional('proposal-id', { type: 'string', demandOption: true })
						.option('actor', { type: 'string' })
						.option('reason', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = { proposalId: argv.proposalId };
					if (argv.actor) payload.actor = argv.actor;
					if (argv.reason) payload.reason = argv.reason;
					await callAndPrint('command_proposal_approve', payload, fmt(argv));
				}
			)
			.command(
				'reject <proposal-id>',
				'Reject a proposal',
				(ys) =>
					ys
						.positional('proposal-id', { type: 'string', demandOption: true })
						.option('reason', { type: 'string' }),
				async (argv) => {
					const payload: JsonRecord = { proposalId: argv.proposalId };
					if (argv.reason) payload.reason = argv.reason;
					await callAndPrint('command_proposal_reject', payload, fmt(argv));
				}
			)
			.command(
				'recordings',
				'List recordings',
				() => {},
				async (argv) => {
					await callAndPrint('command_recording_list', {}, fmt(argv));
				}
			)
			.command(
				'recordings-jsonl',
				'Recordings as JSONL',
				() => {},
				async (argv) => {
					await callAndPrint('command_recording_jsonl', {}, fmt(argv));
				}
			)
			.command(
				'recordings-clear',
				'Clear recordings',
				() => {},
				async (argv) => {
					await callAndPrint('command_recording_clear', {}, fmt(argv));
				}
			)
			.demandCommand(1, 'Specify a bus subcommand')
	);
}
