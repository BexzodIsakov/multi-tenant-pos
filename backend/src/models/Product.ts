import { Schema, model, Document, Types } from 'mongoose';

export interface ProductDocument extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true }
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, name: 'text' });
productSchema.index({ tenantId: 1, createdAt: -1 });

export const Product = model<ProductDocument>('Product', productSchema);
