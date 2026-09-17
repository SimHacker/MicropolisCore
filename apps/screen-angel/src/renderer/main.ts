import { mount } from 'svelte';

import App from './App.svelte';
import './app.css';
import { installConsoleToolkit } from './devtools';

// One bundle, two windows. The hash says which one this is: '#overlay' for the
// transparent click-through layer, '#console' for the ordinary window.
const view = location.hash === '#overlay' ? 'overlay' : 'console';

const app = mount(App, {
	target: document.getElementById('app')!,
	props: { view }
});

// Always, not only in development. The console is a supported way to use this app, and a
// toolkit that exists in dev builds is a toolkit nobody can rely on when it matters —
// which is on a real desktop, against a real application, in a packaged build.
installConsoleToolkit(view);

export default app;
