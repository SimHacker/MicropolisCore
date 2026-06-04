# CADroid + cforth: Mitch Bradley's portable Forth as an embedded extension language

## How a 1987 Sun summer-intern project replaced a CAD app's clunky macro language with embedded Forth, and why cforth was designed for exactly that

**Primary sources:** Mitch Bradley's summer-job offer email to Don Hopkins, [19 February 1987](#wmb-job-offer-1987-02-19); Mitch's description of CADroid, [20 February 1987](#wmb-cadroid-1987-02-20); Gudrun Polak's CADroid project description (Sun internal, October 1987); Sun-Spots posting "CADroid for Sun-3?" by Hal Stern (Princeton), 29 October 1986; cforth source at [github.com/MitchBradley/cforth](https://github.com/MitchBradley/cforth).

**Companion docs:** [cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md) (extension-language-driven UIs in a different era) · [pie-menus-fitts-law.md](pie-menus-fitts-law.md) and [gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md) (the pie-menu + NeWS thread that ran adjacent to this project at Sun) · *(forthcoming)* `forth-mitch-bradley-lineage.md`, `extension-languages-and-embedded-vms.md`, `vm-threading-bytecode-ffi.md`.

---

## Summary

In summer 1987, Mitch Bradley hired Don Hopkins as a Sun Microsystems summer intern to rip out the macro/scripting language of *CADroid* -- Sun's internally-used schematic-capture program (originally written at LucasFilm, modeled on Stanford's SUDS) -- and replace it with Mitch's portable C-based Forth (the proto-`cforth`). Mitch's original pitch was much wider in scope: port CADroid to NeWS, dynamically download per-part rendering procs into the NeWS server, drive the UI with pie menus, and use Forth as the macro language. What shipped that summer was the Forth substitution alone: a front-end command processor in Forth, an FFI to CADroid's existing C commands, and a mouse interface. It was integrated into a regular Sun release and used by Sun hardware engineers. Sun then decided in late 1987 to move new work to the commercial VALID system, so the Forth UI was effectively the last substantive feature CADroid received before going into maintenance. The project is a useful early worked example of `cforth`'s design intent: a small embeddable Forth kernel plus a tight FFI wrapping an existing C application's command set, expanded with proper control flow, variables, and macros while preserving the legacy command syntax.

---

## At a glance


| When                 | Event                                                                                                                                                                                                                                                                                                                                                                                                                                     | Source                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 29 Oct 1986          | Hal Stern (Princeton) posts to Sun-Spots asking about CADroid for Sun-3 — sets the public context for the system Don is about to be hired to extend                                                                                                                                                                                                                                                                                       | Sun-Spots posting                                                                     |
| 19 Feb 1987          | Mitch emails Don with the summer-job offer: "Port CADroid to NeWS… dynamically downloading bits of PostScript code into the NeWS server process… Pie menus and Forth as the macro language"                                                                                                                                                                                                                                               | [wmb@sun.com](mailto:wmb@sun.com) → [don@brillig.umd.edu](mailto:don@brillig.umd.edu) |
| 20 Feb 1987          | Mitch describes CADroid: "a marginal schematic drawing system that was written at LucasFilm, mimicing SUDS (Stanford University Drawing System)" — fast on Sun-2, useable macros, full source, 1400+ part bodies                                                                                                                                                                                                                          | [wmb@sun.com](mailto:wmb@sun.com) follow-up                                           |
| 12 Apr 1987          | Don gets the binary tape running locally at UMD ("CADroid works!") on a Sun-3/160 ahead of the summer                                                                                                                                                                                                                                                                                                                                     | [don@brillig.umd.edu](mailto:don@brillig.umd.edu)                                     |
| 15 Jun – 28 Aug 1987 | Don works at Sun's Workstation Division CAD department under Gudrun Polak                                                                                                                                                                                                                                                                                                                                                                 | dated correspondence                                                                  |
| Aug 1987             | Forth-based front-end ships: command processor in Forth, FFI to CADroid's existing C commands, mouse interface, loops, conditionals, variables, expressions, and macros. Integrated into a regular Sun release and used by Sun hardware engineers.                                                                                                                                                                                        | Project description, Oct 1987                                                         |
| End 1987             | Sun decides to retire CADroid in favor of the commercial VALID system. The Forth front-end is the last substantive UI change CADroid receives at Sun.                                                                                                                                                                                                                                                                                     | Gudrun Polak, Apr 1988                                                                |


