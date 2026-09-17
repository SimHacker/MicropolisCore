# The Apple ][ floppy as save-file container — a two-way ladder

**Status:** Design. **Monorepo:** MicropolisCore. **Protocol upstream:** moollm [`skills/soul-city/SOUL-BRIDGES.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md). **Same shape as:** the Sims 1 bridge ([OBLITERATOR-TYPESCRIPT.md](../vitamoo/OBLITERATOR-TYPESCRIPT.md) §1.0 L0–L4, §6 layered interchange).

Three of the most interesting bridge targets are Apple ][ titles — [Mind Mirror](../../apps/screen-angel/modules/soul-angel/OUT-OF-GAME-JOBS.yml) (1986), [Little Computer People](federation-peer-games.md#little-computer-people-activision-1985--the-headwater) (Apple ][ version, December 1985), and Wizardry (1981, UCSD Pascal). Building three one-off hacks would produce three dead ends. One layered stack produces a new playable round-trip every time a driver lands, and the layers below the driver are shared.

So: **standardize on the Apple ][ floppy disk image as the container format** — the coin of the realm, the thing that goes into git, the thing a bridge reads and writes. A `.dsk` is to an Apple ][ character what a `Neighborhood.iff` is to a Sims one.

## Why the disk image is the right unit

A floppy image is a complete, self-contained, byte-exact world state in a single file of known size. That gives properties the Sims bridge had to work for:

- **The whole save is one artifact.** No scattered user-data directories, no registry, no installer layout to probe. 140 KB and you have everything the game knows.
- **It diffs and it versions.** A disk image in git with a text export beside it means every session is a commit, and a character's history is `git log`. Some titles rewrite a known block in place — LCP's 256-byte brain — so the binary diff is small and legible.
- **Byte-exactness is the fidelity floor.** Whatever the exporters fail to understand is still in the image, losslessly. Nothing is lost by not yet knowing what it means.
- **It is already how preservation works.** Images are what archives hold and what emulators mount, so the format needs no invention and no negotiation.

## The ladder

Both directions, the same rungs. Each level is independently shippable and testable, and each new driver at the top reuses everything below it — the reason to build it as a stack rather than per game.

| Level | What it knows | What it does not know |
|---|---|---|
| **L0 — sectors** | Image containers and raw addressing: `.dsk`/`.do`/`.po` ordering, `.nib`, `.woz` flux, `.2mg` with headers. Read *and write* tracks and sectors, in memory. | What a file is. |
| **L1 — filesystems** | DOS 3.3 (VTOC, catalog, track/sector lists), ProDOS (volume directories, block files, sparse files), UCSD Pascal p-System (needed for Wizardry-class titles), CP/M and Pascal oddities as they come up. Named-file read, write, create, delete. | What any file means. |
| **L2 — file formats** | Per-format decoders: Applesoft and Integer BASIC tokens, binary with load address, text and random-access text, hi-res and double-hi-res screens, shape tables, DOS-era music and speech data. | Which game this is. |
| **L3 — game and character formats** | Per-title drivers: LCP's brain block, Mind Mirror's personality profile, Wizardry's scenario and roster records. The structures a *game* stores, named in the game's own vocabulary. | Anything about souls. |
| **L4 — soul bridge** | Maps a decoded character onto the portable soul shape and back, under the [role gate](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md), with the same non-destructive discipline as every other bridge. | Bytes. |

**Rule, inherited from the Sims stack:** only L0 touches physical I/O; L1 and above are pure functions over `Uint8Array`. That is what makes the whole ladder run identically in Node, in a browser tab, and inside the emulator's own memory.

**Build order:** L0, then DOS 3.3, then ProDOS, then UCSD Pascal, then one complete vertical through L4. Mind Mirror is the right first vertical — its data is a personality profile, which is already the shape the destination wants.

## The exploded tree

The rung between an image and an editable text file is a directory. A utility mounts the image, walks the filesystem, and writes every file into a POSIX subtree, with a manifest recording where each one came from.

```
characters/mind-mirror/leary-session-01/
  disk.dsk                  # canonical, byte-exact, the thing that boots
  disk.manifest.yml         # image geometry, filesystem, catalog, checksums, provenance
  files/                    # one file per catalog entry, verbatim bytes
    PROFILE.BIN
    HELLO
  decoded/                  # L2 output, regenerable
    HELLO.applesoft.txt
    TITLE.hgr.png
    PROFILE.yml             # L3 output — the part a person edits
```

`decoded/` and `files/` are derived and regenerable; `disk.dsk` and `disk.manifest.yml` are canonical. Same direction of authority as everywhere else: the binary is the truth, the exports are views, and the exports go back down the ladder to become the binary again.

Round-tripping is a **patch, not a rebuild**. Re-encode only the files the author actually touched and write those bytes back into the image, leaving every untouched sector alone — the partial-export discipline from the Sims side (OBLITERATOR-TYPESCRIPT.md §6 manifest and fidelity profiles). A rebuild would silently discard everything the decoders do not yet understand.

**YAML exports are updated, never regenerated.** A person will have written comments in `PROFILE.yml`, and those comments are usually the only record of what a byte means. The exporter merges into the existing file, preserving comments, key order and formatting, and reports anything it could not place. Fieldwork is not overwritten by a tool.

**Other formats where the data is really that:** hi-res screens as PNG, music tables as MIDI, speech and sampled audio as WAV, and shape tables as SVG where the geometry survives it. A picture should arrive as a picture.

## The emulator

Several are worth supporting, and the interface between the bridge and an emulator is small enough that supporting several is cheap: mount an image, run, read the framebuffer, inject keys and paddle input, snapshot, and hand back the mutated image.

| Emulator | Role |
|---|---|
| **apple2js** (TypeScript, MIT) | The primary target. A hackable TypeScript library the bridge can drive directly, and — the reason it wins — one whose in-memory disk buffer we can *write into while it runs*, then reboot in under a second or trigger the game's own load-from-disk. |
| **apple2ts** | Watch. Save-state and time-travel are the features that matter next. |
| **Internet Archive / Emularity + MAME** | Complementary, and the right thing to build on and contribute to rather than around. It already solved running emulators in a browser at scale, legally, with the images preserved. The value added here is the layer above: hackable disk I/O, filesystems, per-game drivers, and the character round-trip. |
| **MAME-wasm alone** | Highest fidelity, but an opaque blob rather than a library. Fine for playing, wrong as the thing a bridge steers. |

## Driving a game that has no API

The floppy is the wide channel, and it is enough for most of what a bridge wants. Where a title only exposes something through its own interface, the bridge drives the interface:

- **Screen scraping.** Text pages are memory at `$400`–`$7FF` in a famously interleaved layout, so text-mode games are directly readable as text. Graphics screens go through the recognizers the rest of the app already uses ([ACCESSIBLIFY.yml](../../apps/screen-angel/ACCESSIBLIFY.yml)).
- **RAM scraping.** With our own emulator, watchpoints on known addresses are available, which is how you observe a value the game never writes to disk.
- **Input synthesis.** Keystrokes and paddles injected at the emulator, and the same events a human generates, which keeps the [dual-drivable invariant](../../apps/screen-angel/OPTICAL-CHANNEL.yml) true down here too: anything the automation does, a person can do by hand, and vice versa.

Order of preference is unchanged: read the disk if the disk knows; watch memory if only the machine knows; drive the keyboard if only the game knows.

## What this unlocks, per driver

| Title | Filesystem | The character data | The errand |
|---|---|---|---|
| **Timothy Leary's Mind Mirror** (1986) | DOS 3.3 | Personality profile and session state | Visit the shrink — a Sim comes back with an edited personality ([OUT-OF-GAME-JOBS.yml](../../apps/screen-angel/modules/soul-angel/OUT-OF-GAME-JOBS.yml)) |
| **Little Computer People** (Apple ][, Dec 1985) | DOS 3.3 | A 256-byte brain block on the C64, seeded by the disk's serial number; the Apple ][ offset still needs finding | Meet the ancestor: read the first computer person off a 1985 disk, live ([federation-peer-games.md](federation-peer-games.md#little-computer-people-activision-1985--the-headwater)) |
| **Wizardry** (1981) | UCSD Pascal | Scenario and roster records | Send a Sim into the dungeon; non-destructive at the soul file, whatever the dungeon does to the copy |

## Legal posture

Unchanged from the other retro bridges: the tooling operates on images the user supplies, nominative use of titles, no ROMs and no game images vendored here. The stack itself is general-purpose Apple ][ infrastructure and useful far outside this project, which is a reason to keep it in its own package with a permissive license rather than tangled into the GPL engine.

## Where the code goes

`packages/apple2-io` — L0 through L2, plus the exploder and the export/patch pipeline, mirroring [`packages/sims-io`](../vitamoo/OBLITERATOR-TYPESCRIPT.md) in layering and naming. L3 drivers live one per title. L4 is a [Soul Bridge plugin](../../apps/screen-angel/modules/soul-angel/SOUL-BRIDGE-SDK.yml) like any other, so the app gains an Apple ][ title the same way it gains any game.

## References

- Sims 1 equivalent, the ladder this copies: [OBLITERATOR-TYPESCRIPT.md](../vitamoo/OBLITERATOR-TYPESCRIPT.md)
- Bridge registry: [GAME-BRIDGES.yml](../../apps/screen-angel/modules/soul-angel/GAME-BRIDGES.yml)
- Peer game survey, including all three Apple ][ targets: [federation-peer-games.md](federation-peer-games.md)
- Protocol, gates, and the errand: moollm [`SOUL-BRIDGES.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/SOUL-BRIDGES.md)
- Emulated runtimes as organelles: moollm [`CHARACTER-ENDOSYMBIOSIS.md`](https://github.com/SimHacker/moollm/blob/main/skills/soul-city/CHARACTER-ENDOSYMBIOSIS.md)
- `.woz` and flux-level imaging: [Applesauce](https://applesaucefdc.com/woz/reference2/)
- LCP's brain block, from its programmer, for the C64 version: [David Crane's email to the Software Preservation Society](https://web.archive.org/web/20250103095311/http://www.softpres.org/article:game:little_computer_people)
- Funding-side framing of the same layers: private notes
