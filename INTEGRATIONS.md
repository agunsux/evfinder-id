Integrations Guide — Google AI Studio / Antigravity / OpenAI (Codex)

Goal
- Show how to connect this repo to external model/hosting platforms for TTS or model inference.
- Provide safe, server-side patterns (avoid embedding secret keys in the client).

Notes
- Never commit secrets to the repo. Use environment variables or secret managers.
- Prefer server-side proxy endpoints for calling cloud model APIs to keep keys hidden and to add rate-limit, retry, and auditing logic.

1) Google AI Studio / Vertex AI (Recommended for Google TTS or model hosting)

Overview
- Use Google Cloud project + Vertex AI (or AI Studio) to host a TTS model or run generative models.
- Authenticate using a Service Account key (JSON) and either: (a) exchange for an access token on a server, or (b) run model calls from a backend running on GCP (Cloud Run, App Engine) with attached service account.

Required setup
- Google Cloud Console: create or pick a project.
- Enable Vertex AI (or the relevant AI Studio APIs) and Cloud IAM.
- Create a Service Account with roles: `Vertex AI Admin` (or more limited: `Vertex AI User`), and `Storage Object Viewer` if you store artifacts in GCS.
- Generate a JSON key for the service account and store it securely (do NOT put in the repo).

Env vars (server-side)
- `GCP_PROJECT_ID`=your-project-id
- `GCP_SA_KEY_JSON`=path to service-account.json (on host) or set up Google Application Default Credentials
- `GCP_TTS_MODEL`=optional model name

Server-side pattern (Node.js)
- Use the Google Auth library to obtain an access token for the service account, then call the Vertex AI or TTS REST API.
- Example (pseudo):
  - load key or rely on ADC
  - request access token
  - POST to Vertex AI text-to-speech/generate endpoint with Authorization: Bearer <token>

Security notes
- Run all calls to Google APIs from a backend you control.
- If you deploy to Cloud Run, bind the service account directly to avoid managing JSON keys.

2) Antigravity (generic inference-hosting platform)

Overview
- "Antigravity" may refer to a third-party inference/hosting platform. The generic integration steps are:

Required setup
- Get an API endpoint URL and an API key/secret from the platform dashboard.
- Decide if you will call the endpoint from the client (only for public safe endpoints) or from your backend (recommended).

Env vars (server-side)
- `ANTIGRAVITY_API_URL`=https://api.antigravity.example/v1/infer
- `ANTIGRAVITY_API_KEY`=sk-xxxx

Server-side request example (fetch)
- Build a small server endpoint `/api/ttsinvoke` that:
  - Reads user text, optional voice settings.
  - Calls the `ANTIGRAVITY_API_URL` with `Authorization: Bearer ${ANTIGRAVITY_API_KEY}`.
  - Receives base64 audio or an audio URL, and forwards to the client (or returns a signed URL).

Client-side
- Call your `/api/ttsinvoke` with POST and play the returned audio via an object URL.

Security notes
- Keep the key server-side. Add rate-limiting and usage quotas.

3) OpenAI / Codex (code models / text-to-speech endpoints)

Overview
- If you want to use OpenAI (Codex or newer models), create an API key from platform.openai.com and call the relevant inference endpoint from your server.

Env vars (server-side)
- `OPENAI_API_KEY`=sk-...
- `OPENAI_API_BASE`=https://api.openai.com (or custom)
- `TTS_PROVIDER`=openai

Server-side request pattern
- Create an endpoint `/api/openai/tts`:
  - Accepts text and voice params
  - Calls OpenAI API endpoint with `Authorization: Bearer ${OPENAI_API_KEY}`
  - Returns audio (base64) or a streaming response

Example (pseudo fetch):
- POST /api/openai/tts
- Response: { audioContent: "<base64>" }

Client playback
- Convert base64 to Blob and `URL.createObjectURL(blob)` then set `audio.src`.
- Handle autoplay policies: prefer user gesture or muted autoplay fallback.

Explicit external-TTS route
- This repo also supports `/api/external-tts`.
- Send body fields like `text`, `voice`, `provider` (openai or antigravity), and any optional settings.
- Use `/api/external-tts` when you want a provider-specific call instead of the default `TTS_PROVIDER`.

CI/CD / GitHub integration (optional)
- Add GitHub Actions workflow to deploy backend (Cloud Run / Vercel / Netlify) on push to `main`.
- Use GitHub Secrets to store the cloud provider keys and API keys.

Sample Github Actions outline
- name: Deploy
  on: push
  jobs:
    build-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Install
          run: npm ci
        - name: Build
          run: npm run build
        - name: Deploy to Cloud Run
          uses: google-github-actions/deploy-cloudrun@v0
          with: ... (uses GCP credentials stored in secrets)

Checklist before connecting
- Decide which platform will host the model (Google AI Studio, Antigravity, OpenAI).
- Prepare server-side endpoints to hold secrets.
- Store API keys in environment variables or secret managers.
- Test with small sample text to validate audio format and playback.

Next steps I can do for you
- Create a server-side `/api/ttsinvoke` example (Node + Express) that supports Google AI Studio / Antigravity / OpenAI toggles.
- Add a GitHub Actions workflow to deploy to Cloud Run or Vercel.
- Generate example env files and `.env.example`.

Tell me which of the above you want me to scaffold first (e.g., "create Node server endpoint + .env.example" or "add GH Actions deploy to Cloud Run").
