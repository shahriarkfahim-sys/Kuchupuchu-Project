import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleSonaiChat } from '../../server/shonaiChat';

type VercelRequest = IncomingMessage & {
  body?: unknown;
  ip?: string;
};

type VercelResponse = ServerResponse & {
  status(code: number): VercelResponse;
  json(body: Record<string, unknown>): void;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  const ip = request.ip || (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : undefined);
  await handleSonaiChat({ body: request.body, ip }, response);
}
