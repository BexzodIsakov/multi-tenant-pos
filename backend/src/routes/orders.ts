import { Router } from 'express';
import { createOrder, getReceipt } from '../controllers/orderController';

const router = Router();

router.post('/', createOrder);
router.get('/:id/receipt', getReceipt);

export default router;
