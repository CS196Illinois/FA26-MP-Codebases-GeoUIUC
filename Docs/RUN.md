# Running GeoUIUC locally

GeoUIUC is a GeoGuessr-style game for campus: you're dropped into a Google Street View
panorama somewhere around UIUC and have to guess where you are on the map.

## Prerequisites

- Node.js **20.9+** (Next.js 16 requirement)
- A Google account (sign-in uses Firebase Auth with Google)
- The project's env values (ask course staff for the shared `.env.local`)

## Setup

```bash
cd Frontend
npm ci
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Other scripts (run from `Frontend/`):

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload (Turbopack) |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | Biome lint + format check |
| `npm run format` | Biome auto-format |
| `npm test` | Unit tests for the difficulty settings (`tests/difficulty.test.mjs`) |
| `npm run test:rules` | Tests `firestore.rules` on a local Firestore emulator; needs [Java 21+](https://adoptium.net). Nothing is deployed |

## Configuration

All config lives in `Frontend/.env.local` (git-ignored). See `Frontend/.env.example`.

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase console → Project settings → Your apps → Web app |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud console → APIs & Services → Credentials |

`NEXT_PUBLIC_*` values are bundled into the browser JavaScript, so they are not secrets.
They are protected by Firebase security rules and API-key restrictions, not by hiding them.

## External services

- **Firebase Authentication**: Google sign-in (`src/components/firebase-config.js`)
- **Cloud Firestore**: one document per player at `users/{uid}`, holding `totalPoints` and a
  best single-round score per difficulty in `highScores` (older accounts may also have a
  single `highScore`, read as the Easy score). Access rules are in
  [`firestore.rules`](../firestore.rules): players can only touch their own document, and
  scores must be possible (0–5000 per round). Scores are still written from the browser, so
  the rules can't stop someone sending a believable fake score. Rule changes only take effect
  once deployed to the Firebase project.
- **Google Maps JavaScript API**: map and Street View (`src/app/game/page.js`)

## Code map

```
Frontend/                 <- the actual app (Next.js App Router)
  src/app/
    page.js               home
    login/  lobby/  profile/
    game/                 gameplay: page.js, GuessMap.js, ScoreScreen.js,
                          difficulty.js (timer + movement per level)
  src/components/         shared UI, Firebase setup, audio, settings
  public/                 images, background videos, audio
  tests/                  npm test / npm run test:rules
firestore.rules           database access rules
firebase.json             emulator config used by npm run test:rules
```

## Known issues

- Visiting `/profile` while signed out throws `Cannot read properties of null (reading 'uid')`.
