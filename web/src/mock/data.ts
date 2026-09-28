import type { Device, Message, Call, Location, Contact, InstalledApp, PermissionStatus } from '../types';

export const mockDevices: Device[] = [
  {
    id: 'dev_123',
    model: 'Pixel 7',
    manufacturer: 'Google',
    androidVersion: '14',
    sdkVersion: 34,
    appVersion: '1.0.0',
    batteryPercentage: 85,
    isCharging: false,
    networkConnectivity: 'WiFi',
    lastSync: new Date().toISOString(),
  },
  {
    id: 'dev_456',
    model: 'Galaxy S23',
    manufacturer: 'Samsung',
    androidVersion: '13',
    sdkVersion: 33,
    appVersion: '1.0.0',
    batteryPercentage: 100,
    isCharging: true,
    networkConnectivity: 'LTE',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    deviceId: 'dev_123',
    address: '+1234567890',
    body: 'Hello there!',
    date: new Date().toISOString(),
    type: 'inbox',
    read: false,
  },
  {
    id: 'msg_2',
    deviceId: 'dev_123',
    address: '+0987654321',
    body: 'Did you get the package?',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'inbox',
    read: true,
  },
];

export const mockCalls: Call[] = [
  {
    id: 'call_1',
    deviceId: 'dev_123',
    number: '+1234567890',
    name: 'Alice',
    date: new Date().toISOString(),
    duration: 120,
    type: 'incoming',
  },
  {
    id: 'call_2',
    deviceId: 'dev_123',
    number: '+0987654321',
    name: 'Bob',
    date: new Date(Date.now() - 3600000).toISOString(),
    duration: 0,
    type: 'missed',
  },
];

export const mockLocations: Location[] = [
  {
    id: 'loc_1',
    deviceId: 'dev_123',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: new Date().toISOString(),
  },
];

export const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    deviceId: 'dev_123',
    displayName: 'Alice Smith',
    phoneNumber: '+1234567890',
  },
  {
    id: 'contact_2',
    deviceId: 'dev_123',
    displayName: 'Bob Jones',
    phoneNumber: '+0987654321',
  },
];

export const mockApps: InstalledApp[] = [
  {
    id: 'app_1',
    deviceId: 'dev_123',
    packageName: 'com.android.chrome',
    appName: 'Chrome',
    versionName: '120.0.6099.43',
    versionCode: 6099043,
  },
  {
    id: 'app_2',
    deviceId: 'dev_123',
    packageName: 'com.google.android.youtube',
    appName: 'YouTube',
    versionName: '18.49.34',
    versionCode: 15334562,
  },
];

export const mockPermissions: PermissionStatus[] = [
  { permission: 'Location', status: 'Granted' },
  { permission: 'Contacts', status: 'Denied' },
  { permission: 'SMS', status: 'Not requested' },
  { permission: 'Call Log', status: 'Denied' },
];
