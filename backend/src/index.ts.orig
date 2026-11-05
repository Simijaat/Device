import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import messagesRoutes from './routes/messagesRoutes';
import callsRoutes from './routes/callsRoutes';
import contactsRoutes from './routes/contactsRoutes';
import locationsRoutes from './routes/locationsRoutes';
import appsRoutes from './routes/appsRoutes';

dotenv.config();

const app = express();
const port = parseInt(env.PORT, 10);

// Security Headers
app.use(helmet());

// CORS configuration (allow credentials, restrict to specific origin in prod)
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Body parsing with limits
app.use(express.json({ limit: '5mb' }));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth
  message: { success: false, error: 'Too many authentication attempts, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: { success: false, error: 'Too many API requests, please try again later.' }
});

// Basic health-check API
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/devices', apiLimiter, deviceRoutes);
app.use('/api/messages', apiLimiter, messagesRoutes);
app.use('/api/calls', apiLimiter, callsRoutes);
app.use('/api/contacts', apiLimiter, contactsRoutes);
app.use('/api/locations', apiLimiter, locationsRoutes);
app.use('/api/apps', apiLimiter, appsRoutes);

// Global Error Handler - Hide Stack Traces in Prod
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // If it's a known error or validation error, handle appropriately
  // Log the actual error internally
  if (process.env.NODE_ENV !== 'test') {
     console.error('Unhandled Server Error:', err.message);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
