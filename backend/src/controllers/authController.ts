import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const login = async (req: Request, res: Response) => {
  const rawUsername = req.body?.username;
  const rawPassword = req.body?.password;
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    // 1. Check if a user with this username (case-insensitive) exists
    const byUsername = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      args: [username],
    });

    if (byUsername.rows.length > 0) {
      const user = byUsername.rows[0];
      const passwordHash = user.password_hash as string;
      const isValid = await bcrypt.compare(password, passwordHash);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Incorrect password. To reset or set new master credentials, click "Initialize master account" below.',
        });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, env.AUTH_SECRET, {
        expiresIn: '7d',
      });
      return res.json({ success: true, token, user: { id: user.id, username: user.username } });
    }

    // 2. Check if any master user exists yet
    const anyUser = await db.execute({
      sql: 'SELECT * FROM users ORDER BY created_at ASC LIMIT 1',
      args: [],
    });

    if (anyUser.rows.length === 0) {
      // First-time sign in: initialize the master account automatically
      const passwordHash = await bcrypt.hash(password, 10);
      const id = uuidv4();
      await db.execute({
        sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        args: [id, username, passwordHash],
      });
      const token = jwt.sign({ id, username }, env.AUTH_SECRET, {
        expiresIn: '7d',
      });
      return res.json({ success: true, token, user: { id, username } });
    }

    // If a master account exists under a different username, verify if the password matches the master account
    const masterUser = anyUser.rows[0];
    const masterValid = await bcrypt.compare(password, masterUser.password_hash as string);
    if (masterValid) {
      const token = jwt.sign(
        { id: masterUser.id, username: masterUser.username },
        env.AUTH_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: { id: masterUser.id, username: masterUser.username },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Click "Initialize master account" below to set or reset your master account.',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const rawUsername = req.body?.username;
  const rawPassword = req.body?.password;
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT * FROM users ORDER BY created_at ASC LIMIT 1',
      args: [],
    });

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing.rows.length > 0) {
      // Update the canonical master user credentials while preserving the master user ID so paired devices remain linked
      const masterId = existing.rows[0].id as string;
      await db.execute({
        sql: 'UPDATE users SET username = ?, password_hash = ? WHERE id = ?',
        args: [username, passwordHash, masterId],
      });
      const token = jwt.sign({ id: masterId, username }, env.AUTH_SECRET, {
        expiresIn: '7d',
      });
      return res.status(200).json({
        success: true,
        message: 'Master account updated',
        token,
        user: { id: masterId, username },
      });
    }

    const id = uuidv4();
    await db.execute({
      sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
      args: [id, username, passwordHash],
    });

    const token = jwt.sign({ id, username }, env.AUTH_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Master account created',
      token,
      user: { id, username },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
};