---

## What CADroid was

CADroid was a schematic-capture editor originally developed at LucasFilm Computer Division (the same division that later spun off into Pixar and was the home of Lucasfilm Games) for board-level circuit design. Its operational model was lifted from Stanford's SUDS (Stanford University Drawing System) — the canonical 1970s academic schematic editor — but with enough of its own quirks to make it identifiably a separate product. Sun acquired source rights and used it internally as the schematics tool for hardware engineering. Mitch's own summary, the day after the job offer:

> CADroid is a marginal schematic drawing system that was written at LucasFilm, mimicing SUDS (Stanford University Drawing System). It has numberous weaknesses and a few overwhelming advantages: a) It is tolerably fast, even on a Sun-2 (some CAD packages seem to require a Sun-3 with a Floating Point Processor and 8 Mbytes); b) It has useable macros; c) We have source code; d) We have a complete set of part libraries in CADroid format; e) We have interfaced it to all of our other design tools, at least well enough to get our job done. — *[wmb@sun.com](mailto:wmb@sun.com), 20 February 1987* 

Translation: CADroid wasn't sophisticated, but it was fast on the cheapest workstation Sun shipped, the source was available so they could fix it themselves, the part library was already populated (1400+ "bodies" by late 1987 per Gudrun), and it had been wired into the rest of Sun's PCB CAD pipeline. It was the kind of in-house tool you keep alive by improving the parts that pinch — and the part that pinched was the macro language.

## The clunky original macro language

CADroid's existing UI was, by 1987 standards, three-modes-grafted-together: keyword-driven typed commands, a menu/cursor selection system, and the mouse. Layered on top was a programming language with typed variables, expression evaluation, control flow, and user-defined functions — Gudrun's project description is generous in calling this "extremely powerful and useful." The honest assessment in the same paragraph:

> the original language was considered too restricted and the existing syntax too clumsy. The implementation poorly coded and hard to modify. — *Project description, October 1987* 

The decision was to throw out the whole front-end (parser, scanner, error recovery, key bindings, control flow, expression evaluation, macros) and replace it with a generic Forth kernel that already had every one of those facilities for free, plus extensibility, a REPL, and the ability to redefine words at runtime — while *keeping* the original command names so existing CADroid drawings, scripts, and muscle memory wouldn't break.

## Mitch's wider 1987 vision

Mitch's actual job-offer email is more ambitious than what shipped, and worth quoting in full because it is a remarkable snapshot of what one Sun engineer could see lined up in February 1987:

> The project: Port CADroid (our schematic design software) to NeWS. The first level port is probably pretty easy, but afterwards it could get quite interesting, because I believe that dramatic performance improvements are possible by dynamically downloading bits of PostScript code into the NeWS server process. For example, the first time a 74LS240 part is encountered, instead of just sending the vectors to draw it, you download a PostScript proc and then call that proc. The next level is to improve the CADroid user interface. Right now the menus and macro language are rather clunky. I envision Pie menus and Forth as the macro language. — *[wmb@sun.com](mailto:wmb@sun.com), 19 February 1987* 

Three threads, all running in parallel inside Mitch's head and at Sun in early 1987:

