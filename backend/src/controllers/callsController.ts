import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCalls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { deviceId, limit = 50, offset = 0 } = req.query;

    let sql = `
        SELECT c.* FROM calls c
        JOIN devices d ON c.device_id = d.id
        WHERE d.user_id = ?
    `;
    const args: any[] = [userId];

    if (deviceId) {
      sql += ' AND c.device_id = ?';
      args.push(deviceId);
    }

    sql += ' ORDER BY c.timestamp DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch calls' });
  }
};

const ingestCallsSchema = z.object({
  device_id: z.string(),
  calls: z.array(z.object({
    number: z.string(),
    type: z.string(),
    duration: z.number(),
    timestamp: z.string(),
  }))
});

export const ingestCalls = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = ingestCallsSchema.parse(req.body);

    const deviceCheck = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [data.device_id, userId] });
    if(deviceCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Device not found or unauthorized' });

    for (const call of data.calls) {
      await db.execute({
        sql: 'INSERT INTO calls (id, device_id, number, type, duration, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), data.device_id, call.number, call.type, call.duration, call.timestamp]
      });
    }

    res.json({ success: true, message: `Ingested ${data.calls.length} calls` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to ingest calls' });
  }
};
