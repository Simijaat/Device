import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sliders, Shield, Server, LogOut, KeyRound, CheckCircle2 } from "lucide-react";
import { apiClient, getApiBaseUrl, DEFAULT_PRODUCTION_API } from "../services/apiClient";
import {
  SECURITY_QUESTIONS,
  validateSecurityQuestionsSelection,
} from "../utils/securityQuestions";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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
        return { username: "Admin" };
      }
    }
    return null;
  });

  // Security questions state (Pick 2 of 5)
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([
    ...SECURITY_QUESTIONS,
  ]);
  const [questionsConfigured, setQuestionsConfigured] = useState(false);
  const [question1, setQuestion1] = useState<string>(SECURITY_QUESTIONS[0]);
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState<string>(SECURITY_QUESTIONS[1]);
  const [answer2, setAnswer2] = useState("");
  const [savingQuestions, setSavingQuestions] = useState(false);

  // Change single master password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiClient
      .getAuthStatus()
      .then((status) => {
        if (status?.success) {
          setQuestionsConfigured(status.securityQuestionsConfigured);
          if (
            Array.isArray(status.availableQuestions) &&
            status.availableQuestions.length === 5
          ) {
            setAvailableQuestions(status.availableQuestions);
          }
          if (
            Array.isArray(status.configuredQuestions) &&
            status.configuredQuestions.length === 2
          ) {
            setQuestion1(status.configuredQuestions[0]);
            setQuestion2(status.configuredQuestions[1]);
          }
        }
      })
      .catch(() => {});
  }, []);

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
    setErrorNotice(null);
    localStorage.setItem("dashboard_sync_interval", syncInterval);
    localStorage.setItem("dashboard_wifi_only", wifiOnly ? "true" : "false");
    setClearedNotice("Sync preferences saved.");
    setTimeout(() => setClearedNotice(null), 3000);
  };

  const handleSaveSecurityQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setClearedNotice(null);

    const validation = validateSecurityQuestionsSelection({
      question1,
      answer1,
      question2,
      answer2,
    });

    if (!validation.valid) {
      setErrorNotice(validation.error || "Please select 2 distinct security questions.");
      return;
    }

    setSavingQuestions(true);
    try {
      const res = await apiClient.saveSecurityQuestions({
        username: currentUser?.username || "Admin",
        question1,
        answer1,
        question2,
        answer2,
      });
      if (res?.success) {
        setQuestionsConfigured(true);
        setAnswer1("");
        setAnswer2("");
        setClearedNotice(
          "Your 2 Security Questions have been saved! You can now use them on the Login screen to reset your password anytime."
        );
      } else {
        setErrorNotice(res?.error || "Failed to save security questions.");
      }
    } catch (err: any) {
      setErrorNotice(
        err.response?.data?.error ||
          err.message ||
          "Failed to save security questions."
      );
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    setClearedNotice(null);

    if (!currentPassword.trim()) {
      setErrorNotice("Please enter your current active password.");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorNotice("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorNotice("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await apiClient.changePassword({
        username: currentUser?.username || "Admin",
        currentPassword,
        newPassword,
      });
      if (res?.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setClearedNotice(
          "Master password updated! All previous passwords have been permanently deactivated — only your new password works."
        );
      } else {
        setErrorNotice(res?.error || "Failed to update password.");
      }
    } catch (err: any) {
      setErrorNotice(
        err.response?.data?.error ||
          err.message ||
          "Failed to update password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="py-2 sm:py-4 w-full">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
          Configure synchronization preferences, single active master password, 2-of-5 security questions for recovery, and session security
        </p>
      </header>

      {clearedNotice && (
        <div
          role="status"
          className="mb-6 p-4 rounded-2xl liquid-glass-droplet text-emerald-950 text-xs sm:text-sm font-extrabold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{clearedNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-400/60 text-red-950 text-xs sm:text-sm font-extrabold"
        >
          {errorNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Active Master Password Update Card */}
        <div className="liquid-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-slate-900 stroke-[2.4]" />
              <span>Single Active Master Password</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-950 border border-emerald-500/40">
              Strict 1-Password Policy Enforced
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold mb-4">
            Only 1 single master password is valid at any time. Updating your password here (or via the 2 Security Questions on the login screen) immediately invalidates and deletes all previous passwords.
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5"
                >
                  Current Active Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-master-password"
                  className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5"
                >
                  New Master Password
                </label>
                <input
                  id="new-master-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-master-password"
                  className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-master-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="glass-button text-xs sm:text-sm"
            >
              {changingPassword
                ? "Updating Master Password..."
                : "Update Single Active Password"}
            </button>
          </form>
        </div>

        {/* Security Questions & Password Recovery Card (2 of 5 Questions) */}
        <div className="liquid-card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-slate-900 stroke-[2.4]" />
              <span>Password Recovery Security Questions (Select 2 of 5)</span>
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                questionsConfigured
                  ? "bg-emerald-500/20 text-emerald-950 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-950 border border-amber-500/40"
              }`}
            >
              {questionsConfigured
                ? "2 Security Questions Active"
                : "Not Configured Yet"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-semibold mb-4">
            Choose any 2 security questions out of the 5 questions below and enter your secret answers. Direct password overwrite is disabled — answering these 2 questions is required to reset the master password on the login page.
          </p>

          <form onSubmit={handleSaveSecurityQuestions} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-white/40 border border-white/70">
                <label
                  htmlFor="settings-q1"
                  className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider"
                >
                  Security Question 1
                </label>
                <select
                  id="settings-q1"
                  value={question1}
                  onChange={(e) => setQuestion1(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-bold text-slate-950 focus:outline-none"
                >
                  {availableQuestions.map((q) => (
                    <option key={`sq1-${q}`} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  id="settings-a1"
                  type="text"
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  placeholder="Enter new answer for Question 1"
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white/40 border border-white/70">
                <label
                  htmlFor="settings-q2"
                  className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider"
                >
                  Security Question 2
                </label>
                <select
                  id="settings-q2"
                  value={question2}
                  onChange={(e) => setQuestion2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-bold text-slate-950 focus:outline-none"
                >
                  {availableQuestions.map((q) => (
                    <option key={`sq2-${q}`} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  id="settings-a2"
                  type="text"
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  placeholder="Enter new answer for Question 2"
                  className="w-full px-4 py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingQuestions}
              className="glass-button text-xs sm:text-sm"
            >
              {savingQuestions
                ? "Saving Security Questions..."
                : "Save 2 Security Questions"}
            </button>
          </form>
        </div>

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
              {currentUser?.username || "Admin"}
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
