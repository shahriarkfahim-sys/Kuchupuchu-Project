import 'dotenv/config';
import express from 'express';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { handleSonaiChat } from './server/shonaiChat';

const app = express();

app.use(express.json({ limit: '24kb' }));
app.post('/api/shonai/chat', (request, response) => {
  void handleSonaiChat({ body: request.body, ip: request.ip }, response);
});
app.post('/api/payments/bkash/create', (_request, response) => {
  response.status(503).json({ error: 'bkash_not_configured' });
});

const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(resolve(process.cwd(), 'dist')));
  app.get('*', (_request, response) => response.sendFile(resolve(process.cwd(), 'dist/index.html')));
} else {
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Kuchupuchu is running at http://localhost:${port}`);
});
