import { describe, it, expect } from 'vitest';
import { apiClient } from './apiClient';

describe('apiClient', () => {
  it('fetches mock devices', async () => {
    const devices = await apiClient.getDevices();
    expect(devices.length).toBeGreaterThan(0);
    expect(devices[0]).toHaveProperty('id');
  });

  it('fetches a single mock device', async () => {
    const devices = await apiClient.getDevices();
    const device = await apiClient.getDevice(devices[0].id);
    expect(device).toBeDefined();
    expect(device?.id).toBe(devices[0].id);
  });
});
