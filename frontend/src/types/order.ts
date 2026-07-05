export interface OrderItemResponse {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface CreateOrderResponse {
  orderId: string;
  status: 'pending_payment' | 'paid';
  totalAmount: number;
  items: OrderItemResponse[];
}

export interface InsufficientStockDetail {
  productId: string;
  requested: number;
  available: number;
}
