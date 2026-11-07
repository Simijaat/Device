import axios from 'axios';
import type { Device, Message, Call, Location, Contact, InstalledApp, PermissionStatus, BatteryDataPoint } from '../types';

// Production backend default with environment override
export const DEFAULT_PRODUCTION_API = 'https://backend-ttml.onrender.com/api';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'frontend-4swe.onrender.com') {
    return '/api';
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return DEFAULT_PRODUCTION_API;
};

const BATTERY_HISTORY_STORAGE_PREFIX = 'real_battery_telemetry_';

export const recordBatteryReading = (device: Device): void => {
  if (typeof localStorage === 'undefined' || !device || !device.id) return;
  try {
    const key = `${BATTERY_HISTORY_STORAGE_PREFIX}${device.id}`;
    const existingRaw = localStorage.getItem(key);
    const existing: BatteryDataPoint[] = existingRaw ? JSON.parse(existingRaw) : [];
    const timestampIso = device.lastSeen
      ? new Date(device.lastSeen).toISOString()
      : new Date().toISOString();
    const pointDate = new Date(timestampIso);
    const level = Math.max(0, Math.min(100, Math.round(device.batteryLevel ?? 0)));
    const isCharging = Boolean(device.isCharging);

    const newPoint: BatteryDataPoint = {
      timestamp: timestampIso,
      timeLabel: pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batteryLevel: level,
      isCharging,
      status: level >= 99 && isCharging ? 'Full' : isCharging ? 'Charging' : 'Discharging',
    };

    // Deduplicate if the latest recorded entry has the exact same timestamp or is within 1 minute with identical level
    const lastEntry = existing[existing.length - 1];
    if (
      !lastEntry ||
      (lastEntry.timestamp !== newPoint.timestamp &&
        (Math.abs(new Date(newPoint.timestamp).getTime() - new Date(lastEntry.timestamp).getTime()) > 60_000 ||
          lastEntry.batteryLevel !== newPoint.batteryLevel ||
          lastEntry.isCharging !== newPoint.isCharging))
    ) {
      const updated = [...existing, newPoint].slice(-96); // keep up to 96 real readings
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch {
    // Ignore storage quota errors
  }
};

export const getDeviceBatteryHistory = (device: Device, hoursWindow = 24): BatteryDataPoint[] => {
  if (!device || !device.id) return [];
  const cutoffMs = Date.now() - hoursWindow * 3600 * 1000;
  let stored: BatteryDataPoint[] = [];

  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${BATTERY_HISTORY_STORAGE_PREFIX}${device.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          stored = parsed.filter((pt: BatteryDataPoint) => {
            const t = new Date(pt.timestamp).getTime();
            return !Number.isNaN(t) && t >= cutoffMs;
          });
        }
      }
    } catch {
      stored = [];
    }
  }

  const liveTimestamp = device.lastSeen
    ? new Date(device.lastSeen).toISOString()
    : new Date().toISOString();
  const liveLevel = Math.max(0, Math.min(100, Math.round(device.batteryLevel ?? 0)));
  const liveCharging = Boolean(device.isCharging);
  const livePoint: BatteryDataPoint = {
    timestamp: liveTimestamp,
    timeLabel: new Date(liveTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    batteryLevel: liveLevel,
    isCharging: liveCharging,
    status: liveLevel >= 99 && liveCharging ? 'Full' : liveCharging ? 'Charging' : 'Discharging',
  };

  if (stored.length === 0) {
    return [livePoint];
  }

  return stored;
};

const getAuthToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const api = axios.create();

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error?.config?.url || '');
    const isAuthEndpoint =
      reqUrl.includes('/auth/login') ||
      reqUrl.includes('/auth/register') ||
      reqUrl.includes('/auth/reset-password') ||
      reqUrl.includes('/auth/security-questions');

    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

interface ApiDevice {
  id: string;
  name: string;
  model: string;
  android_version: string;
  app_version: string;
  last_seen: string;
  is_online: number;
  battery_level: number;
  is_charging: number;
  network_type: string;
}

interface ApiMessage {
  id: string;
  device_id: string;
  sender: string;
  content: string;
  type: string;
  timestamp: string;
}

interface ApiCall {
  id: string;
  device_id: string;
  number: string;
  type: string;
  duration: number;
  timestamp: string;
}

