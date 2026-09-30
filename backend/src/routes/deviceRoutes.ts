import { Router } from 'express';
import { getDevices, getDeviceById, registerDevice, updateDeviceStatus, deleteDevice } from '../controllers/deviceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, getDevices);
router.get('/:id', authenticate, getDeviceById);
router.delete('/:id', authenticate, deleteDevice);

router.post('/register', authenticate, registerDevice);
router.post('/:id/status', authenticate, updateDeviceStatus);

export default router;
