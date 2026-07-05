export class OversellError extends Error {
  productId: string;
  requested: number;
  available: number;

  constructor(productId: string, requested: number, available: number) {
    super('insufficient_stock');
    this.productId = productId;
    this.requested = requested;
    this.available = available;
  }
}
