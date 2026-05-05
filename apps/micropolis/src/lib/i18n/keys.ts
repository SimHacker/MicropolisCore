/**
 * Stable translation-key helpers.
 *
 * English command labels and CLI strings are development fallbacks; browser UI
 * code should prefer keys from command metadata when rendering translated text.
 */

export function commandTextKey(commandId: string, field: 'label' | 'description' | 'group'): string {
	return `commands.${commandId}.${field}`;
}
