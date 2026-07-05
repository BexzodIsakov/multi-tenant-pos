import { Schema, model, Document, Types } from 'mongoose';

export interface PaymentEventDocument extends Document {
  _id: Types.ObjectId;
  eventId: string;
  orderId: Types.ObjectId;
  tenantId: Types.ObjectId;
  receivedAt: Date;
}

const paymentEventSchema = new Schema<PaymentEventDocument>({
  eventId: { type: String, required: true, unique: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  receivedAt: { type: Date, required: true, default: Date.now }
});

export const PaymentEvent = model<PaymentEventDocument>('PaymentEvent', paymentEventSchema);
