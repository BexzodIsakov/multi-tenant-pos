export interface ReceiptItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Receipt {
  _id: string;
  status: 'pending_payment' | 'paid';
  createdAt: string;
  paidAt: string | null;
  totalAmount: number;
  items: ReceiptItem[];
}
