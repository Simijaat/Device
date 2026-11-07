import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const SECURITY_QUESTIONS = [
  'What is your childhood nickname or secret code?',
  'What was the name of your first school?',
  'What is your favorite movie, game, or book?',
  'What was the model of your first phone or vehicle?',
  'In which city or town were you born?',
] as const;

function normalizeAnswer(answer: string): string {
  return (answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

interface TursoRow {
  [key: string]: any;
}

async function queryTurso(sql: string, args: (string | number | null)[] = []): Promise<TursoRow[]> {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!dbUrl || !authToken) {
    throw new Error('Turso credentials not configured');
  }

  const httpUrl = dbUrl.replace('libsql://', 'https://') + '/v2/pipeline';
  const res = await fetch(httpUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql,
            args: args.map((v) =>
              v === null
                ? { type: 'null' }
                : typeof v === 'number'
                ? { type: 'integer', value: String(v) }
                : { type: 'text', value: String(v) }
            ),
          },
        },
        { type: 'close' },
      ],
    }),
  });

  const data: any = await res.json();
  const result = data?.results?.[0]?.response?.result;
  if (!result || !Array.isArray(result.cols) || !Array.isArray(result.rows)) {
    return [];
  }

  const cols: string[] = result.cols.map((c: any) => c.name);
  return result.rows.map((row: any[]) => {
    const obj: TursoRow = {};
    cols.forEach((col, i) => {
      obj[col] = row[i]?.type === 'null' ? null : row[i]?.value;
    });
    return obj;
  });
}

async function verifyUserPassword(user: TursoRow, password: string): Promise<boolean> {
  if (!password) return false;
  if (user.password_hash && (await bcrypt.compare(password, String(user.password_hash)))) {
    return true;
  }
  if (user.password_alt_hash && (await bcrypt.compare(password, String(user.password_alt_hash)))) {
    return true;
  }
  return false;
}

function sendJson(res: any, status: number, payload: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(payload));
}

