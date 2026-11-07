import { Router } from 'express';
import {
  getAuthStatus,
  login,
  register,
  saveSecurityQuestions,
  resetPasswordWithQuestions,
  changePassword,
  me,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/status', getAuthStatus);
router.post('/login', login);
router.post('/register', register);
router.post('/security-questions', saveSecurityQuestions);
router.post('/reset-password', resetPasswordWithQuestions);
router.post('/change-password', changePassword);
router.get('/me', authenticate, me);

export default router;
