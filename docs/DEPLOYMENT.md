# Staging and production deployment

## Backend API

### Hosting options

Common choices: **Render**, **Fly.io**, **Railway**, **AWS ECS/Fargate**, **Google Cloud Run**. Requirements:

- Node 20+
- Persistent env vars (secrets not in git)
- Health checks: `GET /api/health` and optionally `GET /api/health/ready`

### Database

- **MongoDB Atlas** (recommended): create cluster, allowlist hosting provider egress IPs or `0.0.0.0/0` for small projects (tighten later).
- Set **`MONGODB_URI`** in production environment.

### Environment variables (production)

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | Often set by host (e.g. `5000`); ensure app binds correctly |
| `MONGODB_URI` | Atlas SRV connection string |
| `JWT_ACCESS_SECRET` | Strong random string; rotate with dual-sign period if changing |
| `JWT_REFRESH_SECRET` | Separate from access; never commit |
| `CORS_ORIGINS` | Comma-separated **exact** origins (web app, Expo web if used). Wildcard is ignored by backend safeguards — list real origins |
| `REDIS_URL` | Optional; omit if not using Redis |
| `GEMINI_API_KEY` / `AI_PROVIDER` | Or Ollama URL if self-hosted LLM |
| TTS keys | Only if using ElevenLabs / AWS Polly |

### Secrets rotation

1. Generate new JWT secrets in a password manager.
2. Deploy with new secrets during low traffic.
3. All users must re-login (refresh tokens invalidated if you change signing keys deliberately — plan communication).

### CORS

Production frontend URLs must appear in **`CORS_ORIGINS`**. Mobile apps using HTTP often send no `Origin`; CORS mainly affects browser/web. Native requests typically bypass browser CORS.

## Mobile app (Expo)

### Production API URL

Set **`expo.extra.apiBaseUrl`** to your HTTPS API root including `/api`, e.g.:

```json
"extra": {
  "apiBaseUrl": "https://api.yourdomain.com/api"
}
```

Use **EAS Build** env or `app.config.js` to inject per-environment URLs without committing secrets.

### Checklist before release

- [ ] HTTPS only for production API
- [ ] `apiBaseUrl` points to production host
- [ ] Backend `.env` never committed; CI uses repository secrets only
