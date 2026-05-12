# Lernzy — Tasks plan to finish the project

This document breaks remaining work into phases and trackable tasks. Order matters: foundation first, then pillar MVPs, then moat features (offline, ISL, content graph).

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Engineering baseline (1–2 weeks)

**Goal:** Reliable dev, deploy, and observability before feature velocity.

- [x] **0.1** Document local dev: Expo (LAN vs tunnel, ports), backend `.env`, Mongo/Redis optional. → `docs/LOCAL-DEV.md`
- [x] **0.2** CI: run backend `npm test` on every PR; optional Expo lint/typecheck. → `.github/workflows/ci.yml`, `npm run lint`
- [x] **0.3** Staging/prod: host API (e.g. Render/Fly/AWS), MongoDB Atlas, set `CORS_ORIGINS`, secrets rotation process. → `docs/DEPLOYMENT.md`
- [x] **0.4** Mobile `apiBaseUrl`: `app.json` / `expo.extra` for dev/staging/prod; document physical device setup. → `app.json` `extra.apiBaseUrl`, `docs/LOCAL-DEV.md`
- [x] **0.5** Error boundaries + global API error UX (401 → re-auth, 5xx → friendly copy). → `components/ErrorBoundary.js`, `App.js`, `services/api/http.js`
- [x] **0.6** Backend: health + readiness, auth rate limits, CORS allowlist (already in repo — verify in your env).

---

## Phase 1 — Unified student profile (2–3 weeks)

**Goal:** One source of truth every module reads/writes; unlocks cross-pillar personalization.

- [ ] **1.1** Define **profile schema** (client + server): `userId`, `preferredLanguage`, `board` (NCERT / state), `grade`, `interests[]`, `accessibility` (e.g. sign-preferred), `educationLevel`, optional `locationTier`.
- [ ] **1.2** Backend: extend `User` model + migration strategy; `PATCH /api/auth/me` already exists — align fields.
- [ ] **1.3** Frontend: persist profile in Zustand + hydrate on login; single hook `useStudentProfile()` for screens.
- [ ] **1.4** **Progress events API**: `POST /api/progress/events` (type, module, payload, timestamp) + list for dashboard.
- [ ] **1.5** **Gamification v0**: points field or derived from events; rule: “coding lesson complete → +N points” (configurable).

**Exit criteria:** Math, coding, and chat screens can read interests and grade from one store/API; progress writes one event shape.

---

## Phase 2 — AI tutor: product-complete online path (2–4 weeks)

**Goal:** Best possible **connected** tutor before betting on on-device.

- [ ] **2.1** Curriculum tags on questions (optional `topic`, `board`, `grade`) in ask payload + store in `ChatHistory`.
- [ ] **2.2** History UI in app: paginated list + open past Q&A (consume `/api/history` + cursor).
- [ ] **2.3** Voice mode: wire `outputType: "voice"` + play `tts.audioUrl` when ElevenLabs/Polly configured.
- [ ] **2.4** Offline **degraded** mode: when network fails, show cached last answer or static “practice pack” stub (until Phase 5).
- [ ] **2.5** Content safety: school-appropriate system prompts + blocklist/length limits (already partially via validators — extend as needed).

**Exit criteria:** Student can chat, stream, see history, optional voice; failures never white-screen.

---

## Phase 3 — KahaniGanit (personalized math) MVP (3–5 weeks)

**Goal:** Generated word problems from profile interests — first real “unified profile” win.

- [ ] **3.1** Backend: `POST /api/math/problem` — input `{ grade, topic, interests[], language }` → JSON problem + answer hash or multiple-choice.
- [ ] **3.2** Use existing AI provider with strict JSON schema + validation; store attempts in DB.
- [ ] **3.3** Frontend: replace static `PROBLEM` in `MathtutorScreen` with API-driven flow + loading/error states.
- [ ] **3.4** Adaptive v0: next problem difficulty from last N attempts (simple rules before full ML).
- [ ] **3.5** Kannada/English copy and number formatting per locale.

**Exit criteria:** New problem each session driven by interests; attempts persisted; basic adaptation.

---

## Phase 4 — KodeMaadi (regional coding) MVP (4–6 weeks)

**Goal:** One vertical slice — Kannada (or Hindi) explanations + one runnable environment + localized examples.

