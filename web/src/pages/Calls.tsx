import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Call } from "../types";

export const Calls: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await apiClient.getCalls();
        setCalls(data);
      } catch (err: any) {
        console.warn("Notice: Unable to fetch calls", err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const filtered = calls.filter((c) => {
    if (filterType === "all") return true;
    return c.type === filterType;
  });

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
            Call History
          </h1>
          <p className="text-indigo-900/60 font-medium mt-1">
            Incoming, outgoing, and missed call logs
          </p>
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-sm focus:outline-none shadow-sm font-medium"
          >
            <option value="all">All Calls</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-12 text-center">
          <div className="text-5xl mb-4 opacity-50">📞</div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Calls Logged</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {calls.length === 0
              ? "No call logs have been uploaded from devices."
              : "No call records match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="liquid-glass rounded-3xl overflow-hidden border border-white/60 shadow-xl">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-white/40 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Contact / Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 bg-white/20">
              {filtered.map((c) => {
                const isMissed = c.type === "missed";
                const isIncoming = c.type === "incoming";
                return (
                  <tr key={c.id} className="transition-colors hover:bg-white/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span>{isMissed ? "📵" : isIncoming ? "📲" : "📱"}</span>
                        <span>{c.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl border capitalize ${
                          isMissed
                            ? "bg-red-100/60 border-red-200 text-red-700"
                            : isIncoming
                            ? "bg-green-100/60 border-green-200 text-green-700"
                            : "bg-blue-100/60 border-blue-200 text-blue-700"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {formatDuration(c.duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
