import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Device } from "../types";

export const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await apiClient.getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Failed to fetch dashboard devices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-indigo-900/60 font-medium mt-1">Monitor your connected devices</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.length === 0 ? (
          <div className="col-span-full liquid-card flex flex-col items-center justify-center p-12 text-center">
             <div className="text-6xl mb-4 opacity-50">📱</div>
             <h3 className="text-xl font-bold text-gray-700 mb-2">No Devices Yet</h3>
             <p className="text-gray-500 max-w-md">Install the Device Manager Android app and sign in to connect your first device to the dashboard.</p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="liquid-card group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-800 tracking-tight">{device.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{device.model}</p>
                </div>
                <div className={`p-2 rounded-xl backdrop-blur-md border ${
                  device.isOnline 
                    ? 'bg-green-100/50 border-green-200/50 text-green-700' 
                    : 'bg-gray-100/50 border-gray-200/50 text-gray-600'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${device.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-gray-600 font-medium text-sm flex items-center gap-2"><span>🔋</span> Battery</span>
                    <span className="font-bold text-gray-800">{device.batteryLevel}% {device.isCharging && '⚡'}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-gray-600 font-medium text-sm flex items-center gap-2"><span>📶</span> Network</span>
                    <span className="font-bold text-gray-800">{device.networkType || 'Unknown'}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-gray-600 font-medium text-sm flex items-center gap-2"><span>⏱️</span> Last Seen</span>
                    <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">{new Date(device.lastSeen).toLocaleString()}</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
