# Kuchupuchu

## Deploy to Vercel

1. Push this repository/branch to GitHub and import it as a Vercel project.
2. Keep the project root as the Vercel root directory. `vercel.json` sets the Vite build command and `dist` output.
3. In **Project Settings → Environment Variables**, add `DEEPSEEK_API_KEY` with a valid DeepSeek API key for Development, Preview, and Production as needed. Optionally set `DEEPSEEK_MODEL`; it defaults to `deepseek-chat`.
4. Redeploy after changing environment variables. Never commit `.env` or paste a key into source code; `.env.example` is only a placeholder.

The Sonai endpoint is deployed as a Vercel Function at `/api/shonai/chat`. Locally, `npm run dev` runs the same chat handler through the Express development server. The development-tip endpoint uses the same DeepSeek configuration. API keys must only be stored as server environment variables and never in client-side code.

## Current integration limits

- The Ponno checkout UI does not take payments yet. `/api/payments/bkash/create` deliberately returns `503` until a real bKash merchant integration and server-side credentials are configured.
- Sign-in, child records, and routine data are currently client-side/demo state; they are not a production authentication or cloud database service.
- The signup screen is currently a UI prototype: email/password and Google, Facebook, Apple, and X options lead into profile onboarding, but do not create or authenticate accounts. Passwords are not stored. Connect an authentication backend before enabling real account access.

## Local checks

```bash
npm run lint
npm run build
```
