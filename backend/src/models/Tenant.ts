import { Schema, model, Document, Types } from 'mongoose';

export interface TenantDocument extends Document {
  _id: Types.ObjectId;
  name: string;
}

const tenantSchema = new Schema<TenantDocument>({
  name: { type: String, required: true }
});

export const Tenant = model<TenantDocument>('Tenant', tenantSchema);
