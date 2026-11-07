import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sliders, Shield, Server, LogOut } from "lucide-react";
import { getApiBaseUrl, DEFAULT_PRODUCTION_API } from "../services/apiClient";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);
  const [syncInterval, setSyncInterval] = useState(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem("dashboard_sync_interval") || "60"
      : "60";
  });
  const [wifiOnly, setWifiOnly] = useState(() => {
    return typeof localStorage !== "undefined"
      ? localStorage.getItem("dashboard_wifi_only") !== "false"
      : true;
  });
  const [currentUser] = useState<{ id?: string; username?: string } | null>(() => {
    if (typeof localStorage === "undefined") return null;
    const userRaw = localStorage.getItem("auth_user");
    if (userRaw) {
      try {
        return JSON.parse(userRaw);
      } catch {
        return { username: "Authorized User" };
      }
    }
    return null;
  });

  const handleClearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setClearedNotice("Session cleared. Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 600);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dashboard_sync_interval", syncInterval);
    localStorage.setItem("dashboard_wifi_only", wifiOnly ? "true" : "false");
    setClearedNotice("Sync preferences saved.");
    setTimeout(() => setClearedNotice(null), 3000);
  };

  return (
    <div className="py-2 sm:py-4 w-full">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
          Configure synchronization preferences, active session security, and production network topology
        </p>
      </header>

      {clearedNotice && (
        <div className="mb-6 p-4 rounded-2xl liquid-glass-droplet text-emerald-950 text-xs sm:text-sm font-extrabold">
          {clearedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Preferences Card */}
        <div className="liquid-card">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 mb-4 flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-slate-900 stroke-[2.4]" />
            <span>Client Sync Policies</span>
          </h2>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                Dashboard Polling Frequency
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 60 minutes (Standard)</option>
                <option value="120">Every 2 hours</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="wifiOnly"
                checked={wifiOnly}
                onChange={(e) => setWifiOnly(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <label
                htmlFor="wifiOnly"
                className="text-xs sm:text-sm font-bold text-slate-800"
              >
                Restrict background uploads to unmetered Wi-Fi connections
              </label>
            </div>

            <button type="submit" className="mt-2 glass-button text-xs sm:text-sm">
              Save Sync Preferences
            </button>
          </form>
        </div>

        {/* Security & Session Card */}
        <div className="liquid-card">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 mb-3 flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-slate-900 stroke-[2.4]" />
            <span>Security &amp; Active Session</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 mb-5 font-medium">
            <p>
              <span className="font-extrabold text-slate-950">Authenticated Account:</span>{" "}
              {currentUser?.username || "Authorized Master User"}
            </p>
            <p>
              <span className="font-extrabold text-slate-950">Session Security:</span>{" "}
              Authenticated via Bearer JWT token over HTTPS.
            </p>
            <p>
              <span className="font-extrabold text-slate-950">Operational Mode:</span>{" "}
              <span className="text-emerald-800 font-extrabold">
                Live Production Backend (Turso LibSQL)
              </span>
            </p>
          </div>

          <button
            onClick={handleClearSession}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white font-extrabold inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 stroke-[2.4]" />
            <span>End Session &amp; Clear Tokens</span>
          </button>
        </div>

        {/* API Backend Diagnostics Card */}
        <div className="liquid-card lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 mb-3 flex items-center gap-2.5">
            <Server className="w-5 h-5 text-slate-900 stroke-[2.4]" />
            <span>Network Infrastructure</span>
          </h2>
          <div className="text-xs sm:text-sm space-y-2 text-slate-800 font-medium">
            <p>
              <span className="font-extrabold text-slate-950">Browser Proxy Route:</span>{" "}
              <code className="px-2.5 py-0.5 rounded-full bg-white/70 border border-white text-slate-900 font-mono text-xs">
                {getApiBaseUrl()}
              </code>
            </p>
            <p>
              <span className="font-extrabold text-slate-950">Production Upstream:</span>{" "}
              <code className="px-2.5 py-0.5 rounded-full bg-white/70 border border-white text-slate-900 font-mono text-xs break-all">
                {DEFAULT_PRODUCTION_API}
              </code>
            </p>
            <p className="text-slate-600 text-xs pt-1">
              All API requests authenticate against the production Render service and persist directly to Turso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
