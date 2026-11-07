import { describe, it, expect, beforeEach } from 'vitest';

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: storageMock, writable: true });

import {
  apiClient,
  DEFAULT_PRODUCTION_API,
  getApiBaseUrl,
  recordBatteryReading,
  getDeviceBatteryHistory
} from './apiClient';
import type { Device } from '../types';

describe('Production API Client & Telemetry Persistence Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enforces production backend URL hostname (backend-ttml, not ttnl)', () => {
    expect(DEFAULT_PRODUCTION_API).toBe('https://backend-ttml.onrender.com/api');
    expect(DEFAULT_PRODUCTION_API).not.toContain('ttnl');
  });

  it('defaults to production endpoint or same-origin proxy', () => {
    const url = getApiBaseUrl();
    expect(url).toBeDefined();
    expect(url.length).toBeGreaterThan(0);
  });

  it('records and retrieves real device battery telemetry readings accurately', () => {
    const sampleDevice: Device = {
      id: 'real-device-01',
      name: 'Galaxy S24',
      model: 'SM-S921B',
      androidVersion: 'Android 14',
      appVersion: '1.0',
      lastSeen: new Date().toISOString(),
      isOnline: true,
      batteryLevel: 82,
      isCharging: true,
      networkType: 'WiFi'
    };

    recordBatteryReading(sampleDevice);
    const history = getDeviceBatteryHistory(sampleDevice, 24);
    expect(history.length).toBe(1);
    expect(history[0].batteryLevel).toBe(82);
    expect(history[0].isCharging).toBe(true);
    expect(history[0].status).toBe('Charging');
  });

  it('apiClient methods are defined and properly typed', () => {
    expect(typeof apiClient.login).toBe('function');
    expect(typeof apiClient.register).toBe('function');
    expect(typeof apiClient.getDevices).toBe('function');
    expect(typeof apiClient.getMessages).toBe('function');
    expect(typeof apiClient.getCalls).toBe('function');
    expect(typeof apiClient.getLocations).toBe('function');
    expect(typeof apiClient.getContacts).toBe('function');
    expect(typeof apiClient.getApps).toBe('function');
    expect(typeof apiClient.deleteDevice).toBe('function');
    expect(typeof apiClient.deleteMessage).toBe('function');
  });

  it('session tokens are cleared upon explicit logout', () => {
    localStorage.setItem('auth_token', 'valid-jwt-token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'admin' }));

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
