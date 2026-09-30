import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const getLocations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { deviceId, limit = 50, offset = 0 } = req.query;

    let sql = `
        SELECT l.* FROM locations l
        JOIN devices d ON l.device_id = d.id
        WHERE d.user_id = ?
    `;
    const args: any[] = [userId];

    if (deviceId) {
      sql += ' AND l.device_id = ?';
      args.push(deviceId);
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
};

const ingestLocationsSchema = z.object({
  device_id: z.string(),
  locations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
    timestamp: z.string(),
  }))
});

export const ingestLocations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = ingestLocationsSchema.parse(req.body);

    const deviceCheck = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [data.device_id, userId] });
    if(deviceCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Device not found or unauthorized' });

    for (const loc of data.locations) {
      await db.execute({
        sql: 'INSERT INTO locations (id, device_id, latitude, longitude, accuracy, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), data.device_id, loc.latitude, loc.longitude, loc.accuracy || null, loc.timestamp]
      });
    }

    res.json({ success: true, message: `Ingested ${data.locations.length} locations` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to ingest locations' });
  }
};
