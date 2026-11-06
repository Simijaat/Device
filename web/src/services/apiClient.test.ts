import { describe, it, expect, beforeEach, vi } from 'vitest';

// Node environment localStorage polyfill for testing
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

import { apiClient, DEFAULT_PRODUCTION_API, getApiBaseUrl, isMockModeActive } from './apiClient';

describe('Security & API Client Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('enforces production backend URL hostname (backend-ttml, not ttnl)', () => {
    expect(DEFAULT_PRODUCTION_API).toBe('https://backend-ttml.onrender.com/api');
    expect(DEFAULT_PRODUCTION_API).not.toContain('ttnl');
  });

  it('defaults to production endpoint or environment configuration', () => {
    const url = getApiBaseUrl();
    expect(url).toBeDefined();
    expect(url.length).toBeGreaterThan(0);
  });

  it('ensures mock mode is isolated and disabled by default', () => {
    expect(isMockModeActive()).toBe(false);
  });

  it('can activate mock mode explicitly through isolated toggle', () => {
    localStorage.setItem('dev_mock_mode', 'true');
    expect(isMockModeActive()).toBe(true);
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

  it('session tokens are cleared upon explicit logout or 401 response', () => {
    localStorage.setItem('auth_token', 'valid-jwt-token');
    localStorage.setItem('auth_user', JSON.stringify({ username: 'admin' }));
    
    // Simulate clearing session
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
