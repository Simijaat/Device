import { Router } from 'express';
import { getLocations, ingestLocations } from '../controllers/locationsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticate, getLocations);
router.post('/', authenticate, ingestLocations);
export default router;
