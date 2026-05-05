# AI Tutor Backend

Backend API for an AI Tutor application with hardened defaults for security, multilingual answers, caching hooks, SSE streaming, and modular AI providers.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- bcrypt + JWT (short access token + hashed refresh rotation)
- express-validator + mongo-sanitize
- Winston logging
- Optional Redis caching (ioredis)
- Gemini (Google AI Studio) OR local Ollama (no vendor lock-in to OpenAI)

## Quick Start

1. Install deps:

```bash
cd backend
npm install
```

2. Configure environment:

Copy `.env.example` to `.env` and fill Mongo + secrets + AI keys.

3. Run:

```bash
npm run dev
```

Health check:

- `GET /api/health`
- `GET /api/health/ready` (DB/Redis readiness)

## Environment

See `.env.example` for the full matrix. Highlights:

| Variable | Meaning |
|---------|---------|
| `CORS_ORIGINS` | comma-separated frontend origins |

| `GEMINI_API_KEY` | Google AI Studio key (recommended “free-ish” tier) |

| `AI_PROVIDER` | `gemini` or `ollama` |

| `REDIS_URL` | optional caching for `/api/ask` |

| `GOOGLE_TRANSLATE_API_KEY` | optional Kannada polish (`KANNADA_POST_TRANSLATE=true`) |

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh` `{ "refreshToken": "..." }`
- `POST /api/auth/logout` (Bearer access token required)

Signup/login responses include:

```json
{
  "success": true,
  "message": "...",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "token": "...",
    "user": {}
  },
  "error": null
}
```

`token` mirrors `accessToken` for backwards compatibility with older mobile clients.

### Ask (blocking JSON)

`POST /api/ask`

```json
{
  "question": "Explain inertia",
  "language": "kn",
  "outputType": "voice"
}
```

Requires `Authorization: Bearer <accessToken>`.

### Ask Streaming (SSE over HTTP)

`POST /api/ask/stream` with identical JSON body.

- Emits `event: token` chunks and final `event: done` payload.
- Use `fetch` + `ReadableStream` on RN/web (EventSource lacks auth headers cleanly).

### History (paginated)

`GET /api/history?page=1&limit=20`

Cursor mode:

- `GET /api/history?cursor=<lastItemId>&limit=20`
- Returns `pagination.nextCursor` for efficient infinite scrolling.

### Voice (TTS)

- Set `TTS_PROVIDER=elevenlabs` + `ELEVENLABS_API_KEY` + voice id(s) in `.env`.
- OR set `TTS_PROVIDER=aws-polly` + AWS credentials/region.
- Voice responses return `tts.audioUrl` as a playable URL (`data:` URL for inline playback, size-gated).

## Tests

```bash
npm test
```

## Postman snippets

See `docs/postman-examples.md`.
