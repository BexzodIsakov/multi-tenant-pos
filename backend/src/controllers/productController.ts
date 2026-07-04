import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { PRODUCT_SAFE_PROJECTION } from '../services/projections';

export async function searchProducts(req: Request, res: Response) {
  const tenantId = req.auth!.tenantId;
  const search = typeof req.query.search === 'string' ? req.query.search : '';
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20);

  const matchFilter: Record<string, unknown> = { tenantId: new mongoose.Types.ObjectId(tenantId) };
  if (search) matchFilter.$text = { $search: search };

  const sortSpec: Record<string, 1 | -1 | { $meta: 'textScore' | 'indexKey' }> = search
    ? { score: { $meta: 'textScore' } }
    : { createdAt: -1 };

  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchFilter },
    {
      $facet: {
        data: [
          { $sort: sortSpec },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: PRODUCT_SAFE_PROJECTION }
        ],
        totalCount: [{ $count: 'count' }]
      }
    }
  ];

  const [result] = await Product.aggregate(pipeline);
  const products = result.data;
  const total = result.totalCount[0]?.count ?? 0;

  res.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
