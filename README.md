# TRISTEN KURUTZ — SUMMONS

A neon-cyber **gacha-game portfolio**. Instead of scrolling a résumé, visitors spend
credits to "summon" cards of Tristen's experience, projects, and skills — then read
the full details in the DATABASE. Built with TanStack Start (React), Tailwind v4,
and zero backend: all game state lives in `localStorage`.

## The game

- **SUMMON `/`** — spend ◈credits on ×1 (100◈) or ×10 (900◈) pulls. The first summon
  is free and always decrypts the UR operator card (the "about me").
- **Rarity** — C (50%) → R (30%) → SR (14%) → SSR (5%) → UR (1%).
- **Pity** — SR or better guaranteed every 10 pulls; UR guaranteed at 90.
- **Dupes** — auto-refund credits (C 20 / R 40 / SR 80 / SSR 200 / UR 500).
- **UPLINK** — daily +600◈ stipend in the HUD, with a streak counter.
- **Trophies** — 12 achievements (first SSR, collection milestones, full sets,
  7-day streak…) that pay out bonus credits; tracked on the DOSSIER page.
- **DATABASE `/collection`** — the card gallery. Locked records show as `?` until
  pulled; owned cards open a detail modal (deep-linkable via `?card=<id>`).
- **DOSSIER `/about`** — bio, operator stat bars, education, affiliations, trophies.
- **COMMS `/comms`** — email (copy button), LinkedIn, GitHub, and the résumé PDF.
- Everything is client-side; no data leaves the browser. Sound is synthesized with
  WebAudio (no assets) and mutable from the HUD.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing,
  type-safe search params)
- Tailwind CSS v4
- Biome (lint + format)
- Deployed on Railway via GHCR (Blacksmith CI builds, tests, and pushes the image)

## Development

```sh
pnpm install
pnpm dev            # dev server on :3000
pnpm check          # biome lint + format
pnpm build          # production build (.output)
pnpm preview        # serve the build
pnpm generate-routes
```

## Card data

The card pool lives in [`src/data/cards.ts`](src/data/cards.ts) — rarity, pull
weights, descriptions, and links all come from there. The game engine (pity,
weights, credits, persistence) is [`src/lib/gacha.ts`](src/lib/gacha.ts).
