import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";

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
      if (isRegistering) { await apiClient.register(username, password); }
      const result = await apiClient.login(username, password);
      if (result.success) {
        localStorage.setItem("auth_token", result.token);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || (isRegistering ? "Registration failed" : "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-10 liquid-glass rounded-[2rem] shadow-2xl relative z-10 mx-4">
        <div className="flex flex-col items-center mb-8">
           <img src="/favicon.svg" alt="Device Manager Logo" className="w-16 h-16 mb-4 drop-shadow-lg" />
           <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight text-center">
             Device Manager
           </h1>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm font-medium text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-indigo-900/70 pl-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-white/60 border border-white/80 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 shadow-sm p-3 transition-all backdrop-blur-md text-gray-800"
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
              className="w-full rounded-xl bg-white/60 border border-white/80 focus:border-indigo-400 focus:ring focus:ring-indigo-200/50 shadow-sm p-3 transition-all backdrop-blur-md text-gray-800"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? "Processing..." : (isRegistering ? "Initialize Account" : "Sign in to Dashboard")}
          </button>
          <div className="text-center mt-4 text-sm text-indigo-900/60 font-medium cursor-pointer hover:text-indigo-600" onClick={() => { setIsRegistering(!isRegistering); setError(""); }}>{isRegistering ? "Back to Login" : "First time setup? Initialize account"}</div>
        </form>
      </div>
    </div>
  );
};
