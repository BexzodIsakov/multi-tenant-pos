import crypto from 'crypto';

interface WebhookPayload {
  payload: string;
  signature: string;
}

// Used only by the /api/debug/replay-last-webhook route, to demo idempotency
// by resending the same event on purpose. Not a queue, just the last one.
let lastWebhookPayload: WebhookPayload | null = null;

// Stands in for a real payment provider in this take-home; in production this
// HTTP call would originate from the provider's own infrastructure, not ours.
export function simulatePaymentProvider(orderId: string, tenantId: string): void {
  const eventId = crypto.randomUUID();
  const payload = JSON.stringify({ eventId, orderId, tenantId, status: 'paid' });
  const signature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  lastWebhookPayload = { payload, signature };

  setTimeout(async () => {
    try {
      await fetch(`http://localhost:${process.env.PORT}/api/webhooks/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Signature': signature },
        body: payload
      });
    } catch (err) {
      console.error('Mock payment provider request failed', err);
    }
  }, 2000 + Math.random() * 2000);
}

export function getLastWebhookPayload(): WebhookPayload | null {
  return lastWebhookPayload;
}