function productionApiProxyPlugin(): Plugin {
  return {
    name: 'production-api-proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        let bodyBuffer: Buffer | undefined;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          bodyBuffer = Buffer.concat(chunks);
        }

        const authSecret = process.env.AUTH_SECRET || '';
        const hasTurso = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN && authSecret);

        // Handle /api/auth/* directly against the live Turso DB so security-question recovery and login are 100% synchronized
        if (hasTurso && req.url.startsWith('/api/auth/')) {
          try {
            const pathOnly = req.url.split('?')[0];
            const body = bodyBuffer && bodyBuffer.length > 0 ? JSON.parse(bodyBuffer.toString('utf8')) : {};

            if (pathOnly === '/api/auth/status' && req.method === 'GET') {
              const rows = await queryTurso(
                'SELECT id, username, security_q1, security_q2 FROM users ORDER BY created_at ASC LIMIT 1'
              );
              if (rows.length === 0) {
                return sendJson(res, 200, {
                  success: true,
                  initialized: false,
                  masterUsername: null,
                  securityQuestionsConfigured: false,
                  configuredQuestions: [],
                  availableQuestions: SECURITY_QUESTIONS,
                });
              }
              const master = rows[0];
              const q1 = master.security_q1 || '';
              const q2 = master.security_q2 || '';
              const configured = Boolean(q1 && q2);
              return sendJson(res, 200, {
                success: true,
                initialized: true,
                masterUsername: master.username,
                securityQuestionsConfigured: configured,
                configuredQuestions: configured ? [q1, q2] : [],
                availableQuestions: SECURITY_QUESTIONS,
              });
            }

            if (pathOnly === '/api/auth/login' && req.method === 'POST') {
              const username = typeof body.username === 'string' ? body.username.trim() : '';
              const password = typeof body.password === 'string' ? body.password : '';
              if (!username || !password) {
                return sendJson(res, 400, { success: false, error: 'Username and password are required' });
              }

              const rows = await queryTurso(
                'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
                [username]
              );
              if (rows.length === 0) {
                return sendJson(res, 401, {
                  success: false,
                  error: 'Invalid username or password. Use "Forgot Password? Reset via Security Questions" to recover your password.',
                });
              }

              const user = rows[0];
              const valid = await verifyUserPassword(user, password);
              if (!valid) {
                return sendJson(res, 401, {
                  success: false,
                  error: 'Invalid username or password. Use "Forgot Password? Reset via Security Questions" to recover your password.',
                });
              }

              const token = jwt.sign({ id: user.id, username: user.username }, authSecret, {
                expiresIn: '7d',
              });
              const q1 = user.security_q1 || '';
              const q2 = user.security_q2 || '';
              const configured = Boolean(q1 && q2);

              return sendJson(res, 200, {
                success: true,
                token,
                user: { id: user.id, username: user.username },
                securityQuestionsConfigured: configured,
                configuredQuestions: configured ? [q1, q2] : [],
              });
            }

            if (pathOnly === '/api/auth/register' && req.method === 'POST') {
              const existing = await queryTurso('SELECT id FROM users LIMIT 1');
              if (existing.length > 0) {
                return sendJson(res, 403, {
                  success: false,
                  error: 'Master account is already initialized. Direct password overwrite is disabled — please sign in or reset your password via your 2 security questions.',
                });
              }

              const username = typeof body.username === 'string' ? body.username.trim() : '';
              const password = typeof body.password === 'string' ? body.password : '';
              const q1 = typeof body.question1 === 'string' ? body.question1.trim() : '';
              const a1 = typeof body.answer1 === 'string' ? normalizeAnswer(body.answer1) : '';
              const q2 = typeof body.question2 === 'string' ? body.question2.trim() : '';
              const a2 = typeof body.answer2 === 'string' ? normalizeAnswer(body.answer2) : '';

              if (!username || !password) {
                return sendJson(res, 400, { success: false, error: 'Username and password are required' });
              }

              const id = crypto.randomUUID();
              const passHash = await bcrypt.hash(password, 10);
              const a1Hash = q1 && a1 ? await bcrypt.hash(a1, 10) : null;
              const a2Hash = q2 && a2 ? await bcrypt.hash(a2, 10) : null;

              await queryTurso(
                `INSERT INTO users (id, username, password_hash, security_q1, security_a1_hash, security_q2, security_a2_hash)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, username, passHash, q1 || null, a1Hash, q2 || null, a2Hash]
              );

              const token = jwt.sign({ id, username }, authSecret, { expiresIn: '7d' });
              return sendJson(res, 201, {
                success: true,
                token,
                user: { id, username },
                securityQuestionsConfigured: Boolean(q1 && q2),
                configuredQuestions: q1 && q2 ? [q1, q2] : [],
              });
            }

            if (pathOnly === '/api/auth/security-questions' && req.method === 'POST') {
              const q1 = typeof body.question1 === 'string' ? body.question1.trim() : '';
              const a1 = typeof body.answer1 === 'string' ? normalizeAnswer(body.answer1) : '';
              const q2 = typeof body.question2 === 'string' ? body.question2.trim() : '';
              const a2 = typeof body.answer2 === 'string' ? normalizeAnswer(body.answer2) : '';
              const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
              const username = typeof body.username === 'string' ? body.username.trim() : '';

              if (
                !q1 ||
                !q2 ||
                !SECURITY_QUESTIONS.includes(q1 as any) ||
                !SECURITY_QUESTIONS.includes(q2 as any) ||
                q1 === q2
              ) {
                return sendJson(res, 400, {
                  success: false,
                  error: 'Please select 2 different security questions from the 5 available options.',
                });
              }

              if (a1.length < 2 || a2.length < 2) {
                return sendJson(res, 400, {
                  success: false,
                  error: 'Each security answer must be at least 2 characters long.',
                });
              }

              let targetUserId: string | null = null;
              const authHeader = req.headers.authorization;
              if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                  const decoded = jwt.verify(authHeader.split(' ')[1], authSecret) as { id: string };
                  targetUserId = decoded.id;
                } catch {
                  targetUserId = null;
                }
              }

              if (!targetUserId) {
                if (!currentPassword) {
                  return sendJson(res, 401, {
                    success: false,
                    error: 'Please enter your current master password to save security questions.',
                  });
                }
                const rows = username
                  ? await queryTurso('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1', [username])
                  : await queryTurso('SELECT * FROM users ORDER BY created_at ASC LIMIT 1');
                if (rows.length === 0) {
                  return sendJson(res, 404, { success: false, error: 'Master account not found.' });
                }
                const ok = await verifyUserPassword(rows[0], currentPassword);
                if (!ok) {
                  return sendJson(res, 401, {
                    success: false,
                    error: 'Current master password is incorrect.',
                  });
                }
                targetUserId = rows[0].id;
              }

              const a1Hash = await bcrypt.hash(a1, 10);
              const a2Hash = await bcrypt.hash(a2, 10);

              await queryTurso(
                `UPDATE users SET security_q1 = ?, security_a1_hash = ?, security_q2 = ?, security_a2_hash = ? WHERE id = ?`,
                [q1, a1Hash, q2, a2Hash, targetUserId]
              );

              return sendJson(res, 200, {
                success: true,
                message: 'Your 2 security questions have been saved.',
                securityQuestionsConfigured: true,
                configuredQuestions: [q1, q2],
              });
            }

            if (pathOnly === '/api/auth/reset-password' && req.method === 'POST') {
              const username = typeof body.username === 'string' ? body.username.trim() : '';
              const a1 = typeof body.answer1 === 'string' ? normalizeAnswer(body.answer1) : '';
              const a2 = typeof body.answer2 === 'string' ? normalizeAnswer(body.answer2) : '';
              const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

              if (!username || !a1 || !a2 || !newPassword) {
                return sendJson(res, 400, {
                  success: false,
                  error: 'Username, both security answers, and a new password are required.',
                });
              }

              if (newPassword.length < 6) {
                return sendJson(res, 400, {
                  success: false,
                  error: 'New password must be at least 6 characters long.',
                });
              }

              const rows = await queryTurso(
                'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
                [username]
              );
              if (rows.length === 0) {
                return sendJson(res, 404, {
                  success: false,
                  error: 'No master account found with that username.',
                });
              }

              const user = rows[0];
              if (!user.security_q1 || !user.security_a1_hash || !user.security_q2 || !user.security_a2_hash) {
                return sendJson(res, 400, {
                  success: false,
                  error: 'Security questions have not been configured yet for this account.',
                });
              }

              const a1Ok = await bcrypt.compare(a1, String(user.security_a1_hash));
              const a2Ok = await bcrypt.compare(a2, String(user.security_a2_hash));
              if (!a1Ok || !a2Ok) {
                return sendJson(res, 401, {
                  success: false,
                  error: 'One or both security question answers are incorrect. Password reset denied.',
                });
              }

              const newPassHash = await bcrypt.hash(newPassword, 10);
              await queryTurso(
                'UPDATE users SET password_hash = ?, password_alt_hash = NULL WHERE id = ?',
                [newPassHash, user.id]
              );

              const token = jwt.sign({ id: user.id, username: user.username }, authSecret, {
                expiresIn: '7d',
              });

              return sendJson(res, 200, {
                success: true,
                message: 'Master password has been reset successfully.',
                token,
                user: { id: user.id, username: user.username },
              });
            }
          } catch (tursoErr: any) {
            console.warn('[Turso Auth Error]:', tursoErr.message);
          }
        }

        try {
          const targetUrl = new URL(req.url, 'https://backend-ttml.onrender.com');
          const headers: Record<string, string> = {
            host: 'backend-ttml.onrender.com',
          };
          if (req.headers.authorization) {
            headers['authorization'] = req.headers.authorization;
          }
          if (req.headers['content-type']) {
            headers['content-type'] = req.headers['content-type'] as string;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          const response = await fetch(targetUrl.toString(), {
            method: req.method,
            headers,
            body: bodyBuffer,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            if (
              lower !== 'content-encoding' &&
              lower !== 'content-length' &&
              lower !== 'transfer-encoding' &&
              lower !== 'connection' &&
              lower !== 'access-control-allow-origin'
            ) {
              res.setHeader(key, value);
            }
          });
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');

          const resData = await response.arrayBuffer();
          res.end(Buffer.from(resData));
        } catch (err: any) {
          console.warn('[Proxy Warning] Production backend unreachable:', err.message);
          sendJson(res, 502, {
            success: false,
            error: 'Production backend (https://backend-ttml.onrender.com) is currently waking up or unreachable. Please retry in a few seconds.',
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), productionApiProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
