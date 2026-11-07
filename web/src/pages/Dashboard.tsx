import React, { useEffect, useState } from "react";
import { RefreshCw, Smartphone, Battery, Wifi, Clock, AlertTriangle } from "lucide-react";
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
      console.warn("Unable to fetch dashboard devices from backend:", err?.message || err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Production backend service is currently waking up or unreachable. Please retry shortly."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const selectedDevice =
    devices.find((d) => d.id === selectedDeviceId) ||
    (devices.length > 0 ? devices[0] : undefined);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 p-8">
        <div className="w-12 h-12 border-4 border-white/60 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-700 text-sm font-bold">
          Synchronizing live device telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
            Real-time telemetry and status synchronization for authorized Android devices
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="self-start sm:self-auto glass-button text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh Live Status</span>
        </button>
      </header>

      {error && (
        <div className="mb-6 p-5 rounded-3xl liquid-glass border-amber-300/80 text-slate-900 text-xs sm:text-sm">
          <div className="font-extrabold mb-1 flex items-center gap-2 text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5]" />
            <span>Backend Connection Notice</span>
          </div>
          <p className="mb-3 text-slate-800 font-medium">{error}</p>
          <button
            onClick={fetchDevices}
            className="glass-button !py-1.5 !px-4 text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
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
          <h2 className="text-lg font-black text-slate-950 tracking-tight">
            Connected Devices ({devices.length})
          </h2>
          <p className="text-xs text-slate-700 font-semibold">
            Select any paired device card to inspect its recorded battery telemetry curve
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {devices.length === 0 ? (
          <div className="col-span-full liquid-card flex flex-col items-center justify-center p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-full liquid-glass-droplet flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-slate-900 stroke-[2.2]" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-950 mb-2">
              No Devices Registered
            </h3>
            <p className="text-slate-700 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
              No Android devices are currently paired with your account. Sign in on the Device Manager Android app and tap Sync All Authorized Data to register your device.
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
                    ? "ring-2 ring-slate-900/80 scale-[1.01]"
                    : "hover:scale-[1.005]"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg sm:text-xl text-slate-950 tracking-tight">
                        {device.name}
                      </h3>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold liquid-glass-droplet text-slate-950 tracking-wider">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600">
                      {device.model} • {device.androidVersion}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      device.isOnline
                        ? "bg-emerald-500/20 border-emerald-400/70 text-emerald-950"
                        : "bg-white/50 border-white/80 text-slate-700"
                    }`}
                  >
                    {device.isOnline ? "Online" : "Offline"}
                  </div>
                </div>

                <div className="space-y-2.5 mt-5">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-white/45 border border-white/75 text-xs sm:text-sm">
                    <span className="text-slate-700 font-bold flex items-center gap-2">
                      <Battery className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                      Battery
                    </span>
                    <span className="font-black text-slate-950">
                      {device.batteryLevel}% {device.isCharging ? "⚡ Charging" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-white/45 border border-white/75 text-xs sm:text-sm">
                    <span className="text-slate-700 font-bold flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                      Network
                    </span>
                    <span className="font-black text-slate-950">
                      {device.networkType || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-white/45 border border-white/75 text-xs sm:text-sm">
                    <span className="text-slate-700 font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                      Last Sync
                    </span>
                    <span className="font-bold text-slate-900 truncate max-w-[160px] text-xs">
                      {device.lastSeen
                        ? new Date(device.lastSeen).toLocaleString()
                        : "Never"}
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
