import type { Device, Message, Call, Location, Contact, InstalledApp, PermissionStatus } from '../types';
import { mockDevices, mockMessages, mockCalls, mockLocations, mockContacts, mockApps, mockPermissions } from '../mock/data';


// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  getDevices: async (): Promise<Device[]> => {
    await delay(500);
    return mockDevices;
  },

  getDevice: async (id: string): Promise<Device | undefined> => {
    await delay(300);
    return mockDevices.find(d => d.id === id);
  },

  getMessages: async (deviceId?: string): Promise<Message[]> => {
    await delay(500);
    if (deviceId) {
      return mockMessages.filter(m => m.deviceId === deviceId);
    }
    return mockMessages;
  },

  getCalls: async (deviceId?: string): Promise<Call[]> => {
    await delay(500);
    if (deviceId) {
      return mockCalls.filter(c => c.deviceId === deviceId);
    }
    return mockCalls;
  },

  getLocations: async (deviceId?: string): Promise<Location[]> => {
    await delay(500);
    if (deviceId) {
      return mockLocations.filter(l => l.deviceId === deviceId);
    }
    return mockLocations;
  },

  getContacts: async (deviceId?: string): Promise<Contact[]> => {
    await delay(500);
    if (deviceId) {
      return mockContacts.filter(c => c.deviceId === deviceId);
    }
    return mockContacts;
  },

  getApps: async (deviceId?: string): Promise<InstalledApp[]> => {
    await delay(500);
    if (deviceId) {
       return mockApps.filter(a => a.deviceId === deviceId);
    }
    return mockApps;
  },

  getPermissions: async (_deviceId?: string): Promise<PermissionStatus[]> => {
    await delay(500);
    // In a real app, permissions might be per-device, but we use the same mock list for now.
    return mockPermissions;
  },
};
