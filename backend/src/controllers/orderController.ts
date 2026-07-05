import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Order, OrderDocument, OrderItem } from '../models/Order';
import { OversellError } from '../utils/errors';
import { runWithRetry } from '../utils/transactions';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface TransactionResult {
  order: OrderDocument;
  safeItems: Array<Omit<OrderItem, 'costPrice'>>;
}

export async function createOrder(req: Request, res: Response) {
  const { items } = req.body as { items?: OrderItemInput[] };
  const { tenantId, userId } = req.auth!;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'empty_order' });
  }

  for (const item of items) {
    if (
      typeof item.productId !== 'string' ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return res.status(400).json({ error: 'invalid_order_item' });
    }
  }

  const session = await mongoose.startSession();

  try {
    const { order, safeItems } = await runWithRetry(async () => {
      let result: TransactionResult | undefined;

      await session.withTransaction(async () => {
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;
        let totalCost = 0;

        for (const { productId, quantity } of items) {
          const product = await Product.findOneAndUpdate(
            { _id: productId, tenantId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { session, new: true }
          );

          if (!product) {
            const exists = await Product.findOne({ _id: productId, tenantId }).session(session);
            const available = exists ? exists.stock : 0;
            throw new OversellError(productId, quantity, available);
          }

          orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            costPrice: product.costPrice,
            quantity,
            lineTotal: product.price * quantity
          });
          totalAmount += product.price * quantity;
          totalCost += product.costPrice * quantity;
        }

        const [createdOrder] = await Order.create(
          [
            {
              tenantId,
              cashierId: userId,
              status: 'pending_payment',
              items: orderItems,
              totalAmount,
              totalCost,
              createdAt: new Date(),
              paidAt: null
            }
          ],
          { session }
        );

        result = {
          order: createdOrder,
          safeItems: orderItems.map(({ costPrice, ...safe }) => safe)
        };
      });

      return result!;
    });

    res.status(201).json({
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      items: safeItems
    });

    // Stage 5 fires the mock payment provider here, after responding.
  } catch (err) {
    if (err instanceof OversellError) {
      return res.status(409).json({
        error: 'insufficient_stock',
        details: [{ productId: err.productId, requested: err.requested, available: err.available }]
      });
    }
    console.error(err);
    res.status(500).json({ error: 'order_creation_failed' });
  } finally {
    await session.endSession();
  }
}
