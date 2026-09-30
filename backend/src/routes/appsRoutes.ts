import { Router } from 'express';
import { getApps, ingestApps } from '../controllers/appsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticate, getApps);
router.post('/', authenticate, ingestApps);
export default router;
