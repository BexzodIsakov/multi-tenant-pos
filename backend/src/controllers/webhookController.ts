import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { PaymentEvent } from '../models/PaymentEvent';
import { verifySignature } from '../utils/signature';

interface WebhookPayload {
  eventId?: string;
  orderId?: string;
  tenantId?: string;
  status?: string;
}

export async function handlePaymentWebhook(req: Request, res: Response) {
  const signature = req.headers['x-signature'];
  const rawBody = req.body as Buffer;

  if (!signature || typeof signature !== 'string' || !verifySignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: 'malformed_payload' });
  }

  const { eventId, orderId, tenantId, status } = payload;

  if (!eventId || !orderId || !tenantId) {
    return res.status(400).json({ error: 'malformed_payload' });
  }

  try {
    await PaymentEvent.create({ eventId, orderId, tenantId, receivedAt: new Date() });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(200).json({ status: 'already_processed' });
    }
    throw err;
  }

  // Wrong-tenant and truly-unknown order both return the identical 404,
  // differentiating would leak cross-tenant existence information through
  // the error response itself.
  const order = await Order.findOne({ _id: orderId, tenantId });
  if (!order) return res.status(404).json({ error: 'order_not_found' });

  if (order.status === 'paid') return res.status(200).json({ status: 'already_paid' });
  if (status !== 'paid') return res.status(200).json({ status: 'noted' });

  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();

  res.status(200).json({ status: 'ok' });
}
