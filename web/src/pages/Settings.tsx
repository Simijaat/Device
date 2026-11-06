import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl, isMockModeActive, setMockMode } from "../services/apiClient";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);
  const [syncInterval, setSyncInterval] = useState(() => {
    return typeof localStorage !== "undefined" ? localStorage.getItem("dashboard_sync_interval") || "60" : "60";
  });
  const [wifiOnly, setWifiOnly] = useState(() => {
    return typeof localStorage !== "undefined" ? localStorage.getItem("dashboard_wifi_only") !== "false" : true;
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
  const mockActive = isMockModeActive();

  const handleClearSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setClearedNotice("Session cleared. Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 800);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dashboard_sync_interval", syncInterval);
    localStorage.setItem("dashboard_wifi_only", wifiOnly ? "true" : "false");
    setClearedNotice("Preferences saved to local application storage.");
    setTimeout(() => setClearedNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto max-w-4xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
          System Settings
        </h1>
        <p className="text-indigo-900/60 font-medium text-xs sm:text-sm mt-0.5">
          Configure synchronization preferences, active session security, and network topology
        </p>
      </header>

      {clearedNotice && (
        <div className="mb-6 p-4 rounded-xl bg-green-50/90 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold backdrop-blur-sm">
          {clearedNotice}
        </div>
      )}

      <div className="space-y-6">
        {/* Sync Preferences Card */}
        <div className="liquid-card">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🔄</span> Client Sync Policies
          </h2>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Dashboard Polling Frequency
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-white/70 border border-white/80 text-xs sm:text-sm font-medium focus:outline-none"
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
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="wifiOnly" className="text-xs sm:text-sm font-medium text-gray-700">
                Restricted to Unmetered Wi-Fi connections
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              Save Sync Preferences
            </button>
          </form>
        </div>

        {/* Security & Session Card */}
        <div className="liquid-card">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>🛡️</span> Security & Active Session
          </h2>
          <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-4">
            <p>
              <span className="font-semibold text-gray-800">Authenticated Account:</span>{" "}
              {currentUser?.username || "Authenticated Master User"}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Session Security:</span>{" "}
              Stored securely in HTTP Authorization headers (Bearer JWT token).
            </p>
            <p>
              <span className="font-semibold text-gray-800">Operational Mode:</span>{" "}
              <span className={mockActive ? "text-amber-700 font-bold" : "text-green-700 font-bold"}>
                {mockActive ? "Isolated Demo Mode (In-Memory Simulation)" : "Live Production Backend"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClearSession}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
            >
              End Session & Clear Tokens
            </button>
            <button
              onClick={() => setMockMode(!mockActive)}
              className="glass-button text-xs sm:text-sm text-gray-700 font-semibold"
            >
              {mockActive ? "Connect to Live Production" : "Switch to Isolated Demo"}
            </button>
          </div>
        </div>

        {/* API Backend Diagnostics Card */}
        <div className="liquid-card bg-white/40">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span>🔌</span> Network Infrastructure
          </h2>
          <div className="text-xs sm:text-sm space-y-2 text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Configured API Endpoint:</span>{" "}
              <code className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-xs break-all">
                {getApiBaseUrl()}
              </code>
            </p>
            <p>
              <span className="font-semibold text-gray-900">Production Server:</span>{" "}
              <code className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 font-mono text-xs">
                https://backend-ttml.onrender.com
              </code>
            </p>
            <p className="text-gray-500 text-[11px] pt-1">
              All communications are enforced over TLS/HTTPS with JWT authorization checks on every sensitive endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
