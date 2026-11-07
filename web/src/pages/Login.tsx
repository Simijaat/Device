import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, ArrowRight } from "lucide-react";
import { apiClient, DEFAULT_PRODUCTION_API } from "../services/apiClient";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await apiClient.register(username, password);
      }

      let result;
      try {
        result = await apiClient.login(username, password);
      } catch (loginErr: any) {
        // If no master account has been initialized yet, try registering first then signing in
        if (!isRegistering && loginErr?.response?.status === 401) {
          try {
            await apiClient.register(username, password);
            result = await apiClient.login(username, password);
          } catch {
            throw loginErr;
          }
        } else {
          throw loginErr;
        }
      }

      if (result?.success && result?.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("auth_user", JSON.stringify(result.user || { username }));
        navigate("/");
      } else {
        setError(result?.error || "Authentication failed: No token returned.");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError(`Cannot reach production backend (${DEFAULT_PRODUCTION_API}). If the Render server is waking up, please wait a few seconds and try again.`);
      } else {
        setError(err.message || (isRegistering ? "Registration failed" : "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden relative px-4 py-8">
      {/* Chromatic Refraction Backdrop Orbs */}
      <div className="absolute top-[15%] left-[18%] w-80 h-80 bg-amber-300/50 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute top-[25%] right-[18%] w-80 h-80 bg-rose-400/45 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[18%] left-[35%] w-80 h-80 bg-cyan-400/45 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md p-8 sm:p-10 liquid-glass rounded-[2.25rem] relative z-10">
        <div className="flex flex-col items-center mb-7">
          <div className="w-20 h-20 rounded-3xl liquid-glass-droplet p-2 flex items-center justify-center mb-4">
            <img src="/favicon.svg" alt="Device Manager Logo" className="w-16 h-16 rounded-2xl drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight text-center">
            Device Manager
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-droplet mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
            <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
              Live Production Authentication
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-400/60 text-red-950 text-xs sm:text-sm font-bold text-center backdrop-blur-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.3] z-10 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-full liquid-glass-input pl-11 pr-4 py-3.5 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="Enter master username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider pl-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-700 absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.3] z-10 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full liquid-glass-input pl-11 pr-4 py-3.5 text-slate-950 font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-full liquid-glass-droplet text-slate-950 font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
          >
            <span>
              {loading
                ? "Authenticating with Backend..."
                : isRegistering
                ? "Initialize Master Account"
                : "Sign In to Dashboard"}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.6]" />
          </button>

          <div className="flex flex-col items-center pt-2 text-xs">
            <button
              type="button"
              className="text-slate-800 font-bold hover:text-slate-950 underline underline-offset-4"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
            >
              {isRegistering
                ? "Already initialized? Sign In"
                : "First time setup? Initialize master account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
