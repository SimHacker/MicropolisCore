import { commandBus, type Command, type CommandContext } from './CommandBus';
import type { MicropolisSimulator } from './MicropolisSimulator';
import type { TileRenderer } from './WebGLTileRenderer';

export interface MicropolisCommandContext extends CommandContext {
  simulator?: MicropolisSimulator | null;
  tileRenderer?: TileRenderer<unknown> | null;
  tileLayersLength?: number;
  heatFlowRangeLow?: number;
  heatFlowRangeHigh?: number;
}

const keyFramesPerSecondValues = [1, 5, 10, 30, 60, 120, 120, 120, 120];

let registered = false;

export function registerMicropolisCommands(): void {
  if (registered) return;
  commandBus.registerAll(createMicropolisCommands());
  registered = true;
}

function createMicropolisCommands(): Command<MicropolisCommandContext>[] {
  return [
    {
      id: 'sim.toggle-pause',
      label: 'Pause / Resume',
      icon: 'pause',
      context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
      shortcut: '0',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasSimulator,
      preview: ({ simulator }) => ({
        label: simulator?.paused ? 'Resume simulation' : 'Pause simulation',
      }),
      run: ({ simulator }) => {
        if (!simulator) return;
        simulator.setPaused(!simulator.paused);
      },
    },
    ...keyFramesPerSecondValues.map((_, index): Command<MicropolisCommandContext> => ({
      id: `sim.set-speed-${index + 1}`,
      label: `Speed ${index + 1}`,
      icon: 'speed',
      context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
      shortcut: String(index + 1),
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasSimulator,
      preview: () => ({
        label: `Run simulation at speed ${index + 1}`,
      }),
      run: ({ simulator }) => {
        if (!simulator) return;
        simulator.setGameSpeed(index);
        simulator.setPaused(false);
      },
    })),
    {
      id: 'city.generate-random',
      label: 'Generate Random City',
      icon: 'random',
      context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
      shortcut: '\\',
      policy: { risk: 'destructive', allowLLM: true, requiresApproval: true },
      enabled: hasMicropolis,
      preview: () => ({
        label: 'Generate a new random terrain and city',
        message: 'This changes the current city. Wire through undo/checkpoints before exposing broadly.',
      }),
      run: ({ simulator }) => {
        if (!simulator?.micropolis) return;
        simulator.micropolis.generateSomeRandomCity();
        simulator.render();
      },
    },
    {
      id: 'city.load-by-letter',
      label: 'Load City by Letter',
      icon: 'folder-open',
      context: ['keyboard'],
      policy: { risk: 'destructive', allowLLM: false, requiresApproval: true },
      enabled: (context) => hasMicropolis(context) && typeof context.args?.letter === 'number',
      preview: ({ simulator, args }) => {
        const letter = Number(args?.letter ?? 0);
        const city = simulator?.cityFileNames[letter % (simulator.cityFileNames.length || 1)];
        return { label: city ? `Load ${city}` : 'Load city' };
      },
      run: ({ simulator, args }) => {
        if (!simulator?.micropolis) return;
        const letter = Number(args?.letter ?? 0);
        const city = simulator.cityFileNames[letter % (simulator.cityFileNames.length || 1)];
        simulator.micropolis.loadCity(city);
        simulator.render();
      },
    },
    {
      id: 'tile-set.next',
      label: 'Next Tile Set',
      icon: 'tiles',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: '=',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: ({ simulator, tileRenderer, tileLayersLength }) => {
        if (!simulator || !tileRenderer || !tileLayersLength) return;
        simulator.fillMopTiles((tileRenderer.tileLayer + 1) % tileLayersLength);
        simulator.render();
      },
    },
    {
      id: 'tile-set.previous',
      label: 'Previous Tile Set',
      icon: 'tiles',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: '-',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: ({ simulator, tileRenderer, tileLayersLength }) => {
        if (!simulator || !tileRenderer || !tileLayersLength) return;
        simulator.fillMopTiles((tileRenderer.tileLayer + tileLayersLength - 1) % tileLayersLength);
        simulator.render();
      },
    },
    {
      id: 'tile-layer.next',
      label: 'Next Tile Layer',
      icon: 'layers',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: 'plus',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: ({ simulator, tileRenderer, tileLayersLength }) => {
        if (!simulator || !tileRenderer || !tileLayersLength) return;
        tileRenderer.tileLayer = (tileRenderer.tileLayer + 1) % tileLayersLength;
        simulator.render();
      },
    },
    {
      id: 'tile-layer.previous',
      label: 'Previous Tile Layer',
      icon: 'layers',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: '_',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: ({ simulator, tileRenderer, tileLayersLength }) => {
        if (!simulator || !tileRenderer || !tileLayersLength) return;
        tileRenderer.tileLayer = (tileRenderer.tileLayer + tileLayersLength - 1) % tileLayersLength;
        simulator.render();
      },
    },
    {
      id: 'sim.toggle-heat',
      label: 'Toggle Cellular Automata',
      icon: 'heat',
      context: ['view', 'keyboard', 'pie-menu', 'llm'],
      shortcut: ' ',
      policy: { risk: 'reversible', allowLLM: true, requiresApproval: true },
      enabled: hasView,
      preview: ({ simulator }) => ({
        label: simulator?.micropolis?.heatSteps ? 'Stop cellular automata' : 'Start cellular automata',
      }),
      run: ({ simulator, tileRenderer, heatFlowRangeLow = 4, heatFlowRangeHigh = 100 }) => {
        const micropolis = simulator?.micropolis;
        if (!simulator || !micropolis || !tileRenderer) return;

        if (micropolis.heatSteps) {
          simulator.rotateMapTiles(tileRenderer.tileRotate);
          tileRenderer.tileRotate = 0;
          micropolis.heatSteps = 0;
        } else {
          tileRenderer.tileRotate = Math.floor(Math.random() * 960);
          simulator.rotateMapTiles(-tileRenderer.tileRotate);
          micropolis.heatSteps = 1;
          if (Math.random() < 0.75) {
            micropolis.heatRule = 0;
            micropolis.heatFlow = Math.round(
              ((Math.random() * 2.0) - 1.0) *
              (Math.random() < 0.75 ? heatFlowRangeLow : heatFlowRangeHigh),
            );
          } else {
            micropolis.heatRule = 1;
          }
        }

        simulator.render();
      },
    },
    {
      id: 'view.pan-left',
      label: 'Pan Left',
      icon: 'arrow-left',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: 'arrowleft',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => panBy(context, -1, 0),
    },
    {
      id: 'view.pan-right',
      label: 'Pan Right',
      icon: 'arrow-right',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: 'arrowright',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => panBy(context, 1, 0),
    },
    {
      id: 'view.pan-up',
      label: 'Pan Up',
      icon: 'arrow-up',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: 'arrowup',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => panBy(context, 0, -1),
    },
    {
      id: 'view.pan-down',
      label: 'Pan Down',
      icon: 'arrow-down',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: 'arrowdown',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => panBy(context, 0, 1),
    },
    {
      id: 'view.zoom-in',
      label: 'Zoom In',
      icon: 'zoom-in',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: ',',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => zoomBy(context, 1.025),
    },
    {
      id: 'view.zoom-out',
      label: 'Zoom Out',
      icon: 'zoom-out',
      context: ['view', 'keyboard', 'pie-menu'],
      shortcut: '.',
      policy: { risk: 'safe', allowLLM: true },
      enabled: hasView,
      run: (context) => zoomBy(context, 0.975),
    },
    {
      id: 'tax.decrease',
      label: 'Decrease Tax',
      icon: 'tax-down',
      context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
      shortcut: '[',
      policy: { risk: 'reversible', allowLLM: true, requiresApproval: true },
      enabled: hasMicropolis,
      run: ({ simulator }) => {
        const micropolis = simulator?.micropolis;
        if (!micropolis) return;
        micropolis.setCityTax(Math.max(0, micropolis.cityTax - 1));
      },
    },
    {
      id: 'tax.increase',
      label: 'Increase Tax',
      icon: 'tax-up',
      context: ['simulator', 'keyboard', 'pie-menu', 'chat', 'llm'],
      shortcut: ']',
      policy: { risk: 'reversible', allowLLM: true, requiresApproval: true },
      enabled: hasMicropolis,
      run: ({ simulator }) => {
        const micropolis = simulator?.micropolis;
        if (!micropolis) return;
        micropolis.setCityTax(Math.min(20, micropolis.cityTax + 1));
      },
    },
    {
      id: 'recorder.mark',
      label: 'Record Marker',
      icon: 'record',
      description: 'Safe diagnostic command for testing command recording without mutating simulator state.',
      context: ['script', 'cli', 'mcp', 'llm'],
      policy: { risk: 'safe', allowLLM: true },
      preview: ({ args }) => ({
        label: 'Record a diagnostic marker',
        message: typeof args?.message === 'string' ? args.message : undefined,
      }),
      run: ({ args }) => ({
        handled: true,
        message: typeof args?.message === 'string' ? args.message : 'Recorded diagnostic marker',
        data: args,
      }),
    },
  ];
}

function hasSimulator(context: MicropolisCommandContext): boolean {
  return !!context.simulator;
}

function hasMicropolis(context: MicropolisCommandContext): boolean {
  return !!context.simulator?.micropolis;
}

function hasView(context: MicropolisCommandContext): boolean {
  return !!context.simulator && !!context.tileRenderer;
}

function panBy(context: MicropolisCommandContext, dx: number, dy: number): void {
  const { simulator, tileRenderer } = context;
  if (!simulator || !tileRenderer) return;

  const scale = Number(context.args?.scale ?? 1);
  tileRenderer.panBy((dx * scale) / tileRenderer.zoom, (dy * scale) / tileRenderer.zoom);
  simulator.render();
}

function zoomBy(context: MicropolisCommandContext, zoomFactor: number): void {
  const { simulator, tileRenderer } = context;
  if (!simulator || !tileRenderer) return;

  tileRenderer.zoomBy(zoomFactor);
  simulator.render();
}
