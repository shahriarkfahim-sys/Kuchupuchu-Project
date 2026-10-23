import type { IncomingMessage, ServerResponse } from 'node:http';

type PaymentRequest = IncomingMessage;
type PaymentResponse = ServerResponse & {
  status(code: number): PaymentResponse;
  json(body: Record<string, string>): void;
};

export default function handler(request: PaymentRequest, response: PaymentResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  response.status(503).json({ error: 'bkash_not_configured' });
}
