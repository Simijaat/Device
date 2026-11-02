import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Device } from "../types";

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const data = await apiClient.getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this device? This will erase its associated data from the backend.")) {
      await apiClient.deleteDevice(id);
      fetchDevices();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
          Device Management
        </h1>
        <p className="text-indigo-900/60 font-medium mt-1">Manage and remove connected devices</p>
      </header>
      
      <div className="liquid-glass rounded-3xl overflow-hidden border border-white/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-white/40 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 bg-white/20">
              {devices.map((device) => (
                <tr key={device.id} className="transition-colors hover:bg-white/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{device.name}</div>
                    <div className="text-sm font-medium text-gray-500">{device.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl backdrop-blur-md border ${
                      device.isOnline 
                        ? 'bg-green-100/50 border-green-200 text-green-700' 
                        : 'bg-gray-100/50 border-gray-200 text-gray-600'
                    }`}>
                      {device.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {device.networkType || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(device.id)} 
                      className="glass-button !py-1.5 !px-3 text-red-600 hover:!bg-red-50 hover:!border-red-200 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-medium bg-white/30">
                    No devices registered.
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
