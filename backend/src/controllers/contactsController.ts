import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { deviceId, limit = 50, offset = 0 } = req.query;

    let sql = `
        SELECT c.* FROM contacts c
        JOIN devices d ON c.device_id = d.id
        WHERE d.user_id = ?
    `;
    const args: any[] = [userId];

    if (deviceId) {
      sql += ' AND c.device_id = ?';
      args.push(deviceId);
    }

    sql += ' ORDER BY c.name ASC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
};

const ingestContactsSchema = z.object({
  device_id: z.string(),
  contacts: z.array(z.object({
    name: z.string(),
    phone_number: z.string(),
  }))
});

export const ingestContacts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = ingestContactsSchema.parse(req.body);

    const deviceCheck = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [data.device_id, userId] });
    if(deviceCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Device not found or unauthorized' });

    for (const contact of data.contacts) {
       await db.execute({
           sql: 'INSERT INTO contacts (id, device_id, name, phone_number) VALUES (?, ?, ?, ?)',
           args: [uuidv4(), data.device_id, contact.name, contact.phone_number]
       });
    }

    res.json({ success: true, message: `Ingested ${data.contacts.length} contacts` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to ingest contacts' });
  }
};
