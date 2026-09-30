import axios from 'axios';
import type { Device, Message, Call, Location, Contact, InstalledApp, PermissionStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Better fallback for relative path

const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// We need an exact shape matching for API responses to avoid `any`.
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

  getDevices: async (): Promise<Device[]> => {
    const response = await api.get('/devices');
    return response.data.data.map((d: ApiDevice) => ({
      id: d.id,
      name: d.name,
      model: d.model,
      androidVersion: d.android_version,
      appVersion: d.app_version,
      lastSeen: d.last_seen,
      isOnline: !!d.is_online,
      batteryLevel: d.battery_level,
      isCharging: !!d.is_charging,
      networkType: d.network_type
    }));
  },

  getDevice: async (id: string): Promise<Device | undefined> => {
    const response = await api.get(`/devices/${id}`);
    const d: ApiDevice = response.data.data;
    return {
      id: d.id,
      name: d.name,
      model: d.model,
      androidVersion: d.android_version,
      appVersion: d.app_version,
      lastSeen: d.last_seen,
      isOnline: !!d.is_online,
      batteryLevel: d.battery_level,
      isCharging: !!d.is_charging,
      networkType: d.network_type
    };
  },

  deleteDevice: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },

  getMessages: async (deviceId?: string): Promise<Message[]> => {
    const url = deviceId ? `/messages?deviceId=${deviceId}` : '/messages';
    const response = await api.get(url);
    return response.data.data.map((m: ApiMessage) => ({
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
    const url = deviceId ? `/calls?deviceId=${deviceId}` : '/calls';
    const response = await api.get(url);
    return response.data.data.map((c: ApiCall) => ({
      id: c.id,
      deviceId: c.device_id,
      number: c.number,
      type: c.type,
      duration: c.duration,
      timestamp: c.timestamp
    }));
  },

  getLocations: async (deviceId?: string): Promise<Location[]> => {
    const url = deviceId ? `/locations?deviceId=${deviceId}` : '/locations';
    const response = await api.get(url);
    return response.data.data.map((l: ApiLocation) => ({
      id: l.id,
      deviceId: l.device_id,
      latitude: l.latitude,
      longitude: l.longitude,
      accuracy: l.accuracy,
      timestamp: l.timestamp
    }));
  },

  getContacts: async (deviceId?: string): Promise<Contact[]> => {
    const url = deviceId ? `/contacts?deviceId=${deviceId}` : '/contacts';
    const response = await api.get(url);
    return response.data.data.map((c: ApiContact) => ({
      id: c.id,
      deviceId: c.device_id,
      name: c.name,
      phoneNumber: c.phone_number
    }));
  },

  getApps: async (deviceId?: string): Promise<InstalledApp[]> => {
    const url = deviceId ? `/apps?deviceId=${deviceId}` : '/apps';
    const response = await api.get(url);
    return response.data.data.map((a: ApiApp) => ({
      id: a.id,
      deviceId: a.device_id,
      appName: a.app_name,
      packageName: a.package_name,
      versionName: a.version_name
    }));
  },

  getPermissions: async (_deviceId?: string): Promise<PermissionStatus[]> => {
    // We don't have a backend implementation for permissions yet, returning empty or fallback.
    return [];
  },
};
