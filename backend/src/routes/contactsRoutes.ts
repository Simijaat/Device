import { Router } from 'express';
import { getContacts, ingestContacts } from '../controllers/contactsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticate, getContacts);
router.post('/', authenticate, ingestContacts);
export default router;