1. **NeWS as a downloadable-PostScript display server.** Cache the per-part rendering procedure once on the server, then call it for every instance — turning each schematic symbol into a *named PostScript procedure* in the NeWS server's dictionary, dispatched by name from the client. This is the same architectural play James Gosling's NeWS made at the system level (PostScript-as-extension-language for the window server) applied to CAD-specific symbol caching. The technique would later resurface in display-list compilers, Display PostScript, OpenGL display lists, and modern GPU-side compiled shader caches.
2. **Pie menus** as the menu modality, four months before pie menus were even publicly published (CHI '88, May 1988). Don was already actively building pie-menus for X10 `uwm` and would soon implement them in NeWS PostScript on the Lite toolkit. Mitch had been watching that work and saw it as the natural fit for CADroid's high-frequency directional commands.
3. **Forth as the macro language**, embedded in CADroid via a C-callable interface — exactly what cforth was designed for and what would (a year and a half later) become the playbook for OpenBoot and IEEE 1275 OpenFirmware: small embeddable Forth + tight FFI to host C code.

Of those three, the Forth substitution is what shipped. The NeWS port and pie-menu UI were on the wider roadmap but did not make the summer's scope. (Mitch had, separately, started OpenBoot work for Bechtolsheim's SPARCstation 1 around the same time — see Mitch Bradley's [2008 OLPC interview](https://web.archive.org/web/20120118132847/http://howsoftwareisbuilt.com/2008/03/27/interview-with-mitch-bradley-firmware-olpc/), where he says "about 1987, Andy Bechtolsheim … approached me to do some firmware for his new design, which was ultimately going to be the SPARCstation one … And thus was born OpenBoot." So summer 1987 had Mitch running cforth-as-extension-language on CADroid in one window and starting OpenBoot/SunForth for SPARC firmware in the other. cforth itself was older — Bradley Forthware's portable C Forth predates both projects and was the kernel being embedded.)

## What actually shipped

Gudrun's project description is precise about the engineering scope:

> The objective of the project was to replace the complete frontend with a new interface based on the FORTH system. The new frontend uses FORTH's capabilities but preserves most of the original command language. New syntax was defined for loops, conditional statements, variables, expressions, and macros. Extensibility was achieved by extending macro and function capabilities and by using FORTH's underlying layer.
>
> This approach was taken to provide a user friendly extensible language interface without reinventing and rewriting the code for scanning, parsing, error recovery, and key binding.
>
> Don's first assignment was to identify the proper interface inside the CADroid code for FORTH. He then designed and implemented a command processor in FORTH that executes CADroid commands as FORTH subfunctions.
>
> The following step was to add higher level CADroid statements and the mouse interface. Since CADroid structures are not always compatible with FORTH's stack and postfix notation the implementation had to provide the necessary preprocessing and interpretation for some statements.
>
> The implementation was done in C and FORTH. — *Project description, October 1987*

Three engineering phases hidden in those paragraphs:

### Phase 1 — finding the cut line in CADroid's C

The first two weeks of any "embed Forth in someone else's C application" project are spent identifying the seam: which CADroid C functions are *commands* (single user-intent operations like "place part", "rubber-band wire", "rotate", "set scale", "save file"), versus which are internal scaffolding. The commands are the FFI surface. Everything else stays C. This is the same shape of discovery you do today when wrapping a C library for Lua/Python/Wasm — the interface inventory is the engineering deliverable.

### Phase 2 — the command processor in Forth