- [ ] **4.1** Pedagogy spec: learning objectives for 5–10 micro-modules (variables, lists, loops) tied to **local datasets** (Metro, IPL, KSRTC — start with one).
- [ ] **4.2** Backend: `POST /api/code/explain` — student code + error text → conversational explanation in `preferredLanguage`.
- [ ] **4.3** **Runner choice:** WebView + Skulpt (Python subset) or JS sandbox; document security boundaries.
- [ ] **4.4** Frontend: connect `CodingLabScreen` to real lesson list + editor + run + explain loop.
- [ ] **4.5** Share interests from profile into example generators (same as math).

**Exit criteria:** Complete one module end-to-end in one regional language with real execution and AI help.

---

## Phase 5 — Sign-language bridge MVP (6–10 weeks)

**Goal:** Honest path — either working ISL hand pipeline or clearly scoped “phase 2” with camera UX.

- [ ] **5.1** Product decision: **Path A** real MediaPipe Hands + custom gesture classifier v0, or **Path B** fingerspelling/limited lexicon first.
- [ ] **5.2** Native module or Expo dev client (if required); document iOS/Android build steps.
- [ ] **5.3** On-device: camera frame → landmarks → label + confidence; throttle + battery considerations.
- [ ] **5.4** Backend (optional): upload short clip for server-side model later — **only if** privacy policy allows.
- [ ] **5.5** Reverse path v0: TTS output already partially supported; ISL **animation** can be placeholder clips until licensed assets.
- [ ] **5.6** Align with backend `SIGN_LANGUAGE_COMING_SOON` and remove demo CDN URLs for production.

**Exit criteria:** Demoable loop: gesture → text → (optional) speech; accessibility settings respected.

---

## Phase 6 — Offline tutor + sync (8–12+ weeks)

**Goal:** Match vision — core Q&A on-device when offline; sync when online.

- [ ] **6.1** Spike: run quantized model on Android (vendor docs: ML Kit / ONNX / llama.cpp bindings); measure latency and APK size.
- [ ] **6.2** Local content index: NCERT (or one state board) chunked + embedded or keyword index; RAG on-device.
- [ ] **6.3** Background downloader: Wi‑Fi-only job queue; versioned content packs; storage caps.
- [ ] **6.4** Sync protocol: conflict rules for profile + progress events; idempotent APIs.
- [ ] **6.5** Fallback chain: on-device → LAN Ollama → cloud Gemini (configurable).

**Exit criteria:** Airplane mode: ask question → local answer; reconnect → progress sync without loss.

---

## Phase 7 — Content, curriculum graph, and moat (ongoing)

- [ ] **7.1** License and ingest NCERT / one state board text (legal review).
- [ ] **7.2** Tag graph: concept → grade → language → examples (feeds math + coding + tutor).
- [ ] **7.3** Moderation and child-safety review for all AI surfaces.
- [ ] **7.4** Analytics (privacy-preserving): module usage, drop-offs, without PII in logs.

---

## Phase 8 — GTM & packaging (parallel, not only engineering)

- [ ] **8.1** Freemium matrix: which modules free vs paid (align with your B2B story).
- [ ] **8.2** School/NGO pilot checklist: devices, MDM, offline installer, support playbook.
- [ ] **8.3** Partner integrations (PM eVidya, DIKSHA, ATL) as separate track — APIs and compliance.

---

## Dependency graph (short)

```
Phase 0 baseline
    → Phase 1 profile + progress
         → Phase 2 tutor polish
         → Phase 3 math
         → Phase 4 coding
    Phase 5 sign (can start UI early; native work parallel after Phase 0)
    Phase 6 offline (after Phase 1–2 stable; shares sync with Phase 1)
    Phase 7–8 parallel tracks
```

---

## Suggested immediate next 5 tasks (this sprint)

1. Finalize **profile schema** and migrate `User` + client stores (**1.1–1.3**).
2. Wire **history** in the app (**2.2**).
3. Add **progress event** endpoint and one consumer (e.g. math attempt) (**1.4** + **3.2** stub).
4. Staging deploy + mobile `apiBaseUrl` for staging (**0.3–0.4**).
5. KahaniGit **single** `POST /api/math/problem` + one screen integration (**3.1–3.3** slice).

---

## How to use this doc

- Copy tasks into GitHub Issues / Linear / Jira per phase.
- Mark `[x]` when merged and verified in staging.
- Re-estimate Phase 6 after Phase 3–4 ship — offline scope is the largest unknown.

---

*Last aligned with repo state: unified shell, backend auth/ask/stream/history/TTS hooks, streaming chat client, pillar UIs mostly scaffold.*
