import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/authMiddleware';

export const getApps = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { deviceId, limit = 100, offset = 0 } = req.query;

    let sql = `
        SELECT a.* FROM installed_apps a
        JOIN devices d ON a.device_id = d.id
        WHERE d.user_id = ?
    `;
    const args: any[] = [userId];

    if (deviceId) {
      sql += ' AND a.device_id = ?';
      args.push(deviceId);
    }

    sql += ' ORDER BY a.app_name ASC LIMIT ? OFFSET ?';
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch apps' });
  }
};

const ingestAppsSchema = z.object({
  device_id: z.string(),
  apps: z.array(z.object({
    app_name: z.string(),
    package_name: z.string(),
    version_name: z.string().optional(),
  }))
});

export const ingestApps = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = ingestAppsSchema.parse(req.body);

    const deviceCheck = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [data.device_id, userId] });
    if(deviceCheck.rows.length === 0) return res.status(403).json({ success: false, error: 'Device not found or unauthorized' });

    await db.execute({
       sql: 'DELETE FROM installed_apps WHERE device_id = ?',
       args: [data.device_id]
    });

    for (const app of data.apps) {
      await db.execute({
        sql: 'INSERT INTO installed_apps (id, device_id, app_name, package_name, version_name) VALUES (?, ?, ?, ?, ?)',
        args: [uuidv4(), data.device_id, app.app_name, app.package_name, app.version_name || null]
      });
    }

    res.json({ success: true, message: `Ingested ${data.apps.length} apps` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to ingest apps' });
  }
};
