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
- **Cloud Firestore**: one document per player at `users/{uid}`. Access rules are in
  [`firestore.rules`](../firestore.rules).
- **Google Maps JavaScript API**: map and Street View (`src/app/game/page.js`)

## Code map

```
Frontend/                 <- the actual app (Next.js App Router)
  src/app/
    page.js               home
    login/  lobby/  profile/
    game/                 gameplay: page.js, ScoreScreen.js, result/
    dev/                  scratch map page used during development
  src/components/         shared UI, Firebase setup, audio, settings
  public/                 images, background videos, audio
Firebase/, Project/       original HTML/JS prototype (not used by the Next.js app)
package.json (root)       leftover from the prototype; install from Frontend/
```

## Known issues

- Visiting `/profile` while signed out throws `Cannot read properties of null (reading 'uid')`.
- `src/app/game/page-backup.js` and `Frontend/allfiles.txt` are leftovers.
- `.history/` contains editor auto-save copies committed by accident.
