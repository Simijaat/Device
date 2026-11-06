import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Device } from "../types";

export const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDevices();
      setDevices(data);
    } catch (err: any) {
      console.error("Failed to fetch dashboard devices", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to load devices from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm font-medium">Connecting to device management service...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-indigo-900/60 font-medium text-xs sm:text-sm mt-0.5">
            Real-time management for authorized personal devices
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="self-start sm:self-auto glass-button !py-1.5 !px-3 text-xs flex items-center gap-1.5 text-indigo-700"
        >
          <span>🔄</span> Refresh Status
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm backdrop-blur-sm">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <span>⚠️</span> Communication Warning
          </div>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {devices.length === 0 ? (
          <div className="col-span-full liquid-card flex flex-col items-center justify-center p-8 sm:p-14 text-center">
            <div className="text-5xl sm:text-6xl mb-4 opacity-50">📱</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Devices Registered</h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md leading-relaxed">
              No Android devices are currently paired with your master account. Install and sign in to the Device Manager Android client to sync data.
            </p>
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="liquid-card group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-gray-800 tracking-tight">{device.name}</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{device.model}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-semibold backdrop-blur-md border ${
                  device.isOnline 
                    ? 'bg-green-100/60 border-green-200 text-green-700' 
                    : 'bg-gray-100/60 border-gray-200 text-gray-600'
                }`}>
                  {device.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              
              <div className="space-y-2.5 mt-5">
                 <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/40 border border-white/50 text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium flex items-center gap-1.5"><span>🔋</span> Battery</span>
                    <span className="font-bold text-gray-800">{device.batteryLevel}% {device.isCharging && '⚡'}</span>
                 </div>
                 <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/40 border border-white/50 text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium flex items-center gap-1.5"><span>📶</span> Network</span>
                    <span className="font-bold text-gray-800">{device.networkType || 'Unknown'}</span>
                 </div>
                 <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/40 border border-white/50 text-xs sm:text-sm">
                    <span className="text-gray-600 font-medium flex items-center gap-1.5"><span>⏱️</span> Last Sync</span>
                    <span className="font-bold text-gray-800 truncate max-w-[140px] text-xs">
                      {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
