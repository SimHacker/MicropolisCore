# 🍲 Playable · Pie · Publishing — a Cauldron

> **Status: Phase 1 (gathering / melting).** This directory is a **cauldron instance**
> — a MOOLLM `cauldron`-skill brew for a large cross-cutting plan. Right now it holds
> one big simmering monolith, [`GATHERING.md`](GATHERING.md). **Do not execute anything
> directly from the gathering doc.** First we *stir* (fold in more requirements, links,
> walk-backs), then we *ladle* out focused topical docs + playbooks/PRs.
>
> **Cauldron skill (the protocol this follows):**
> `moollm/skills/cauldron/` — MELT → STIR* → LADLE → ANCHOR → LINK → TASTE → SERVE.
> See its [`SKILL.md`](https://github.com/SimHacker/moollm/tree/main/skills/cauldron/SKILL.md).

## Why a cauldron

The three things below are **one entangled problem**, not three separate ones — they
share a substrate (a direct-manipulation, pie-navigable, two-way-linked graph of content
and tools), share code (TypeScript, Svelte 5 runes, the render-core holodeck, the command
bus), and share a publishing model (slug/path content plugins, multi-resolution
transclusion across the federation). A cauldron is the right tool: cross-cutting, many
PRs, parallelizable once the shape is known.

## The three pillars (the soup)

1. **Playable game** — turn the simulation-capable Micropolis stack into an actual
   playable city builder (HUD, tool cursor, click-to-build, messages, query, disasters),
   then go beyond classic SimCity. Ground truth:
   [../micropolis-playable-game-readiness.md](../micropolis-playable-game-readiness.md).
2. **Pie / cursor / graph substrate** — a *fresh* Svelte 5 reimagination of pie menus
   (the commented-out prototype predates runes/modern CSS) that works for **both**
   Micropolis tools **and** Sims content, built on the virtual-cursor layer, and
   **generalizing** into a user-editable, "bump-to-connect/disconnect", pie-navigable,
   direct-manipulation **mind-map / memory-palace graph editor + browser + operating
   environment with two-way links.** Canonical model:
   [../piecraft/PIE-MENU-MODEL.md](../piecraft/PIE-MENU-MODEL.md);
   layer: [../virtual-cursor-layer.md](../virtual-cursor-layer.md).
3. **Publishing system** — the content-plugin + transclusion + federation system that
   underlies `donhopkins.com` and `micropolis{web,home,city,dream,federation}.com`.
   Convention: [../content-plugins-and-autodiscovery.md](../content-plugins-and-autodiscovery.md);
   federation design: `DonHopkins/characters/don-hopkins/sites/FEDERATION.md`.

## Files in this cauldron

| File | Role |
|------|------|
| [`GATHERING.md`](GATHERING.md) | **The Phase-1 monolith seed.** The rich soup: requirements, goals, ideas, evidence, and many cross-links. Numbered sections (§1…), Appendix A (design wisdom), Appendix B (open-questions tracker). Grows every STIR turn. |
| *(later)* `playbooks/` | Ladled-out PRs once the monolith is stable (one file per landable PR). |
| *(later)* `NN-*.md` | Topical docs split from the monolith at LADLE time. |

## How to work this cauldron

- **STIR** (now): keep folding new requirements/ideas/links into `GATHERING.md`. Renumber
  freely. Log every decision in Appendix B; keep walk-backs visible (rejected ideas stay,
  marked cancelled). Best on a strong reasoning model (e.g. Opus-class).
- **LADLE** (when §-numbers stop moving for ~3 turns): split into topical docs +
  `playbooks/PB-NN-*.md`, each a single landable PR with Steps/Verify/Rollback.
- **ANCHOR / LINK / TASTE / SERVE**: re-verify code citations, wire bidirectional links,
  smell-test, then commit + dispatch to executors.

**The very first ladle is already pre-scoped:** the minimal playable vertical slice in
[../micropolis-playable-game-readiness.md §6](../micropolis-playable-game-readiness.md#6-prioritized-plan--minimal-playable-vertical-slice)
(Phases A–C) can be ladled into playbooks immediately while the pie/graph and publishing
pillars keep simmering.
