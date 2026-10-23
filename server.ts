import 'dotenv/config';
import express from 'express';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { handleSonaiChat } from './server/shonaiChat';

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(express.json({ limit: '24kb' }));

app.post('/api/shonai/chat', (request, response) => {
  void handleSonaiChat({ body: request.body, ip: request.ip }, response);
});

app.post('/api/payments/bkash/create', (_request, response) => {
  response.status(503).json({ error: 'bkash_not_configured' });
});

app.post('/api/ai/development-tip', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY') {
    res.status(503).json({ error: 'Gemini API key is not configured.' });
    return;
  }

  const ageMonths = Number(req.body?.ageMonths);
  const language = req.body?.language === 'bn' ? 'bn' : 'en';

  if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > 24) {
    res.status(400).json({ error: 'A valid age from 0 to 24 months is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const outputLanguage = language === 'bn' ? 'Bangla' : 'English';
    const prompt = [
      `Give one warm, practical, age-appropriate play or caregiving idea for a baby aged ${ageMonths} months.`,
      `Reply in ${outputLanguage}, in 2-4 short sentences. Be reassuring, avoid diagnosing or claiming a milestone is guaranteed, and do not provide medical advice. Suggest contacting a pediatrician for health concerns.`,
    ].join('\n');

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
    });
    const tip = result.text?.trim();

    if (!tip) {
      res.status(502).json({ error: 'Gemini returned an empty response.' });
      return;
    }
    res.json({ tip });
  } catch (error) {
    console.error('Gemini request failed:', error);
    res.status(502).json({ error: 'Gemini request failed.' });
  }
});

if (isProduction) {
  const distPath = resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(resolve(distPath, 'index.html')));
} else {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Kuchupuchu server listening on http://localhost:${port}`);
});
