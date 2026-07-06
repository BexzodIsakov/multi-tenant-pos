import { Router } from 'express';
import { getSalesReport } from '../controllers/reportController';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/sales', requireRole('admin'), getSalesReport);

export default router;
