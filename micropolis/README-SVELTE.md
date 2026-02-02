# Micropolis SvelteKit Frontend: Architecture & Vision

This document outlines the architectural approach and vision for the SvelteKit frontend of Micropolis, focusing on leveraging the power of Svelte 5 runes for a truly reactive and modern user experience.

## Core Philosophy: Reactive Simulation Bridge

The central challenge and opportunity is bridging the C++ Micropolis simulation core (compiled to WebAssembly via Emscripten) with a modern web frontend. We aim for an architecture that is:

1.  **Reactive:** UI updates should happen automatically and efficiently in response to state changes within the C++ simulation.
2.  **Encapsulated:** The complexities of Wasm interaction, Embind callbacks, and direct C++ object manipulation should be hidden from the UI components.
3.  **Performant:** The frontend should handle potentially high-frequency updates from the simulator without bottlenecking.
4.  **Modern & Idiomatic:** Leverage the best features of SvelteKit and Svelte 5 for clean, maintainable, and enjoyable development.

## Architecture: The Rune-Powered Store

Inspired by constraint-based UI systems like OpenLaszlo (which powered previous Micropolis web versions), but built with cutting-edge Svelte 5 features, our architecture revolves around a central state management module:

*   **`src/lib/micropolisStore.ts`**: This is **not** a traditional Svelte store (`writable`/`readable`). It's a "store" in the architectural sense – a singleton module managing application state and logic, built entirely with **Svelte 5 runes** (`$state`, `$derived`, `$effect`).
    *   **Responsibilities:**
        *   Manages the lifecycle of the Micropolis Wasm module and the `Micropolis` C++ object instance.
        *   Defines the application's source-of-truth using `$state` runes (e.g., `totalFunds`, `cityName`, `simPaused`, `mapData`).
        *   Computes derived values using `$derived` runes (e.g., `worldWidth`, calculated statistics).
        *   Handles side effects and asynchronous operations using `$effect` (e.g., simulation tick loop, Wasm initialization, WebGL renderer setup).
        *   Exports a clean, reactive API for UI components (read state, call actions like `setSimSpeed`, `doTool`).
*   **`src/lib/ReactiveMicropolisCallback.ts`**: An implementation of the `JSCallback` interface defined via Embind (`js_callback.h`). This class acts as the bridge *from* C++ *to* JavaScript.
    *   When the C++ core emits an event (e.g., funds changed, date updated, map needs redraw), it calls methods on this callback object.
    *   These methods then call internal update functions within `micropolisStore.ts` to modify the appropriate `$state` runes.
*   **Decoupling:** UI components interact *only* with `micropolisStore.ts`. They are completely unaware of `ReactiveMicropolisCallback` or the underlying Wasm/C++/Embind details.

```mermaid
graph LR
    CPP[C++ Micropolis Core (Wasm)] -- Calls callback --> EMBIND[Embind JSCallback Wrapper]
    EMBIND -- Delegates --> RMC[ReactiveMicropolisCallback Instance]
    RMC -- Calls updater --> STORE(micropolisStore.ts)
    STORE -- Updates --> STATE[$state / $derived Runes]
    STATE -- Triggers update --> SVELTE[Svelte 5 Runtime]
    SVELTE -- Updates DOM --> UI[Svelte UI Components (.svelte)]
    UI -- Calls action --> STORE
    STORE -- Calls method --> CPP
```

## Why Svelte 5 Runes? (vs. Svelte 4 / React / etc.)

Svelte 5 runes offer significant advantages for this project:

1.  **True Fine-Grained Reactivity:** When a `$state` variable is updated (e.g., `micropolisStore.totalFunds = newFunds`), Svelte precisely identifies and updates *only* the specific DOM elements that depend on that state. There's no virtual DOM diffing for this core reactivity.
2.  **Efficiency:** This fine-grained approach is ideal for handling frequent updates from the simulation. Crucially, **Svelte automatically prevents updates if a state variable is assigned the same value it already holds**, efficiently handling potential update spam from the C++ core without manual checks.
3.  **Clarity & Simplicity:** `$state`, `$derived`, and `$effect` provide clear, dedicated tools for state, computed values, and side effects, leading to cleaner and more understandable code compared to managing dependencies in React hooks or the boilerplate of older Svelte stores.
4.  **Performance for Complex UIs:** Runes enable advanced performance patterns like **throttled derived state** or effects using `requestAnimationFrame` to create "lazy" UI elements (like a date display that visually updates at a fixed rate, potentially blurring digits to indicate rapid change) that don't overwhelm the browser even when the underlying simulation is running very fast.

We believe this makes Svelte 5 a superior choice over frameworks like React (whose reactivity relies on component re-rendering and VDOM reconciliation) for this type of tightly-integrated, high-performance simulation interface. Micropolis aims to be a compelling showcase for the power and elegance of Svelte 5 runes in complex applications.

## Beyond the Simulator: A Unified SvelteKit Site

The entire web application, including documentation, tutorials, user profiles, multiplayer lobbies, scenario browsers, and potentially save file editors/analyzers, will be built using SvelteKit.

*   **SvelteKit Features:** We will leverage routing, server-side rendering (SSR) or static site generation (SSG) where appropriate, API routes, and other SvelteKit features.
*   **Runes Everywhere:** Runes will be the default way to manage state and reactivity throughout the site, not just in the core simulator view.
*   **Snippets:** Svelte 5 snippets will be used for performant code reuse in UI elements.

## Advanced Features & Future Vision

This reactive architecture provides a foundation for many exciting features:

*   **Independent Save File Handling:** The `micropolisStore` can be extended to load, parse, analyze, and even visualize Micropolis save files (`.cty`) *before* initializing the full C++ simulator, using TypeScript code for file manipulation.
*   **Enhanced Simulation Interface:** Adding more callbacks and API endpoints to the C++ core (minimally invasively) to expose more simulation state and events for richer visualizations and plugin support.
*   **Plugin Architecture:** Supporting JavaScript/TypeScript-based plugins (zones, agents, tools, analysis layers) that react to or manipulate the simulation state via the `micropolisStore`.
*   **Multiplayer:** Implementing lockstep simulation, command serialization, and state synchronization using the store as the central coordinator.
*   **Time Travel:** Exploring features like rollback, replay, and keyframe caching for debugging and analysis.

## Svelte 4 to Svelte 5 Upgrade Plan

The codebase currently contains Svelte 4 patterns.
The migration plan is:

1.  **Core Reactivity First:** Implement and stabilize `micropolisStore.ts` and `ReactiveMicropolisCallback.ts`, ensuring C++ events correctly update `$state` runes.
2.  **Refactor Core Components:** Update `MicropolisView.svelte`, `TileView.svelte`, and related components to consume state and actions exclusively from `micropolisStore.ts`, replacing `onMount`/`onDestroy`/`$: ` with `$effect` and direct rune usage.
3.  **Refactor Layout & Pages:** Update `+layout.svelte`, `+page.svelte`, and other UI elements, migrating Svelte 4 reactivity (`$:`) and lifecycle functions to rune-based equivalents where applicable, using the store for any shared state.
4.  **Adopt Snippets:** Identify opportunities to use Svelte 5 snippets for reusable UI logic.

By tackling the core Wasm bridge first, we establish the reactive foundation needed for a smooth and logical migration of the UI components. 