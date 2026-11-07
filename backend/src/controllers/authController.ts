import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const SECURITY_QUESTIONS = [
  'What is your childhood nickname or secret code?',
  'What was the name of your first school?',
  'What is your favorite movie, game, or book?',
  'What was the model of your first phone or vehicle?',
  'In which city or town were you born?',
] as const;

function normalizeAnswer(answer: string): string {
  return (answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function verifyUserPassword(user: Record<string, any>, password: string): Promise<boolean> {
  if (!password) return false;
  const primaryHash = user.password_hash as string | undefined;
  if (!primaryHash) return false;
  return bcrypt.compare(password, primaryHash);
}

export const getAuthStatus = async (_req: Request, res: Response) => {
  try {
    const result = await db.execute({
      sql: 'SELECT id, username, security_q1, security_q2 FROM users ORDER BY created_at ASC LIMIT 1',
      args: [],
    });

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        initialized: false,
        masterUsername: null,
        securityQuestionsConfigured: false,
        configuredQuestions: [],
        availableQuestions: SECURITY_QUESTIONS,
      });
    }

    const master = result.rows[0];
    const q1 = (master.security_q1 as string) || '';
    const q2 = (master.security_q2 as string) || '';
    const configured = Boolean(q1 && q2);

    return res.json({
      success: true,
      initialized: true,
      masterUsername: master.username as string,
      securityQuestionsConfigured: configured,
      configuredQuestions: configured ? [q1, q2] : [],
      availableQuestions: SECURITY_QUESTIONS,
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const rawUsername = req.body?.username;
  const rawPassword = req.body?.password;
  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    const byUsername = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) ORDER BY created_at ASC LIMIT 1',
      args: [username],
    });

    if (byUsername.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password. Only the single active master password is accepted.',
      });
    }

    const user = byUsername.rows[0];
    const isValid = await verifyUserPassword(user, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password. Use "Forgot Password? Reset via Security Questions" if you need to reset your password.',
      });
    }

    const canonicalUsername = user.username as string;
    const token = jwt.sign({ id: user.id, username: canonicalUsername }, env.AUTH_SECRET, {
      expiresIn: '7d',
    });

    const q1 = (user.security_q1 as string) || '';
    const q2 = (user.security_q2 as string) || '';
    const securityQuestionsConfigured = Boolean(q1 && q2);

    return res.json({
      success: true,
      token,
      user: { id: user.id, username: canonicalUsername },
      securityQuestionsConfigured,
      configuredQuestions: securityQuestionsConfigured ? [q1, q2] : [],
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const rawUsername = req.body?.username;
  const rawPassword = req.body?.password;
  const question1 = typeof req.body?.question1 === 'string' ? req.body.question1.trim() : '';
  const answer1 = typeof req.body?.answer1 === 'string' ? normalizeAnswer(req.body.answer1) : '';
  const question2 = typeof req.body?.question2 === 'string' ? req.body.question2.trim() : '';
  const answer2 = typeof req.body?.answer2 === 'string' ? normalizeAnswer(req.body.answer2) : '';

  const username = typeof rawUsername === 'string' ? rawUsername.trim() : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM users LIMIT 1',
      args: [],
    });

    // Strictly block direct registration/overwrite once the 1st-time master password is created
    if (existing.rows.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Master account is already initialized. Direct password overwrite is disabled — please sign in or reset your password via your 2 security questions.',
      });
    }

    let q1ToSave: string | null = null;
    let a1HashToSave: string | null = null;
    let q2ToSave: string | null = null;
    let a2HashToSave: string | null = null;

    if (question1 && question2 && answer1 && answer2) {
      if (
        !SECURITY_QUESTIONS.includes(question1 as any) ||
        !SECURITY_QUESTIONS.includes(question2 as any) ||
        question1 === question2
      ) {
        return res.status(400).json({
          success: false,
          error: 'Please select 2 distinct security questions from the 5 available questions.',
        });
      }
      q1ToSave = question1;
      q2ToSave = question2;
      a1HashToSave = await bcrypt.hash(answer1, 10);
      a2HashToSave = await bcrypt.hash(answer2, 10);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, password_alt_hash, security_q1, security_a1_hash, security_q2, security_a2_hash)
            VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
      args: [id, username, passwordHash, q1ToSave, a1HashToSave, q2ToSave, a2HashToSave],
    });

    const token = jwt.sign({ id, username }, env.AUTH_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'Master account created',
      token,
      user: { id, username },
      securityQuestionsConfigured: Boolean(q1ToSave && q2ToSave),
      configuredQuestions: q1ToSave && q2ToSave ? [q1ToSave, q2ToSave] : [],
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const saveSecurityQuestions = async (req: Request, res: Response) => {
  const question1 = typeof req.body?.question1 === 'string' ? req.body.question1.trim() : '';
  const answer1 = typeof req.body?.answer1 === 'string' ? normalizeAnswer(req.body.answer1) : '';
  const question2 = typeof req.body?.question2 === 'string' ? req.body.question2.trim() : '';
  const answer2 = typeof req.body?.answer2 === 'string' ? normalizeAnswer(req.body.answer2) : '';
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';

  if (
    !question1 ||
    !question2 ||
    !SECURITY_QUESTIONS.includes(question1 as any) ||
    !SECURITY_QUESTIONS.includes(question2 as any)
  ) {
    return res.status(400).json({
      success: false,
      error: 'Please select 2 valid security questions from the 5 available options.',
    });
  }

  if (question1 === question2) {
    return res.status(400).json({
      success: false,
      error: 'Please select 2 different security questions.',
    });
  }

  if (answer1.length < 2 || answer2.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Each security answer must be at least 2 characters long.',
    });
  }

  try {
    let targetUserId: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.AUTH_SECRET) as { id: string; username: string };
        targetUserId = decoded.id;
      } catch {
        targetUserId = null;
      }
    }

    if (!targetUserId) {
      if (!currentPassword) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required. Please sign in or enter your current master password to save security questions.',
        });
      }

      const userQuery = rawUsername
        ? await db.execute({
            sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) ORDER BY created_at ASC LIMIT 1',
            args: [rawUsername],
          })
        : await db.execute({
            sql: 'SELECT * FROM users ORDER BY created_at ASC LIMIT 1',
            args: [],
          });

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Master account not found.' });
      }

      const user = userQuery.rows[0];
      const passwordOk = await verifyUserPassword(user, currentPassword);
      if (!passwordOk) {
        return res.status(401).json({
          success: false,
          error: 'Current master password is incorrect.',
        });
      }
      targetUserId = user.id as string;
    }

    const a1Hash = await bcrypt.hash(answer1, 10);
    const a2Hash = await bcrypt.hash(answer2, 10);

    await db.execute({
      sql: `UPDATE users
            SET security_q1 = ?, security_a1_hash = ?, security_q2 = ?, security_a2_hash = ?
            WHERE id = ?`,
      args: [question1, a1Hash, question2, a2Hash, targetUserId],
    });

    return res.json({
      success: true,
      message: 'Your 2 security questions have been saved for password recovery.',
      securityQuestionsConfigured: true,
      configuredQuestions: [question1, question2],
    });
  } catch (error) {
    console.error('Save security questions error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const resetPasswordWithQuestions = async (req: Request, res: Response) => {
  const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const answer1 = typeof req.body?.answer1 === 'string' ? normalizeAnswer(req.body.answer1) : '';
  const answer2 = typeof req.body?.answer2 === 'string' ? normalizeAnswer(req.body.answer2) : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

  if (!rawUsername || !answer1 || !answer2 || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Username, both security answers, and a new password are required.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.',
    });
  }

  try {
    const userQuery = await db.execute({
      sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) ORDER BY created_at ASC LIMIT 1',
      args: [rawUsername],
    });

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No master account found with that username.',
      });
    }

    const user = userQuery.rows[0];
    const q1 = user.security_q1 as string | null;
    const a1Hash = user.security_a1_hash as string | null;
    const q2 = user.security_q2 as string | null;
    const a2Hash = user.security_a2_hash as string | null;

    if (!q1 || !a1Hash || !q2 || !a2Hash) {
      return res.status(400).json({
        success: false,
        error: 'Security questions have not been configured yet for this account. Please sign in or verify your current password to select your 2 security questions first.',
      });
    }

    const a1Valid = await bcrypt.compare(answer1, a1Hash);
    const a2Valid = await bcrypt.compare(answer2, a2Hash);

    if (!a1Valid || !a2Valid) {
      return res.status(401).json({
        success: false,
        error: 'One or both security question answers are incorrect. Password reset denied.',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    // Keep only this single user and overwrite password_hash, clearing any legacy alternate hash
    await db.execute({
      sql: 'UPDATE users SET password_hash = ?, password_alt_hash = NULL WHERE id = ?',
      args: [newPasswordHash, user.id],
    });
    await db.execute({
      sql: 'DELETE FROM users WHERE id != ?',
      args: [user.id],
    });

    const canonicalUsername = user.username as string;
    const token = jwt.sign({ id: user.id, username: canonicalUsername }, env.AUTH_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      success: true,
      message: 'Master password has been updated. All previous passwords are now deactivated.',
      token,
      user: { id: user.id, username: canonicalUsername },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.',
    });
  }

  try {
    const userQuery = rawUsername
      ? await db.execute({
          sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) ORDER BY created_at ASC LIMIT 1',
          args: [rawUsername],
        })
      : await db.execute({
          sql: 'SELECT * FROM users ORDER BY created_at ASC LIMIT 1',
          args: [],
        });

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Master account not found.' });
    }

    const user = userQuery.rows[0];
    const isValid = await verifyUserPassword(user, currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect.',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.execute({
      sql: 'UPDATE users SET password_hash = ?, password_alt_hash = NULL WHERE id = ?',
      args: [newPasswordHash, user.id],
    });
    await db.execute({
      sql: 'DELETE FROM users WHERE id != ?',
      args: [user.id],
    });

    return res.json({
      success: true,
      message: 'Master password updated! Only this new password is now active; all older passwords have been invalidated.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
};
