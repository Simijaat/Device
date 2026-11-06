import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Location as LocationType } from "../types";

export const Location: React.FC = () => {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiClient.getLocations();
        setLocations(data);
      } catch (err: any) {
        console.warn("Notice: Unable to fetch locations", err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const latest = locations[0];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
          Location Tracking
        </h1>
        <p className="text-indigo-900/60 font-medium mt-1">
          Geographic coordinates and GPS history
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : locations.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-12 text-center">
          <div className="text-5xl mb-4 opacity-50">📍</div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Location Data</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Enable location collection and sync on your Android device to see real-time coordinates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {latest && (
            <div className="liquid-card border-indigo-200/60 bg-white/50 p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                    Latest Recorded Position
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 mt-1">
                    {latest.latitude.toFixed(6)}, {latest.longitude.toFixed(6)}
                  </h2>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Accuracy: ±{latest.accuracy ? latest.accuracy.toFixed(1) : "N/A"}m
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${latest.latitude},${latest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button text-sm flex items-center gap-2 !bg-indigo-600 !text-white hover:!bg-indigo-700"
                >
                  <span>🗺️</span> View in Google Maps
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${latest.latitude}&mlon=${latest.longitude}#map=16/${latest.latitude}/${latest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button text-sm flex items-center gap-2 text-indigo-700"
                >
                  <span>🌐</span> OpenStreetMap
                </a>
              </div>
            </div>
          )}

          <div className="liquid-glass rounded-3xl overflow-hidden border border-white/60 shadow-xl">
            <div className="p-5 bg-white/40 border-b border-gray-200/50">
              <h3 className="font-bold text-gray-800 text-base">Location Timeline</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-white/30 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Latitude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Longitude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    Recorded At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 bg-white/20">
                {locations.map((loc) => (
                  <tr key={loc.id} className="transition-colors hover:bg-white/40">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {loc.latitude.toFixed(6)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {loc.longitude.toFixed(6)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                      ±{loc.accuracy ? loc.accuracy.toFixed(1) : "--"} m
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(loc.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
