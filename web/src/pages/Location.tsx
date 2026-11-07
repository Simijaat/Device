import React, { useEffect, useState } from "react";
import { Compass, ExternalLink, MapPin } from "lucide-react";
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
        console.warn("Unable to fetch locations:", err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const latest = locations[0];

  return (
    <div className="py-2 sm:py-4">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Location Tracking
        </h1>
        <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
          Geographic coordinates and verified GPS telemetry history
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/60 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : locations.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-full liquid-glass-droplet flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-slate-900 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-black text-slate-950 mb-1">No Location Data</h3>
          <p className="text-slate-700 font-medium text-xs sm:text-sm max-w-sm">
            Enable location collection and sync on your Android device to inspect live GPS coordinates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {latest && (
            <div className="liquid-card p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl liquid-glass-droplet flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-slate-900 stroke-[2.3]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
                      Latest Recorded Position
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-0.5">
                      {latest.latitude.toFixed(6)}, {latest.longitude.toFixed(6)}
                    </h2>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-full liquid-glass-droplet text-xs text-slate-900 font-extrabold self-start sm:self-auto">
                  Accuracy: ±{latest.accuracy ? latest.accuracy.toFixed(1) : "N/A"}m
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${latest.latitude},${latest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button text-xs sm:text-sm inline-flex items-center gap-2"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.4]" />
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${latest.latitude}&mlon=${latest.longitude}#map=16/${latest.latitude}/${latest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button text-xs sm:text-sm inline-flex items-center gap-2"
                >
                  <span>OpenStreetMap</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.4]" />
                </a>
              </div>
            </div>
          )}

          <div className="liquid-glass rounded-[1.75rem] overflow-hidden">
            <div className="p-5 bg-white/45 border-b border-white/50">
              <h3 className="font-black text-slate-950 text-base">Location Timeline</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/50">
                <thead className="bg-white/35">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-extrabold text-slate-700 uppercase">
                      Latitude
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-extrabold text-slate-700 uppercase">
                      Longitude
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-extrabold text-slate-700 uppercase">
                      Accuracy
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-extrabold text-slate-700 uppercase">
                      Recorded At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 bg-white/25">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="transition-colors hover:bg-white/45">
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs sm:text-sm font-black text-slate-950">
                        {loc.latitude.toFixed(6)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs sm:text-sm font-black text-slate-950">
                        {loc.longitude.toFixed(6)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs sm:text-sm text-slate-800 font-bold">
                        ±{loc.accuracy ? loc.accuracy.toFixed(1) : "--"} m
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs sm:text-sm text-slate-700 font-semibold">
                        {new Date(loc.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
