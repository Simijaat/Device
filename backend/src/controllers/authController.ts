import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordHash = user.password_hash as string;

    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, env.AUTH_SECRET, {
      expiresIn: '7d',
    });

    res.json({ success: true, token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if(!username || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Invalid username or password (min 6 chars)'});
  }

  try {
    const existing = await db.execute({
        sql: 'SELECT id FROM users LIMIT 1',
        args: []
    });

    if (existing.rows.length > 0) {
        return res.status(403).json({ success: false, error: 'Registration is closed.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.execute({
      sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
      args: [id, username, passwordHash],
    });

    res.status(201).json({ success: true, message: 'User created' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
    // @ts-ignore
    res.json({ success: true, user: req.user });
};
