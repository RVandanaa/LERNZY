# AI Tutor Backend

Production-ready backend for an AI Tutor application with:

- JWT authentication
- AI answer generation
- English/Kannada response support
- Text-to-speech response payloads
- Sign-language gesture payloads
- Learning history storage

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- dotenv

## Project Structure

```
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
  docs/
  .env.example
  package.json
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and update values.
3. Start MongoDB locally (or use cloud MongoDB URI).
4. Start backend:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example`.

## API Endpoints

### 1) Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### 2) AI Tutor

- `POST /api/ask` (requires Bearer token)

Body:

```json
{
  "question": "What is photosynthesis?",
  "language": "kn",
  "outputType": "voice"
}
```

### 3) History

- `GET /api/history?limit=20` (requires Bearer token)

## Postman Test Examples

Detailed collection-style request samples are available in:

- `docs/postman-examples.md`

## Notes

- If `OPENAI_API_KEY` is not provided, app automatically uses a safe fallback answer template.
- `outputType=voice` returns an audio URL payload.
- `outputType=sign-language` returns structured gesture data for scalable animation integration.
