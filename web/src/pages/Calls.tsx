import React, { useEffect, useState } from "react";
import { PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
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
        console.warn("Unable to fetch calls:", err?.message || err);
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
    <div className="py-2 sm:py-4">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Call History
          </h1>
          <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
            Incoming, outgoing, and missed call logs synchronized from verified devices
          </p>
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-full liquid-glass-input text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
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
          <div className="w-10 h-10 border-4 border-white/60 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-full liquid-glass-droplet flex items-center justify-center mb-4">
            <PhoneCall className="w-7 h-7 text-slate-900 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-black text-slate-950 mb-1">No Calls Logged</h3>
          <p className="text-slate-700 font-medium text-xs sm:text-sm max-w-sm">
            {calls.length === 0
              ? "No call logs have been uploaded from paired devices."
              : "No call records match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="liquid-glass rounded-[1.75rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/50">
              <thead className="bg-white/45">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Contact / Number
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 bg-white/25">
                {filtered.map((c) => {
                  const isMissed = c.type === "missed";
                  const isIncoming = c.type === "incoming";
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-white/45">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-black text-slate-950 flex items-center gap-2.5 text-sm">
                          {isMissed ? (
                            <PhoneMissed className="w-4 h-4 text-red-700 stroke-[2.3]" />
                          ) : isIncoming ? (
                            <PhoneIncoming className="w-4 h-4 text-emerald-700 stroke-[2.3]" />
                          ) : (
                            <PhoneOutgoing className="w-4 h-4 text-sky-700 stroke-[2.3]" />
                          )}
                          <span>{c.number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-full border capitalize ${
                            isMissed
                              ? "bg-red-500/20 border-red-400/60 text-red-950"
                              : isIncoming
                              ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-950"
                              : "bg-sky-500/20 border-sky-400/60 text-sky-950"
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-slate-800">
                        {formatDuration(c.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-700 font-semibold">
                        {new Date(c.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
