import { Schema, model, Document, Types } from 'mongoose';

export type OrderStatus = 'pending_payment' | 'paid';

export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  cashierId: Types.ObjectId;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  createdAt: Date;
  paidAt: Date | null;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending_payment', 'paid'], required: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  paidAt: { type: Date, default: null }
});

orderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, createdAt: 1 });

export const Order = model<OrderDocument>('Order', orderSchema);
