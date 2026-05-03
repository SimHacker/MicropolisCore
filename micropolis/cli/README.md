# Micropolis CLI

One CLI exposes the Micropolis modules for humans, scripts, terminal agents, and external tools.

```bash
npm run micropolis -- about --format yaml
npm run micropolis -- api --format yaml
npm run micropolis -- city info ../resources/cities/haight.cty --format yaml
npm run micropolis -- city export ../resources/cities/haight.cty --include-map --format csv
npm run micropolis -- sim smoke --ticks 10 --format yaml
npm run micropolis -- bus list --format yaml
```

## Tree

- `entry.ts` registers the top-level command tree.
- `meta/` exposes `about` and `api` introspection.
- `lib/format.ts` handles JSON, YAML, and CSV output.
- `constants/` holds Micropolis constants shared by city-file tools.
- `city/` handles `.cty` parsing, editing, analysis, and visualization.
- `wasm/` exposes headless simulator commands using `src/lib/wasm/node.ts`.
- `bus/` exposes command-bus workflows from the terminal.

Browser startup uses `src/lib/wasm/browser.ts`; Node and browser loaders share heap/view/callback helpers under `src/lib/wasm/`.

Use YAML for LLM-facing structured output, JSON for strict machine consumers, CSV for tabular exports, and text for human terminal inspection.
