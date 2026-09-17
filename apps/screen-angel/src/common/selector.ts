/**
 * The selector engine. `querySelectorAll` for somebody else's application.
 *
 * The grammar is a deliberate subset of CSS, chosen so that anyone who has written a
 * jQuery selector can write one of these without reading anything:
 *
 *     button                          every button
 *     button[name="OK"]               the OK button
 *     window > group button           buttons that are children of a group in a window
 *     textfield:focused               the text field with keyboard focus
 *     *[name*="Save"]                 anything whose name contains Save
 *     menuitem[name^="Recent"]        menu items whose name starts with Recent
 *
 * Combinators: whitespace for descendant, '>' for child, ',' for union. Predicates:
 * '=' exact, '!=' not equal, '*=' contains, '^=' prefix, '$=' suffix, bare '[attr]' for
 * present and non-empty. Pseudo-classes: ':focused', ':enabled', ':disabled'.
 *
 * A union is one walk over one snapshot, which is the point: asking five separate
 * questions to find the actionable widgets would cost five tree walks and return five
 * different moments, describing a screen that never existed.
 *
 * What is missing is on purpose. There are no sibling combinators, because the
 * accessibility tree's sibling order is not meaningfully stable between releases of
 * the app you are augmenting, so a selector that leans on it is a selector that will
 * break. There is no ':nth-child' for the same reason. Matching by name, role and
 * containment survives updates; counting does not.
 *
 * Matching runs in TypeScript over the flat node list the native addon returns.
 * Pushing the match down into the native walk is the next step and the reason
 * `Compound` is a plain data structure rather than a closure: it has to be
 * serializable to hand to C++.
 */

import type { UIElement } from './types';

export type Combinator = 'descendant' | 'child';

export type PredicateOp = '=' | '!=' | '*=' | '^=' | '$=' | 'exists';

export interface Predicate {
	attr: 'name' | 'value' | 'subrole' | 'role' | 'nativeRole' | 'app';
	op: PredicateOp;
	value?: string;
}

export interface Compound {
	/** null means '*' — any role. */
	role: string | null;
	predicates: Predicate[];
	focused?: boolean;
	enabled?: boolean;
}

export interface Step {
	combinator: Combinator;
	compound: Compound;
}

export interface CompiledSelector {
	source: string;
	/**
	 * Comma-separated alternatives, as in CSS. Each branch matches independently and the
	 * results are unioned, because the question an agent actually asks is "where are the
	 * things I can interact with" — and that is several roles, not one.
	 */
	branches: Step[][];
}

export class SelectorError extends Error {
	constructor(
		message: string,
		public readonly source: string,
		public readonly position: number
	) {
		super(`${message} at character ${position + 1} of ${JSON.stringify(source)}`);
		this.name = 'SelectorError';
	}
}

const ATTRS = new Set<Predicate['attr']>(['name', 'value', 'subrole', 'role', 'nativeRole', 'app']);
const IDENT = /[A-Za-z0-9_-]/;