interface ApiLocation {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface ApiContact {
  id: string;
  device_id: string;
  name: string;
  phone_number: string;
}

interface ApiApp {
  id: string;
  device_id: string;
  app_name: string;
  package_name: string;
  version_name: string;
}

export interface AuthStatusResponse {
  success: boolean;
  initialized: boolean;
  masterUsername: string | null;
  securityQuestionsConfigured: boolean;
  configuredQuestions: string[];
  availableQuestions: string[];
}

export const apiClient = {
  getAuthStatus: async (): Promise<AuthStatusResponse> => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (
    username: string,
    password: string,
    securityQuestions?: {
      question1: string;
      answer1: string;
      question2: string;
      answer2: string;
    }
  ) => {
    const response = await api.post('/auth/register', {
      username,
      password,
      ...securityQuestions,
    });
    return response.data;
  },

  saveSecurityQuestions: async (payload: {
    username?: string;
    currentPassword?: string;
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
  }) => {
    const response = await api.post('/auth/security-questions', payload);
    return response.data;
  },

  resetPasswordWithQuestions: async (payload: {
    username: string;
    answer1: string;
    answer2: string;
    newPassword: string;
  }) => {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },

  getDevices: async (): Promise<Device[]> => {
    const response = await api.get('/devices');
    const items = response.data?.data || [];
    const mapped: Device[] = items.map((d: ApiDevice) => ({
      id: d.id,
      name: d.name,
      model: d.model || 'Unknown Model',
      androidVersion: d.android_version || 'Android',
      appVersion: d.app_version || '1.0',
      lastSeen: d.last_seen,
      isOnline: Boolean(d.is_online),
      batteryLevel: d.battery_level ?? 0,
      isCharging: Boolean(d.is_charging),
      networkType: d.network_type || 'Unknown'
    }));
    mapped.forEach(recordBatteryReading);
    return mapped;
  },

  getDevice: async (id: string): Promise<Device | undefined> => {
    const response = await api.get(`/devices/${id}`);
    const d: ApiDevice = response.data?.data;
    if (!d) return undefined;
    const device: Device = {
      id: d.id,
      name: d.name,
      model: d.model || 'Unknown Model',
      androidVersion: d.android_version || 'Android',
      appVersion: d.app_version || '1.0',
      lastSeen: d.last_seen,
      isOnline: Boolean(d.is_online),
      batteryLevel: d.battery_level ?? 0,
      isCharging: Boolean(d.is_charging),
      networkType: d.network_type || 'Unknown'
    };
    recordBatteryReading(device);
    return device;
  },

  deleteDevice: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },

  getMessages: async (deviceId?: string): Promise<Message[]> => {
    const url = deviceId ? `/messages?deviceId=${encodeURIComponent(deviceId)}` : '/messages';
    const response = await api.get(url);
    const items = response.data?.data || [];
    return items.map((m: ApiMessage) => ({
      id: m.id,
      deviceId: m.device_id,
      sender: m.sender,
      content: m.content,
      type: m.type,
      timestamp: m.timestamp
    }));
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}`);
  },

  getCalls: async (deviceId?: string): Promise<Call[]> => {
    const url = deviceId ? `/calls?deviceId=${encodeURIComponent(deviceId)}` : '/calls';
    const response = await api.get(url);
    const items = response.data?.data || [];
    return items.map((c: ApiCall) => ({
      id: c.id,
      deviceId: c.device_id,
      number: c.number,
      type: c.type,
      duration: c.duration,
      timestamp: c.timestamp
    }));
  },

  getLocations: async (deviceId?: string): Promise<Location[]> => {
    const url = deviceId ? `/locations?deviceId=${encodeURIComponent(deviceId)}` : '/locations';
    const response = await api.get(url);
    const items = response.data?.data || [];
    return items.map((l: ApiLocation) => ({
      id: l.id,
      deviceId: l.device_id,
      latitude: Number(l.latitude),
      longitude: Number(l.longitude),
      accuracy: Number(l.accuracy || 0),
      timestamp: l.timestamp
    }));
  },

  getContacts: async (deviceId?: string): Promise<Contact[]> => {
    const url = deviceId ? `/contacts?deviceId=${encodeURIComponent(deviceId)}` : '/contacts';
    const response = await api.get(url);
    const items = response.data?.data || [];
    return items.map((c: ApiContact) => ({
      id: c.id,
      deviceId: c.device_id,
      name: c.name,
      phoneNumber: c.phone_number
    }));
  },

  getApps: async (deviceId?: string): Promise<InstalledApp[]> => {
    const url = deviceId ? `/apps?deviceId=${encodeURIComponent(deviceId)}` : '/apps';
    const response = await api.get(url);
    const items = response.data?.data || [];
    return items.map((a: ApiApp) => ({
      id: a.id,
      deviceId: a.device_id,
      appName: a.app_name,
      packageName: a.package_name,
      versionName: a.version_name || 'Unknown'
    }));
  },

  getPermissions: async (_deviceId?: string): Promise<PermissionStatus[]> => {
    return [];
  },
};
