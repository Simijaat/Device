import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { deviceId, limit = 50, offset = 0 } = req.query;

    let sql = `
        SELECT m.* FROM messages m
        JOIN devices d ON m.device_id = d.id
        WHERE d.user_id = ?
    `;
    const args: any[] = [userId];

    if (deviceId) {
      sql += ' AND m.device_id = ?';
      args.push(deviceId);
    }

    sql += ' ORDER BY m.timestamp DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};

const ingestMessagesSchema = z.object({
  device_id: z.string(),
  messages: z.array(z.object({
    sender: z.string(),
    content: z.string(),
    type: z.string(), // inbox, sent
    timestamp: z.string(),
  }))
});

export const ingestMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = ingestMessagesSchema.parse(req.body);

    const deviceCheck = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [data.device_id, userId] });
    if(deviceCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Device not found or unauthorized' });

    for (const msg of data.messages) {
      await db.execute({
        sql: 'INSERT INTO messages (id, device_id, sender, content, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), data.device_id, msg.sender, msg.content, msg.type, msg.timestamp]
      });
    }

    res.json({ success: true, message: `Ingested ${data.messages.length} messages` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to ingest messages' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const ownershipCheck = await db.execute({
            sql: `SELECT m.id FROM messages m JOIN devices d ON m.device_id = d.id WHERE m.id = ? AND d.user_id = ?`,
            args: [id, userId]
        });

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Message not found or unauthorized' });
        }

        await db.execute({ sql: 'DELETE FROM messages WHERE id = ?', args: [id] });
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
};
