/**
 * Two platforms, two vocabularies for the same widgets. Selectors match on one
 * normalized name so a module written once works on both.
 *
 * The normalized names are lowercase and unhyphenated. Where the platforms disagree
 * about granularity the coarser name wins, because a selector is a pattern and
 * patterns should be forgiving — you can always narrow with a predicate on subrole.
 */

/** UI Automation control type ids. Stable numbers; the localized strings are not. */
const UIA_CONTROL_TYPES: Record<number, string> = {
	50000: 'button',
	50001: 'calendar',
	50002: 'checkbox',
	50003: 'combobox',
	50004: 'textfield',
	50005: 'hyperlink',
	50006: 'image',
	50007: 'listitem',
	50008: 'list',
	50009: 'menu',
	50010: 'menubar',
	50011: 'menuitem',
	50012: 'progressbar',
	50013: 'radiobutton',
	50014: 'scrollbar',
	50015: 'slider',
	50016: 'spinner',
	50017: 'statusbar',
	50018: 'tab',
	50019: 'tabitem',
	50020: 'text',
	50021: 'toolbar',
	50022: 'tooltip',
	50023: 'tree',
	50024: 'treeitem',
	50025: 'custom',
	50026: 'group',
	50027: 'thumb',
	50028: 'datagrid',
	50029: 'dataitem',
	50030: 'document',
	50031: 'splitbutton',
	50032: 'window',
	50033: 'pane',
	50034: 'header',
	50035: 'headeritem',
	50036: 'table',
	50037: 'titlebar',
	50038: 'separator',
	50039: 'semanticzoom',
	50040: 'appbar'
};

/** AX roles that do not survive a mechanical de-prefixing into the shared vocabulary. */
const AX_ALIASES: Record<string, string> = {
	textfield: 'textfield',
	statictext: 'text',
	textarea: 'textfield',
	radiobutton: 'radiobutton',
	checkbox: 'checkbox',
	popupbutton: 'combobox',
	menubutton: 'splitbutton',
	scrollarea: 'pane',
	splitgroup: 'group',
	outline: 'tree',
	outlinerow: 'treeitem',
	row: 'dataitem',
	cell: 'dataitem',
	webarea: 'document',
	link: 'hyperlink',
	incrementor: 'spinner',
	busyindicator: 'progressbar',
	unknown: 'custom'
};

/**
 * Turn whatever the platform said into the shared name.
 *
 * On macOS the input is an AX role string like 'AXButton'. On Windows it is the
 * decimal control type id as a string, because that is what the addon can hand back
 * without dragging localization into the selector language.
 */
export function normalizeRole(nativeRole: string): string {
	if (!nativeRole) {
		return 'custom';
	}

	const asNumber = Number(nativeRole);
	if (Number.isInteger(asNumber) && asNumber >= 50000) {
		return UIA_CONTROL_TYPES[asNumber] ?? 'custom';
	}

	const bare = nativeRole.replace(/^AX/, '').toLowerCase();
	return AX_ALIASES[bare] ?? bare;
}

/** Every name a selector can legally use, for autocomplete and for typo diagnostics. */
export function knownRoles(): string[] {
	const roles = new Set<string>(Object.values(UIA_CONTROL_TYPES));
	for (const role of Object.values(AX_ALIASES)) {
		roles.add(role);
	}
	return [...roles].sort();
}
