import { Router } from 'express';
import { searchProducts } from '../controllers/productController';

const router = Router();

router.get('/', searchProducts);

export default router;
