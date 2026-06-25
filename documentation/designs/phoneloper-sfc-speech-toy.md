# Phoneloper — expressive speech toy (Stupid Fun Club, ~2003)

**Primary demo:** [Phoneloper Demo](https://www.youtube.com/watch?v=qy5cqV8ypIs) (Don Hopkins, May 2021 walkthrough of the ~2003 tool) — 11:38; key moments: Phoneloper, Phonoscoping, Pitch Tracker.

**SFC context:** [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 — speech synthesis / talking toys / robot brains alongside Empathy, Servitude, and robot one-minute movies.

**HN:** [31418659](https://news.ycombinator.com/item?id=31418659) on [31416098](https://news.ycombinator.com/item?id=31416098) (*NaturalSpeech*) — Don compares Phoneloper to modern TTS markup; links the YouTube demo.

---

## What it was

**Phoneloper** (also spelled *Phonoloper* in the demo) was a **speech-synthesis chatterbot prototype** and expressive-speech **toy/tool** Don Hopkins built for **Will Wright's Stupid Fun Club** (~2003). It sat in the same research lane as SFC **talking toys**, **robot dialog**, and **speech feedback** experiments — not a shipping product, but a constructionist editor for synthetic voice performance.

Stack: **Python + Tkinter + SWIG**, with **CMU Flite** (open-source diphone synthesizer) **modified in C++** so Flite could **import and export** speech as XML **Phonelopes** — timed diphone streams plus pitch and amplitude/inflection curves.

Resume summary: [donhopkins.com/home/resume.html](https://donhopkins.com/home/resume.html) — *Expressive Speech Phonelope Editor* under Stupid Fun Club speech R&D.

---

## Phonelope data model

A **Phonelope** is an XML file representing synthetic speech as editable structure, not opaque audio:

| Layer | Editable in the UI |
| --- | --- |
| **Diphones** | Stretchable segments (phone-to-phone transitions); drag to retime; add/delete |
| **Pitch envelope** | Control points on a curve; drag up/down for inflection; real-time resynthesis |
| **Amplitude / inflection** | Separate track for expressive dynamics |
| **Timing** | Per-segment duration; granular retrigger (hold spacebar → musical/granular loops) |

**Workflow:** type text → **Synthesize** → Flite emits an initial diphone stream + pitch envelope → edit **visually and aurally** (hear changes immediately) → save/load XML Phonelopes.

Not fully automatic: the point was **hands-on sculpting**, closer to an animation timeline than a one-shot TTS API.

---

## Phonoscoping (rotoscope speech)

**Phonoscoping** loads a **captured WAV** (speech or song clip), draws a **spectrogram** behind the pitch track, and runs a simple **pitch tracker** (orange overlay in the demo — “crappy but useful”). You then **stretch diphones** and **drag the pitch curve** to match the reference — rotoscoping **phoneme timing and pitch** onto synthetic speech or **singing**.

Demo examples from the video:

- Herbie Hancock lick → “bow bow bow” timing imported via phonoscope
- Harmonize by shifting pitch track against reference audio
- Bugs Bunny “What’s up, duck?” rotoscope attempt
- Absurdist performance templates (“drunk” button, speed variants, crowd duplication)

Same design space as **manual vocal performance editing** — cruder than Vocaloid, but fun and immediate in 2003.

---

## UI (from demo)

Tkinter **Phonelope Editor** — Stupid Fun Club branding in the window chrome:

- Timeline: **pitch track** (blue curve + nodes) over **diphone/phoneme track** (green segments, phoneme labels)
- Left panel: load/save, **Phonoscope**, synthesize, play/stop
- Bottom sliders: pitch scale, pitch shift, duration scale
- Templates / preset inflections (drunk, speed, insert phrases into other phonelopes)

The demo’s “dude” inflections and cat-meow experiments show the tool as **performance instrument**, not just dictation.

---

## Relation to SFC robots and chatterbots

Phoneloper fed the broader SFC speech stack documented on Don’s resume: ViaVoice / Dragon / SAPI, **XML Robot Dialog Specification**, **Speech Feedback “Robopoetry”**, Festival/Festvox, Flite, **talking toys simulation**. Expressive synthetic speech was meant to loop into **robot personalities** and **feedback loops** — the same era as hidden-camera robot films ([9107206](https://news.ycombinator.com/item?id=9107206) on [9107065](https://news.ycombinator.com/item?id=9107065)).

---

## Future: browser port (MicropolisCore sketch)

**Someday:** reimplement the C++/Flite customizations and Python/Tkinter UI as **TypeScript + Web Audio** (WASM Flite or a modern diphone engine; canvas/Svelte timeline editor; Web Audio API for real-time audition). Goal: a **fun speech toy** in the browser — same playful lane as **[Pink Trombone](https://dood.al/pink-trombone/)** (Neil Thurlwell’s interactive vocal-tract synthesizer): immediate, weird, hands-on voice play rather than cloud TTS.

Not on the critical path for Micropolis sim/runtime; a **companion microworld** aligned with constructionist tooling and Federation “soul-file” expressiveness.

---

## Primary sources

| Source | URL |
| --- | --- |
| YouTube demo | [https://www.youtube.com/watch?v=qy5cqV8ypIs](https://www.youtube.com/watch?v=qy5cqV8ypIs) |
| HN (Don) | [31418659](https://news.ycombinator.com/item?id=31418659) on [31416098](https://news.ycombinator.com/item?id=31416098) |
| Resume | [donhopkins.com/home/resume.html](https://donhopkins.com/home/resume.html) — Phonelope Expressive Speech Synthesizer and Editor |
| SFC timeline + HN catalog | [maxis-ea-shutdown-hn-2015.md](maxis-ea-shutdown-hn-2015.md) §4 |
| Pink Trombone (spiritual cousin) | [dood.al/pink-trombone](https://dood.al/pink-trombone/) |

---

## See also

- [family-album-as-storymaker.md](family-album-as-storymaker.md) — MediaGraph / iLoci map editing (another SFC visual editor lineage)
- [platform-lineage-index.md](platform-lineage-index.md) — Python/Tk → SvelteKit/WebGPU trajectory
- [characters-as-hydrogen.md](characters-as-hydrogen.md) — character voice/expressiveness as federation atom
