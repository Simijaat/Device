import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from './config/env';
import { db } from './config/db';
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

async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_alt_hash TEXT,
      security_q1 TEXT,
      security_a1_hash TEXT,
      security_q2 TEXT,
      security_a2_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      model TEXT,
      android_version TEXT,
      app_version TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_online BOOLEAN DEFAULT 0,
      battery_level INTEGER,
      is_charging BOOLEAN DEFAULT 0,
      network_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      number TEXT NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS installed_apps (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      app_name TEXT NOT NULL,
      package_name TEXT NOT NULL,
      version_name TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS sync_logs (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      sync_type TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )`
  ];

  const alterColumns = [
    `ALTER TABLE users ADD COLUMN password_alt_hash TEXT`,
    `ALTER TABLE users ADD COLUMN security_q1 TEXT`,
    `ALTER TABLE users ADD COLUMN security_a1_hash TEXT`,
    `ALTER TABLE users ADD COLUMN security_q2 TEXT`,
    `ALTER TABLE users ADD COLUMN security_a2_hash TEXT`,
  ];

  try {
    for (const sql of statements) {
      await db.execute(sql);
    }
    for (const alterSql of alterColumns) {
      try {
        await db.execute(alterSql);
      } catch {
        // Column already exists
      }
    }

    // Ensure canonical master user Admin exists with single password (Shivam@9533) if not yet initialized
    const existing = await db.execute({
      sql: 'SELECT * FROM users ORDER BY created_at ASC LIMIT 1',
      args: [],
    });
    if (existing.rows.length === 0) {
      const primaryHash = await bcrypt.hash('Shivam@9533', 10);
      await db.execute({
        sql: 'INSERT INTO users (id, username, password_hash, password_alt_hash) VALUES (?, ?, ?, NULL)',
        args: [uuidv4(), 'Admin', primaryHash],
      });
    }

    console.log('Database schema and master user verified.');
  } catch (err) {
    console.error('Database schema verification warning:', err);
  }
}

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Too many API requests, please try again later.' }
});

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Device Manager API is running', health: '/health' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/devices', apiLimiter, deviceRoutes);
app.use('/api/messages', apiLimiter, messagesRoutes);
app.use('/api/calls', apiLimiter, callsRoutes);
app.use('/api/contacts', apiLimiter, contactsRoutes);
app.use('/api/locations', apiLimiter, locationsRoutes);
app.use('/api/apps', apiLimiter, appsRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Server Error:', err.message);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

if (require.main === module) {
  ensureSchema().then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  });
}

export default app;
