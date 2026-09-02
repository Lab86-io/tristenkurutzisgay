# TRISTEN KURUTZ — SUMMONS

A neon-cyber **gacha-game portfolio**. Instead of scrolling a résumé, visitors sign in,
spend credits to "summon" cards of Tristen's experience, projects, and skills — then
read the full details in the INVENTORY. Built with TanStack Start (React), Tailwind v4,
**Clerk** (accounts) and **Convex** (server-authoritative game state).

## The game

- **Accounts** — sign in (email or Google) via Clerk. Credits, pulls, pity, and
  trophies live in Convex and follow you across devices. No account, no pulls.
- **SUMMON `/`** — spend ◈credits on ×1 (100◈) or ×10 (900◈) pulls. The first summon
  is free and always decrypts the UR operator card (the "about me").
- **Earning credits** — 1000◈ + free UR summon on signup, +600◈/day UPLINK stipend
  (with streaks), dupe refunds (C 20 → UR 500), and trophy payouts (+100◈ → +1000◈).
  Click the ◈ chip in the HUD for the full list.
- **Rarity** — C (50%) → R (30%) → SR (14%) → SSR (5%) → UR (1%).
- **Pity** — SR or better guaranteed every 10 pulls; UR guaranteed at 90.
- **Trophies** — 12 achievements; tracked on the DOSSIER page.
- **INVENTORY `/collection`** — the card gallery. Locked records show as `?` until
  pulled; owned cards open a detail modal (deep-linkable via `?card=<id>`).
- **DOSSIER `/about`** — bio, operator stat bars, education, affiliations, trophies.
- **COMMS `/comms`** — the contact channels themselves are rewards: EMAIL unlocks at
  5 decrypted records, LINKEDIN at 10, GITHUB at 15, and the résumé PDF once you own
  every ROLE card. Recruiters have to play a little.
- Rolls, pity, credit math, and trophy detection all run server-side in Convex
  mutations — the client never computes state. Sound is synthesized with WebAudio
  (no assets) and mutable from the HUD.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, file-based routing,
  type-safe search params)
- [Clerk](https://clerk.com) — accounts; Convex validates the Clerk JWT
  (`convex/auth.config.ts`, JWT template `convex`)
- [Convex](https://convex.dev) — players table + summon/stipend mutations
  (see [`convex/players.ts`](convex/players.ts))
- Tailwind CSS v4
- Biome (lint + format)
- Deployed on Railway via GHCR (Blacksmith CI builds, tests, and pushes the image);
  Convex functions deploy with `npx convex deploy`

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
