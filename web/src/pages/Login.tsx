import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, isMockModeActive, setMockMode, DEFAULT_PRODUCTION_API } from "../services/apiClient";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const mockActive = isMockModeActive();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await apiClient.register(username, password);
      }
      const result = await apiClient.login(username, password);
      if (result.success && result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("auth_user", JSON.stringify(result.user || { username }));
        navigate("/");
      } else {
        setError(result.error || "Authentication failed: No token returned.");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError(`Cannot reach backend at ${DEFAULT_PRODUCTION_API}. If the remote Render server is booting or sleeping, please retry in a moment, or use Demo Mode for offline preview.`);
      } else {
        setError(err.message || (isRegistering ? "Registration failed" : "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 liquid-glass rounded-[2rem] shadow-2xl relative z-10 mx-4">
        <div className="flex flex-col items-center mb-6">
          <img src="/favicon.svg" alt="Device Manager Logo" className="w-16 h-16 mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight text-center">
            Device Manager
          </h1>
          <p className="text-xs font-semibold text-indigo-900/60 mt-1 uppercase tracking-wider">
            {mockActive ? "⚠️ Isolated Demo Mode" : "🔒 Live Production Authentication"}
          </p>
        </div>

        {mockActive && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium text-center">
            <strong>Demo Mode Active:</strong> Simulating in-memory preview. Data does not affect live Turso database.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-600 text-xs sm:text-sm font-medium text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-indigo-900/70 pl-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-white/70 border border-white/80 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 shadow-sm p-3 transition-all backdrop-blur-md text-gray-800 text-sm"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-indigo-900/70 pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-white/70 border border-white/80 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 shadow-sm p-3 transition-all backdrop-blur-md text-gray-800 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? "Connecting..." : (isRegistering ? "Initialize Master Account" : "Sign in to Dashboard")}
          </button>

          <div className="flex flex-col items-center gap-2 pt-2 text-xs">
            <button
              type="button"
              className="text-indigo-900/70 font-semibold hover:text-indigo-600 underline"
              onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
            >
              {isRegistering ? "Already initialized? Sign In" : "First time setup? Initialize master account"}
            </button>

            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 pt-2"
              onClick={() => setMockMode(!mockActive)}
            >
              {mockActive ? "Switch to Live Production Server" : "Switch to Isolated Demo Mode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
