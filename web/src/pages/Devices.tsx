import React, { useEffect, useState } from "react";
import { Smartphone, Trash2, RefreshCw } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { Device } from "../types";

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to load registered devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const confirmDelete = async (id: string) => {
    try {
      await apiClient.deleteDevice(id);
      setDeletingId(null);
      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove device.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-white/60 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Device Management
          </h1>
          <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
            Inspect paired Android hardware and manage cloud authorizations
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="self-start sm:self-auto glass-button text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Refresh List</span>
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-400/60 text-red-950 font-bold text-xs sm:text-sm">
          {error}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-card max-w-sm w-full p-6 text-center">
            <h3 className="text-lg font-black text-slate-950 mb-2">Disconnect Device?</h3>
            <p className="text-xs text-slate-700 font-medium mb-6 leading-relaxed">
              This will revoke synchronization privileges and remove associated cloud telemetry records.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="glass-button !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="px-5 py-2 rounded-full text-white bg-red-600 hover:bg-red-700 text-xs font-extrabold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="liquid-glass rounded-[1.75rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/50">
            <thead className="bg-white/45">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider hidden sm:table-cell">
                  Network &amp; Battery
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 bg-white/25">
              {devices.map((device) => (
                <tr key={device.id} className="transition-colors hover:bg-white/45">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full liquid-glass-droplet flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-slate-900 stroke-[2.3]" />
                      </div>
                      <div>
                        <div className="font-black text-slate-950 text-sm">{device.name}</div>
                        <div className="text-xs font-semibold text-slate-600">
                          {device.model} • {device.androidVersion}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-full border ${
                        device.isOnline
                          ? "bg-emerald-500/20 border-emerald-400/70 text-emerald-950"
                          : "bg-white/50 border-white/80 text-slate-700"
                      }`}
                    >
                      {device.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-slate-800 font-bold hidden sm:table-cell">
                    {device.networkType || "Unknown"} • {device.batteryLevel}%
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs">
                    <button
                      onClick={() => setDeletingId(device.id)}
                      className="px-3.5 py-1.5 rounded-full text-red-800 bg-red-500/15 hover:bg-red-500/25 border border-red-400/50 font-extrabold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-700 text-xs sm:text-sm font-bold"
                  >
                    No registered Android devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
