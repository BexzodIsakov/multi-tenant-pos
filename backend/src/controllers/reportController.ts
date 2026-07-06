import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { redisClient } from '../config/redis';

const CACHE_TTL_SECONDS = 300;

export async function getSalesReport(req: Request, res: Response) {
  const { tenantId } = req.auth!;
  const { from, to } = req.query as { from?: string; to?: string };

  if (!from || !to) {
    return res.status(400).json({ error: 'missing_date_range' });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return res.status(400).json({ error: 'invalid_date_range' });
  }

  const cacheKey = `report:${tenantId}:${from}:${to}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const pipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        status: 'paid',
        paidAt: { $gte: fromDate, $lte: toDate }
      }
    },
    { $unwind: '$items' },
    {
      $facet: {
        topProducts: [
          {
            $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              totalQuantity: { $sum: '$items.quantity' }
            }
          },
          { $sort: { totalQuantity: -1 } },
          { $limit: 10 }
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$items.lineTotal' },
              totalMargin: {
                $sum: {
                  $subtract: ['$items.lineTotal', { $multiply: ['$items.costPrice', '$items.quantity'] }]
                }
              }
            }
          }
        ]
      }
    }
  ];

  const [result] = await Order.aggregate(pipeline);
  const report = {
    topProducts: result.topProducts,
    totalRevenue: result.totals[0]?.totalRevenue ?? 0,
    totalMargin: result.totals[0]?.totalMargin ?? 0
  };

  await redisClient.set(cacheKey, JSON.stringify(report), { EX: CACHE_TTL_SECONDS });
  res.json(report);
}
