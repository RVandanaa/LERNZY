# Local development

## Prerequisites

- Node.js 20 LTS (recommended)
- MongoDB local or Docker, or MongoDB Atlas connection string
- For mobile: Expo Go on a physical device, or Android Emulator / iOS Simulator

## Repository layout

- **`/`** — Expo (React Native) app
- **`/backend`** — Express API (`npm start` → `src/index.js`)

## Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CORS_ORIGINS
npm install
npm test
npm start
```

Default port is **`5001`** if set in `.env` (`PORT=5001`), matching the mobile dev defaults in `constants/api.js`.

- **Redis** (`REDIS_URL`) — optional; improves `/api/ask` caching.
- **Health:** `GET http://localhost:5001/api/health`
- **Readiness:** `GET http://localhost:5001/api/health/ready` (Mongo + Redis status)

## Expo (mobile)

From repo root:

```bash
npm install
npx expo start
```

### Connection modes

| Mode | When to use |
|------|----------------|
| **LAN** | Phone and PC on same Wi‑Fi; stable for daily dev. |
| **Tunnel** | Different networks or restrictive Wi‑Fi; uses ngrok (`exp.direct`). Can be flaky — restart Metro if tunnel drops. |
| **localhost** | Simulator/emulator on same machine only. |

Useful flags:

```bash
npx expo start --lan --clear --port 8082
```

If port **8081** is busy, specify another port (`8082`) and connect Expo Go to the URL Metro prints.

### Physical Android device

- Emulator: API base uses **`http://10.0.2.2:<PORT>/api`** (maps to host loopback).
- USB device: prefer **LAN** URL with your PC’s LAN IP, or set **`apiBaseUrl`** in `app.json` → `expo.extra` (see below).

### Physical iOS device

- **`localhost`** in code points to the phone itself — use your computer’s **LAN IP** (e.g. `http://192.168.1.10:5001/api`) via `expo.extra.apiBaseUrl`.

## API base URL (`apiBaseUrl`)

Resolved in `constants/api.js`:

1. If `app.json` → `expo.extra.apiBaseUrl` is a non-empty string → use it (staging/production builds).
2. Else in **`__DEV__`**, platform defaults apply (`10.0.2.2` / `localhost`).
3. Else production placeholder until you set `extra.apiBaseUrl` for release builds.

Example `app.json` snippet for a device hitting your PC:

```json
"extra": {
  "apiBaseUrl": "http://192.168.1.50:5001/api"
}
```

Rebuild or reload after changing `extra` (clear cache if needed: `npx expo start -c`).

## Troubleshooting

- **`Could not connect to development server`** — Tunnel died or wrong port; try LAN, fixed `--port`, same Wi‑Fi, disable VPN.
- **`MONGODB_URI is required`** — Backend `.env` missing or incomplete.
- **CORS errors** — Add your Expo web origin or LAN URL to `CORS_ORIGINS` in backend `.env` (comma-separated).
