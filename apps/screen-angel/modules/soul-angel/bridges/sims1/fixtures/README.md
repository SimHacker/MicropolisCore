# One real frame

Everything this bridge claims about reading The Sims 1 was measured on pixels this repository drew.
The font came out of the game and is blended the way the game blends it, the panel geometry came out
of the game's own source, and `panel.png` is a stand-in panel drawn by `tools/render-panel-fixture.ts`.
That makes the reader testable. It does not make it verified.

One screenshot the game itself produced settles it:

```
pnpm --filter @screen-angel/soul-bridge-sims1 verify fixtures/sims-<whatever>.png
```

## What to capture

Any of these is useful. The first is the one that matters.

1. **Windowed, at the default size, with something selected.** Click an object so the description
   strip has text in it — an object with a name, a price and a couple of lines of description is
   ideal, since a long line exercises the wrapping and the strip's right edge.
2. **The other resolution.** The game offers 800x600 and 1024x768. A capture of each is what proves
   the edge-relative geometry rather than merely asserting it, because a top-relative measurement is
   right at one of them and wrong at the other.
3. **Full screen.** Same reading, no window frame, and it tells us whether the anchors survive
   whatever the fullscreen path does to the panel art.
4. **A live conversation.** Sims talking, balloons up, the panel showing a relationship line. That is
   the frame an actual reader will be looking at.

## What matters about the file

- **PNG, not JPEG.** JPEG rings on exactly the hard edges the glyph masks are made of.
- **Native pixels.** No scaling by the capture tool, no Retina doubling, no window-manager zoom. If
  the capture is scaled the tool will find the window anyway and say so — a smooth upscale is located,
  decimated, and reported at low confidence, which is a diagnosis rather than a rescue.
- **The whole frame is fine.** The window does not have to fill it; finding the window inside a larger
  frame is one of the things being tested.

## Reading the output

`the window` is the only line that matters at first. Both finders run every time:

- **art** correlates the game's own panel background against the bottom of the frame, and reports the
  window's edges, the capture scale, and which anchor answered.
- **colours** is the 2004 signature — four corner pixels of the description strip.

If both answer and they agree, the geometry is confirmed. If they disagree, one is wrong and the tests
cannot say which, so look at the frame. If art fails and colours succeeds, the anchors need rebuilding
from this game's own art (`pnpm --filter @screen-angel/soul-bridge-sims1 import-anchors`).

`pixels explained` below about 90% means the reading is a guess wearing a string's clothes. The usual
cause is the wrong font size rather than odd text; `tools/identify-font.ts` compares a crop against
every size the game ships.

`eggs: none` is the correct answer until there is an egg object in the game. The egg numbers in
`../../../../EGGS.yml` are measured on eggs this code drew, and no screenshot of the game as it stands
can confirm them — that needs an egg the game rendered.

## What is here

- `panel.png` — the stand-in panel, drawn and read back by `tools/render-panel-fixture.ts`. Committed
  so a person can see what the machine is matching.
