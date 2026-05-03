import { describe, expect, it } from 'vitest';
import { CommandBus } from './CommandBus';

describe('CommandBus metadata', () => {
	it('assigns stable i18n keys from command ids', () => {
		const bus = new CommandBus();
		bus.register({
			id: 'test.say-hello',
			label: 'Say Hello',
			description: 'Greets the user',
			group: 'Test',
			run: () => undefined
		});

		const command = bus.get('test.say-hello');
		expect(command?.labelKey).toBe('commands.test.say-hello.label');
		expect(command?.descriptionKey).toBe('commands.test.say-hello.description');
		expect(command?.groupKey).toBe('commands.test.say-hello.group');
	});
});
