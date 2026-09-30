export interface Device {
  id: string;
  name: string;
  model?: string;
  androidVersion?: string;
  appVersion?: string;
  lastSeen: string;
  isOnline: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  networkType?: string;
}

export interface Message {
  id: string;
  deviceId: string;
  sender: string;
  content: string;
  type: string;
  timestamp: string;
}

export interface Call {
  id: string;
  deviceId: string;
  number: string;
  type: string;
  duration: number;
  timestamp: string;
}

export interface Location {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface Contact {
  id: string;
  deviceId: string;
  name: string;
  phoneNumber: string;
}

export interface InstalledApp {
  id: string;
  deviceId: string;
  appName: string;
  packageName: string;
  versionName?: string;
}

export interface PermissionStatus {
  permission: string;
  granted: boolean;
}
