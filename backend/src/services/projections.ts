// costPrice is deliberately absent from every one of these, cashiers hit these endpoints too.

export const PRODUCT_SAFE_PROJECTION = {
  name: 1,
  sku: 1,
  price: 1,
  stock: 1,
  category: 1,
  imageUrl: 1
};

// Any new cashier-reachable endpoint that reads an Order must reuse this,
// not build a new ad hoc field list, that's how a margin leak gets
// introduced later by accident.
export const CASHIER_SAFE_PROJECTION = {
  tenantId: 1,
  status: 1,
  cashierId: 1,
  createdAt: 1,
  paidAt: 1,
  totalAmount: 1,
  'items.productId': 1,
  'items.name': 1,
  'items.price': 1,
  'items.quantity': 1,
  'items.lineTotal': 1
};
