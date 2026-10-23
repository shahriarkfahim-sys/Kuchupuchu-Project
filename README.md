# Kuchupuchu

## Deploy to Vercel

1. Push this repository/branch to GitHub and import it as a Vercel project.
2. Keep the project root as the Vercel root directory. `vercel.json` sets the Vite build command and `dist` output.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` with a valid Gemini API key for Development, Preview, and Production as needed. Optionally set `GEMINI_MODEL` to `gemini-3.5-flash`.
4. Redeploy after changing environment variables. Never commit `.env` or paste a key into source code; `.env.example` is only a placeholder.

The Sonai endpoint is deployed as a Vercel Function at `/api/shonai/chat`. Locally, `npm run dev` runs the same chat handler through the Express development server.

## Current integration limits

- The Ponno checkout UI does not take payments yet. `/api/payments/bkash/create` deliberately returns `503` until a real bKash merchant integration and server-side credentials are configured.
- Sign-in, child records, and routine data are currently client-side/demo state; they are not a production authentication or cloud database service.

## Local checks

```bash
npm run lint
npm run build
```
