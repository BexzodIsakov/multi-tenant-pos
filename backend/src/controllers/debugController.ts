import { Request, Response } from 'express';
import { getLastWebhookPayload } from '../services/mockPaymentProvider';

export async function replayLastWebhook(_req: Request, res: Response) {
  const last = getLastWebhookPayload();
  if (!last) {
    return res.status(404).json({ error: 'no_webhook_to_replay' });
  }

  const response = await fetch(`http://localhost:${process.env.PORT}/api/webhooks/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Signature': last.signature },
    body: last.payload
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
