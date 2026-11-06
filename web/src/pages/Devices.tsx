import React, { useEffect, useState } from "react";
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
      console.warn("Notice: Unable to fetch devices from backend", err?.message || err);
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
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
          Device Management
        </h1>
        <p className="text-indigo-900/60 font-medium text-xs sm:text-sm mt-0.5">
          View paired hardware and manage cloud authorizations
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="liquid-card bg-white/95 max-w-sm w-full p-6 text-center shadow-2xl border border-white">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Disconnect Device?</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              This will revoke synchronization privileges and remove associated cloud telemetry records.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="liquid-glass rounded-3xl overflow-hidden border border-white/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-white/40 backdrop-blur-md">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Network</th>
                <th className="px-4 sm:px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 bg-white/20">
              {devices.map((device) => (
                <tr key={device.id} className="transition-colors hover:bg-white/40">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-sm">{device.name}</div>
                    <div className="text-xs text-gray-500">{device.model} • {device.androidVersion}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-lg border ${
                      device.isOnline 
                        ? 'bg-green-100/60 border-green-200 text-green-700' 
                        : 'bg-gray-100/60 border-gray-200 text-gray-600'
                    }`}>
                      {device.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-medium hidden sm:table-cell">
                    {device.networkType || 'Unknown'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-xs">
                    <button
                      onClick={() => setDeletingId(device.id)}
                      className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-xs sm:text-sm font-medium bg-white/30">
                    No active devices found.
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
