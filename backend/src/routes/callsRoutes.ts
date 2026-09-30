import { Router } from 'express';
import { getCalls, ingestCalls } from '../controllers/callsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticate, getCalls);
router.post('/', authenticate, ingestCalls);
export default router;