Each CADroid command becomes a Forth word. Internally, that word marshals arguments off the Forth stack into the form the C function expects, then either CCALLs the C function (cforth's table-FFI pattern: format-string-driven argument marshalling, fixed-arity 12-arg trampoline) or invokes a hand-written C glue function. Once every CADroid command is a Forth word, you immediately get the entire Forth language as the macro language *for free* — `:` `;` defines new commands, `IF` / `BEGIN UNTIL` / `DO LOOP` are control flow, `VARIABLE` / `VALUE` give you typed-by-convention storage, `CREATE` / `DOES>` lets users build their own defining words for new "kinds of thing" (e.g., parametric part definitions). And cforth's REPL is the new command line — type a command, see immediate effect, type a colon definition, store it as a script, save the dictionary.

### Phase 3 — the stack/postfix mismatch and the mouse

The interesting failure mode of "wrap a C app's commands as Forth words" is that the C app's commands often weren't designed with stack discipline in mind. CADroid commands (like SUDS commands) had named flags, optional arguments, multi-modal selectors, mouse-coordinate dependencies, and named groups of related options. Strict RPN with a single data stack doesn't model that well — you end up requiring users to push 7 magic numbers in the right order before each command, which is exactly the ergonomic regression that would defeat the whole project.

Gudrun's wording — *"the implementation had to provide the necessary preprocessing and interpretation for some statements"* — describes the standard fix: a thin parser layer in Forth (using `PARSE-WORD` / `PARSE` and a lookup table of keyword-to-action handlers) that recognizes CADroid's existing command syntax in the input stream, gathers its arguments into a normalized parameter packet on the stack, and *then* dispatches the actual C call. From the user's point of view they're still typing CADroid syntax; underneath, every command is a Forth word that internally consumes its arguments out of the input stream rather than expecting them on the stack. cforth's `WORD` / `PARSE` / `EVALUATE` / `INTERPRET` machinery makes this kind of front-end parsing straightforward — you reuse Forth's outer interpreter as your tokenizer.

The mouse interface is the same idea: every mouse-event callback is bound to a Forth word, executed via `EXECUTE` on the appropriate xt when the C event loop dispatches an event into the Forth side. cforth's continuation/REST primitives (`scr = 3; goto out;` in `inner_interpreter`) and the `KEY`/`KEY?`/`SYS_ACCEPT` callback sentinels (`scr = 2; goto out;` for "no input yet, please call back later") are exactly the embedding hooks that make this work without a second thread.

## The `?[ ][ ]` construct: programming by demonstration in Forth at the CADroid top level

The most original feature of the CADroid Forth front-end was an interactive macro recorder for circuit-board layout. The mechanism was Mitch's invention: a single unified syntax for conditionals, loops, and the zero-iteration case, written `?[ ][ ]`. Four flavours:

```
condition? [ <stuff to do if true> ]

condition? [ <stuff to do if true> ][ <stuff to do if false> ]

count [ <stuff to do in a loop> ]

count [ <stuff to do in a loop> ][ <stuff to do if count is 0> ]
```

The fourth form -- *loop with an else clause* -- folded together what is normally written as `IF count = 0 THEN ... ELSE FOR i = 1 TO count DO ... END` into a single expression where the count itself is the predicate. If the count is zero you get the else-branch; otherwise you get the loop-body executed *count* times. The same brackets serve loops and conditionals, and the only thing distinguishing "loop" from "conditional" is whether the value on top of the stack is a count or a flag. It is one of those rare interface designs where you can't find the seam between the two underlying abstractions because the design has erased the seam.

The mechanism that made it work *interactively* -- as a top-level Forth construct, available outside any colon definition, runnable straight from the CADroid command line -- was Mitch's compilation trick. Compile the body of a `?[ ][ ]` block into a temporary compilation buffer rather than into HERE, with explicit `+LEVEL` and `-LEVEL` words bracketing the buffer scope. Mitch described it later (2022) in an email exchange with Don about the construct:

> *I was very pleased when interpreted conditionals reduced to +LEVEL and -LEVEL plus a temporary compilation buffer. It was one of those "Yes!" moments. I thought of doing temporary compilation at HERE, but that would have prevented usages like `create foo  10 0 do i , loop`*

Compiling at HERE would have collided with normal definitions; the temporary buffer didn't. Don's reply summarised the user-visible behaviour:

> *Didn't CForth in CADroid use that trick of temporarily compiling into here (with an exit appended)? So you could walk through the first pass of a repeat loop, then end the loop, then it would go whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp whomp!*

The "whomp whomp whomp" is the sound of the just-compiled loop body firing for the second through *n*-th iterations, one after another, very fast, in the moment after the user closes the bracket on the first iteration they walked through by hand. Walk through one wire-attachment between two adjacent IC pins by pointing and clicking; close the loop; the remaining 31 wires draw instantly. The general name for this mechanic in the AI literature is [programming by demonstration](https://en.wikipedia.org/wiki/Programming_by_demonstration) (PBD), a [Brad Myers](https://en.wikipedia.org/wiki/Brad_A._Myers)-and-friends research thread of the late 80s. CADroid's `?[ ][ ]` is PBD stated as a sound effect.

Three properties of the CADroid macro recorder made the PBD mechanic actually work in practice:

1. **Movement commands were relative.** A "move two grid squares east" command did not encode an absolute coordinate; it encoded a delta. The same compiled body could be replayed *count* times, each time advancing two squares east from wherever the cursor happened to be, walking down the side of an IC connecting 32 wires to 32 pins from a single one-iteration recording.
2. **Argument prompting with optional runtime deferral.** When a CADroid command being recorded into a macro needed an argument, the system prompted for it. The user could type a constant value (which got baked into the macro at that argument position), or type a *new prompt string* (which got baked in as a deferred argument, re-prompting the user with that custom text on each replay). This was [Gosling Emacs](https://en.wikipedia.org/wiki/Gosling_Emacs)' interactive function-parameter prompts taken seriously: the prompts themselves were first-class data inside the recorded program.
3. **Three modes: live, record-and-execute, deferred-record.** The macro recorder distinguished between (a) normal interactive use, (b) recording while still executing each command live -- used for the *true* branch of a conditional and the body of a loop, so the user saw the effect on the drawing as they recorded -- and (c) recording without executing, used for the *false* branch of a conditional, so the user could specify what to do when the condition was false without actually performing it. The temporary-compilation-buffer trick is what lets all three modes share machinery.

This `?[ ][ ]` syntax, and the temporary-compilation-buffer mechanic that made it work interactively at the Forth top level, made its way out of CADroid and into Mitch's [OpenBoot](https://en.wikipedia.org/wiki/Open_Firmware) Forth -- the firmware that shipped on the [SPARCstation 1](https://en.wikipedia.org/wiki/SPARCstation_1) in 1989, was standardised as [IEEE 1275-1994](https://en.wikipedia.org/wiki/IEEE_1275) ("OpenFirmware"), and was adopted by Apple's PowerPC Macs, IBM's PowerPC servers, and the [OLPC XO](https://en.wikipedia.org/wiki/OLPC_XO). Mitch told Don, when asked in 2018, that the result "made its way into the Open Boot standard, which is the important thing" -- a remark you only earn the right to make casually after you have shipped a multi-billion-dollar piece of platform infrastructure into eight different CPU architectures.

Don wrote up the construct and the technique in two contemporaneous public messages preserved in his archives. The first was on `comp.lang.forth`, in response to a query about Forth systems for the VAX and Sun:

> *I used a version of CForth when I was working for Mitch, summer before last at Sun. It's a very nice Forth system, and quite portable. You can define your own Forth primitives in C, by adding them to this big switch statement! We linked CForth together with a schematics CAD system (CADroid), so you could call the CADroid commands from Forth, and then we wrote a user-friendly extension language in Forth. It accepted postfix commands, and prompted for arguments in English. You could interactively define macros for laying out circuit bodies and wiring them up, by typing commands, pointing with the mouse, selecting from menus, pressing function keys, putting in your own prompts for arguments, binding macros to keys, etc. It also supported interactive loops and conditionals.*

The second was a thank-you note to Elizabeth Rather of Forth Inc. in January 2016, after watching her [Computer Chronicles segment on Forth](https://www.youtube.com/watch?v=D5osk9lrGNg):

> *I worked at Sun Microsystems with Mitch Bradley as his summer intern, where we made a user friendly scripting language for CADroid (a circuit design CAD system from Lucasfilm Droid Works) using Mitch's C-Forth.*

---

## Why this is the canonical cforth case study

cforth's three signature design choices are all justified by the CADroid use case, and reading the cforth source today you can see the fingerprints of a design that came out of summers like this one:


| cforth design choice                                                                                                                  | Why CADroid (and projects shaped like it) wanted it                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switch-threaded inner interpreter in pure C (no inline assembly, no computed goto)                                                    | Embeds in someone else's C codebase with one C compiler — no per-port assembly to maintain, no toolchain demands beyond what the host app already uses.                                                                                                                         |
| Token-threaded with packed offsets (and the optional `T16` flag for compact 16-bit tokens on 64-bit hosts)                            | Saved kernel + library dictionary fits inside a single `.dic` file shipped alongside the host app, mmappable / loadable like any other resource. ROM/RAM-split dictionary (`RAMCT` / `RAMTOKENS`) so the kernel/lib are read-only and user definitions live in writable memory. |
| `CCALL` / `ACALL` table-based FFI with a fixed-arity 12-argument trampoline driven by a format string (`{ i.pin a.adr $ -- s }` etc.) | Wrap dozens of host C commands cheaply, with type-correct argument marshalling, without writing one wrapper per command and without dragging in libffi. The format-string mini-language *is* the wrapper.                                                                       |
| Cooperative tasking (`(pause`, `LINK`/`ASLEEP`)                                                                                       | Run Forth interpretation interleaved with the host application's event loop without threads. Mouse events, keyboard input, and timer callbacks all dispatch into Forth via the same `inner_interpreter()` entry point.                                                          |
| Restartable inner interpreter with sentinel returns (`KEY` returning `−2` → `scr = 2; goto out;`)                                     | The host application's idle/event loop drives Forth; Forth never blocks the host. Same pattern that lets cforth embed in PlatformIO `loop()` on RP2040/Teensy/ESP32 today.                                                                                                      |


CADroid is the *application* shape these features were tuned for: a long-running graphical C program with a command vocabulary, an event loop, a need for user scripting, and a constraint that the scripting layer not eat the host's flash / RAM / event-loop budget. The same shape recurs in every embedded scripting integration since: TCL in CAD tools (Ousterhout's parallel work at Berkeley, ~1988), Lua in game engines (Roberto Ierusalimschy at PUC-Rio, 1993, with similar embedding-first design intent), AppleScript / Frontier in 1990s Mac apps, JavaScript in browsers and game engines, Python's `Py_InitializeEx` / embedded interpreter, Sims Simantics in Maxis's behavior tree engine. cforth is the early, very lean, very Forthy point on that lineage — and CADroid is its case study.

## Outcome

Don delivered the project as scoped: a Forth-based front-end for CADroid implemented in C and cforth, with a command processor that exposes CADroid's existing C commands as Forth words, plus loops, conditionals, variables, expressions, macros, and a mouse interface. It worked, was integrated into Sun's regular CADroid release, and was used by Sun hardware engineers in their schematic-capture work.

A few months later, in early 1988, Sun made the strategic call to retire CADroid in favor of the commercial VALID schematic-and-simulation system. From Gudrun Polak's April 1988 follow-up to Don:

> End of last year we made the decision to discontinue development work on CADroid. It is still used but the dominant system is now the VALID system that is integrated with simulation and timing verification and comes with various interfaces.

So the Forth UI was the last substantive feature CADroid received at Sun before it slid into maintenance mode. The 1400-body part library and the integration with the rest of Sun's PCB tooling -- the advantages Mitch had listed in his February 1987 email -- couldn't compete with VALID's simulation and timing-verification offering. CADroid kept running for the engineers who already knew it; new work moved to VALID.

The technical lineage, however, did not get retired:

- **cforth itself** went on to be used in OLPC's OpenFirmware build, and from there to its current PlatformIO incarnation targeting RP2040, Teensy 3.x/4.0, ESP32, ESP8266, STM32F1/L1, Cortex-M3 / AT91SAM7 / LPC2148, RISC-V GD32VF103, and the Adafruit Feather M0 — see [github.com/MitchBradley/cforth](https://github.com/MitchBradley/cforth).
- **Mitch's parallel OpenBoot/SunForth work**, started the same year for Bechtolsheim's SPARCstation 1, shipped in 1989, was standardized as IEEE 1275-1994 ("OpenFirmware"), and was subsequently adopted by Apple's PowerPC Macintoshes, IBM's PowerPC servers (CHRP), and the OLPC XO. The cforth used at OLPC for high-level scripting and the OpenFirmware kernel doing native DTC at low level are the two surviving descendants of the early Bradley-Forthware C-Forth — one stayed embeddable, the other became firmware.
- **Pie menus + NeWS**, the part of Mitch's 1987 vision that CADroid never received, became the centerpiece of Don's subsequent NeWS work at UMD HCIL and UniPress (Emacs NeWS interface, HyperTIES, the PSIBER Space Deck) — see `[pie-menus-fitts-law.md](pie-menus-fitts-law.md)` and `[gesture-space-and-pie-menus.md](gesture-space-and-pie-menus.md)`.
- **The "embed a small extensible language as the macro/scripting layer of a graphical app"** pattern reappears, with different language choices, in The Sims's Edith / Simantics behavior-tree authoring (compile-time scripting language for runtime behaviors), in modern web apps' embedded JS sandboxes, and now in the LLM-driven computer-use agents covered by `[cua-computer-use-agents-and-simplifier.md](cua-computer-use-agents-and-simplifier.md)` (which is the same problem with a different actuation surface — natural language and pixel scraping replacing typed Forth commands and direct C entry points).

The CADroid summer of 1987 is the early point in this lineage where the embedding pattern was put through a real production application end-to-end -- "wrap your existing C commands as Forth words and you have an extension language" exercised against a working CAD tool used by working engineers, four months before pie menus were public, two years before OpenBoot shipped on the SPARCstation 1, six years before the public C Forth 93 release, and nine years before the IEEE 1275 OpenFirmware standard.

---

## Anchors

- **[wmb@sun.com](mailto:wmb@sun.com) → Don Hopkins, "Summer job", 19 February 1987** -- the original job-offer email containing Mitch's wider vision (NeWS port, dynamic PS download, pie menus, Forth-as-macro-language) and the introduction to Gudrun Polak.
- **[wmb@sun.com](mailto:wmb@sun.com) → Don Hopkins, "Re: Summer job", 20 February 1987** -- Mitch's description of CADroid as a SUDS-clone from LucasFilm with the "marginal but useful" property list.
- **Project description: User Interface for CADroid** (Sun internal, October 1987, by Gudrun Polak) -- the formal write-up of the engineering scope: command processor in Forth, mouse interface, preprocessing for stack-incompatible CAD statements, implementation in C and Forth.
- **Don Hopkins, post on `comp.lang.forth`, late 1980s** -- contemporaneous public write-up of the CADroid Forth front-end, the `?[ ][ ]` syntax, the FFI to CADroid commands via the inner-interpreter switch, and the interactive macro recorder.
- **[Mitch Bradley](mailto:wmb@firmworks.com) → Don Hopkins, 14 December 2022** -- email exchange about the `?[ ][ ]` interactive-conditionals construct, Mitch's "Yes! moment" reducing it to `+LEVEL` / `-LEVEL` plus a temporary compilation buffer, and Don's "whomp whomp whomp" gloss on what the user heard when the loop fired.
- **[Mitch Bradley](mailto:wmb@firmworks.com) → Don Hopkins, 18 May 2018** -- "the result made its way into the Open Boot standard which is the important thing" -- Mitch's confirmation that the CADroid Forth interactive-conditionals trick lived on in OpenBoot/OpenFirmware.
- **Don Hopkins → Elizabeth Rather (Forth Inc.), 22 January 2016** -- thank-you note after the Computer Chronicles segment on Forth; brief retrospective summary of the CADroid+cforth project at Sun.

