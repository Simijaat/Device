import { Request, Response } from 'express';
import { db } from '../config/db';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDevices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const result = await db.execute({
        sql: 'SELECT * FROM devices WHERE user_id = ? ORDER BY last_seen DESC',
        args: [userId]
    });
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch devices' });
  }
};

export const getDeviceById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM devices WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch device' });
  }
};

const registerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  model: z.string().optional(),
  android_version: z.string().optional(),
  app_version: z.string().optional()
});

export const registerDevice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const data = registerSchema.parse(req.body);

    const existing = await db.execute({
      sql: 'SELECT id FROM devices WHERE id = ?',
      args: [data.id]
    });

    if (existing.rows.length > 0) {
      // If updating, it must belong to this user
      const ownerCheck = await db.execute({
          sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?',
          args: [data.id, userId]
      });
      if(ownerCheck.rows.length === 0) {
         return res.status(403).json({ success: false, error: 'Unauthorized device update' });
      }

      await db.execute({
        sql: 'UPDATE devices SET name = ?, model = ?, android_version = ?, app_version = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [data.name, data.model || null, data.android_version || null, data.app_version || null, data.id]
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO devices (id, user_id, name, model, android_version, app_version) VALUES (?, ?, ?, ?, ?, ?)',
        args: [data.id, userId, data.name, data.model || null, data.android_version || null, data.app_version || null]
      });
    }

    res.json({ success: true, message: 'Device registered successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to register device' });
  }
};

const statusSchema = z.object({
  battery_level: z.number().min(0).max(100).optional(),
  is_charging: z.boolean().optional(),
  network_type: z.string().optional()
});

export const updateDeviceStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const data = statusSchema.parse(req.body);

    const existing = await db.execute({ sql: 'SELECT id FROM devices WHERE id = ? AND user_id = ?', args: [id, userId] });
    if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Device not found or unauthorized' });
    }

    const updates = [];
    const args: any[] = [];

    if (data.battery_level !== undefined) {
      updates.push('battery_level = ?');
      args.push(data.battery_level);
    }
    if (data.is_charging !== undefined) {
      updates.push('is_charging = ?');
      args.push(data.is_charging ? 1 : 0);
    }
    if (data.network_type !== undefined) {
      updates.push('network_type = ?');
      args.push(data.network_type);
    }

    updates.push('last_seen = CURRENT_TIMESTAMP');
    updates.push('is_online = 1');
    updates.push('updated_at = CURRENT_TIMESTAMP');
    args.push(id);

    await db.execute({
      sql: `UPDATE devices SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    res.json({ success: true, message: 'Device status updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: error.issues });
    }
    res.status(500).json({ success: false, error: 'Failed to update device status' });
  }
};

export const deleteDevice = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const ownershipCheck = await db.execute({
            sql: `SELECT id FROM devices WHERE id = ? AND user_id = ?`,
            args: [id, userId]
        });

        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Device not found or unauthorized' });
        }

        await db.execute({ sql: 'DELETE FROM devices WHERE id = ?', args: [id] });
        res.json({ success: true, message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete device' });
    }
};
