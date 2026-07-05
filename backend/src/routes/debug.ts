import { Router } from 'express';
import { replayLastWebhook } from '../controllers/debugController';

const router = Router();

router.post('/replay-last-webhook', replayLastWebhook);

export default router;
