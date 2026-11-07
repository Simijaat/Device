import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Device } from "../types";
import { BatteryHistoryChart } from "../components/BatteryHistoryChart";

export const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDevices();
      setDevices(data);
    } catch (err: any) {
      console.warn("Notice: Unable to fetch dashboard devices from backend", err?.message || err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Backend service currently unreachable. If the server is booting up, please retry shortly or switch to Demo Mode."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || (devices.length > 0 ? devices[0] : undefined);

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
            Real-time management and telemetry for authorized personal devices
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
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm backdrop-blur-sm shadow-sm">
          <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-950">
            <span>⚠️</span> Backend Connection Notice
          </div>
          <p className="mb-3">{error}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={fetchDevices}
              className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-semibold text-xs transition-colors"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => {
                localStorage.setItem('dev_mock_mode', 'true');
                window.location.reload();
              }}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
            >
              ⚡ Switch to Isolated Demo Mode
            </button>
          </div>
        </div>
      )}

      {/* Battery Level History Visualization with Recharts */}
      {devices.length > 0 && selectedDevice && (
        <BatteryHistoryChart
          device={selectedDevice}
          allDevices={devices}
          onSelectDevice={setSelectedDeviceId}
        />
      )}

      {/* Devices Grid Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
            Connected Devices ({devices.length})
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Click any device card below to view its battery telemetry curve
          </p>
        </div>
      </div>

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
          devices.map((device) => {
            const isSelected = selectedDevice?.id === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`liquid-card group cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 bg-white/70 scale-[1.01]'
                    : 'hover:bg-white/60 hover:scale-[1.005]'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800 tracking-tight">{device.name}</h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white tracking-wider">
                          Active Chart
                        </span>
                      )}
                    </div>
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
            );
          })
        )}
      </div>
    </div>
  );
};
