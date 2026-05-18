# Deployment Guide

This repo uses Google Cloud Run for deployment and includes GitHub Actions automation.

## Required GitHub Secrets
- `GCP_PROJECT_ID`: Google Cloud project ID
- `GCP_SA_KEY`: Google service account JSON content
- `CLOUD_RUN_SERVICE`: Cloud Run service name
- `CLOUD_RUN_REGION`: Cloud Run region (e.g. us-central1)

## Local deployment
1. Install dependencies
```bash
npm ci
```
2. Build the app
```bash
npm run build
```
3. Start locally
```bash
npm run start
```

## GitHub Actions deploy
The workflow is at `.github/workflows/deploy-cloud-run.yml`.
It builds the app, submits a container to Cloud Build, and deploys to Cloud Run.

## Environment
Use `.env.example` as a starting template for local development and server-side secrets.

## TTS provider selection
Set `TTS_PROVIDER` to one of:
- `google`
- `openai`
- `antigravity`

For example:
```env
TTS_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com
```