export function parseSelector(source: string): CompiledSelector {
	const branches: Step[][] = [];
	let i = 0;

	const skipSpace = () => {
		while (i < source.length && /\s/.test(source[i])) {
			i++;
		}
	};

	skipSpace();
	if (i >= source.length) {
		throw new SelectorError('Empty selector', source, 0);
	}

	for (;;) {
		branches.push(parseBranch());
		skipSpace();
		if (i >= source.length) {
			break;
		}
		if (source[i] !== ',') {
			throw new SelectorError(`Unexpected ${JSON.stringify(source[i])}`, source, i);
		}
		i++;
		skipSpace();
		if (i >= source.length) {
			throw new SelectorError('Trailing , with nothing after it', source, i);
		}
	}

	return { source, branches };

	/** One alternative: a chain of compounds joined by combinators. */
	function parseBranch(): Step[] {
		const steps: Step[] = [];
		let combinator: Combinator = 'descendant';

		for (;;) {
			steps.push({ combinator, compound: parseCompound() });

			// Decide what separates this compound from the next one.
			const before = i;
			skipSpace();
			if (i >= source.length || source[i] === ',') {
				return steps;
			}
			if (source[i] === '>') {
				i++;
				skipSpace();
				if (i >= source.length || source[i] === ',') {
					throw new SelectorError('Trailing > with nothing after it', source, i);
				}
				combinator = 'child';
			} else if (i > before) {
				combinator = 'descendant';
			} else {
				// Not space, not '>' and not ',', so this branch is over and the character
				// is bad. The caller reports it, at this same position.
				return steps;
			}
		}
	}

	function parseCompound(): Compound {
		const compound: Compound = { role: null, predicates: [] };
		const start = i;

		if (source[i] === '*') {
			i++;
		} else if (IDENT.test(source[i] ?? '')) {
			let role = '';
			while (i < source.length && IDENT.test(source[i])) {
				role += source[i++];
			}
			compound.role = role.toLowerCase();
		} else if (source[i] !== '[' && source[i] !== ':') {
			throw new SelectorError(`Expected a role, '*', '[' or ':'`, source, i);
		}

		for (;;) {
			if (source[i] === '[') {
				compound.predicates.push(parsePredicate());
			} else if (source[i] === ':') {
				parsePseudo(compound);
			} else {
				break;
			}
		}

		if (i === start) {
			throw new SelectorError('Expected a compound selector', source, i);
		}
		return compound;
	}

	function parsePredicate(): Predicate {
		i++; // consume '['
		let attr = '';
		while (i < source.length && IDENT.test(source[i])) {
			attr += source[i++];
		}
		if (!ATTRS.has(attr as Predicate['attr'])) {
			throw new SelectorError(
				`Unknown attribute ${JSON.stringify(attr)}; known: ${[...ATTRS].join(', ')}`,
				source,
				i - attr.length
			);
		}

		if (source[i] === ']') {
			i++;
			return { attr: attr as Predicate['attr'], op: 'exists' };
		}

		let op: PredicateOp;
		const two = source.slice(i, i + 2);
		if (two === '!=' || two === '*=' || two === '^=' || two === '$=') {
			op = two;
			i += 2;
		} else if (source[i] === '=') {
			op = '=';
			i++;
		} else {
			throw new SelectorError('Expected =, !=, *=, ^=, $= or ]', source, i);
		}

		const value = parseValue();
		if (source[i] !== ']') {
			throw new SelectorError('Expected ]', source, i);
		}
		i++;
		return { attr: attr as Predicate['attr'], op, value };
	}

	function parseValue(): string {
		const quote = source[i];
		if (quote === '"' || quote === "'") {
			i++;
			let value = '';
			while (i < source.length && source[i] !== quote) {
				if (source[i] === '\\' && i + 1 < source.length) {
					i++;
				}
				value += source[i++];
			}
			if (i >= source.length) {
				throw new SelectorError('Unterminated quoted value', source, i);
			}
			i++;
			return value;
		}

		let value = '';
		while (i < source.length && source[i] !== ']') {
			value += source[i++];
		}
		return value.trim();
	}

	function parsePseudo(compound: Compound): void {
		i++; // consume ':'
		let name = '';
		while (i < source.length && IDENT.test(source[i])) {
			name += source[i++];
		}
		switch (name.toLowerCase()) {
			case 'focused':
				compound.focused = true;
				break;
			case 'enabled':
				compound.enabled = true;
				break;
			case 'disabled':
				compound.enabled = false;
				break;
			default:
				throw new SelectorError(
					`Unknown pseudo-class ':${name}'; known: focused, enabled, disabled`,
					source,
					i - name.length
				);
		}
	}
}

function testPredicate(predicate: Predicate, element: UIElement): boolean {
	const actual = element[predicate.attr];
	const haystack = actual == null ? '' : String(actual);

	switch (predicate.op) {
		case 'exists':
			return haystack.length > 0;
		case '=':
			return haystack === predicate.value;
		case '!=':
			return haystack !== predicate.value;
		case '*=':
			return haystack.includes(predicate.value ?? '');
		case '^=':
			return haystack.startsWith(predicate.value ?? '');
		case '$=':
			return haystack.endsWith(predicate.value ?? '');
	}
}

export function matchCompound(compound: Compound, element: UIElement): boolean {
	if (compound.role !== null && compound.role !== element.role) {
		return false;
	}
	if (compound.focused === true && element.focused !== true) {
		return false;
	}
	if (compound.enabled !== undefined && (element.enabled ?? true) !== compound.enabled) {
		return false;
	}
	return compound.predicates.every((predicate) => testPredicate(predicate, element));
}

const key = (path: readonly number[]) => path.join('\u0000');

/**
 * Run a compiled selector over a flat element list.
 *
 * Containment comes from `UIElement.path`: an element is a descendant of another when
 * its path has the other's path as a proper prefix. That means matching needs no tree
 * reconstruction and no parent pointers, which is what lets the native side hand back
 * a flat array and stay simple.
 */
export function matchSelector(selector: CompiledSelector, elements: UIElement[]): UIElement[] {
	if (selector.branches.length === 1) {
		return matchBranch(selector.branches[0], elements);
	}

	// Union the branches, then read the answer back out of `elements` rather than
	// concatenating. That deduplicates an element two branches both matched and returns
	// everything in walk order, so a two-role selector reads like a one-role selector.
	const matched = new Set<string>();
	for (const branch of selector.branches) {
		for (const element of matchBranch(branch, elements)) {
			matched.add(key(element.path));
		}
	}
	return elements.filter((element) => matched.has(key(element.path)));
}

function matchBranch(steps: Step[], elements: UIElement[]): UIElement[] {
	if (steps.length === 0) {
		return [];
	}

	let current = elements.filter((element) => matchCompound(steps[0].compound, element));

	for (const step of steps.slice(1)) {
		const ancestors = new Set(current.map((element) => key(element.path)));
		const next: UIElement[] = [];

		for (const element of elements) {
			if (!matchCompound(step.compound, element)) {
				continue;
			}
			if (step.combinator === 'child') {
				if (element.path.length > 0 && ancestors.has(key(element.path.slice(0, -1)))) {
					next.push(element);
				}
				continue;
			}
			for (let cut = element.path.length - 1; cut > 0; cut--) {
				if (ancestors.has(key(element.path.slice(0, cut)))) {
					next.push(element);
					break;
				}
			}
		}

		current = next;
	}

	return current;
}

export function querySelectorAll(source: string, elements: UIElement[]): UIElement[] {
	return matchSelector(parseSelector(source), elements);
}
