import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'cashier';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  role: UserRole;
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<UserDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  role: { type: String, enum: ['admin', 'cashier'], required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

export const User = model<UserDocument>('User', userSchema);
