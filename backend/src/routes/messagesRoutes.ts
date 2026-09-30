import { Router } from 'express';
import { getMessages, ingestMessages, deleteMessage } from '../controllers/messagesController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getMessages);
router.post('/', authenticate, ingestMessages);
router.delete('/:id', authenticate, deleteMessage);

export default router;
