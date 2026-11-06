import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { isMockModeActive, setMockMode } from '../services/apiClient';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mockActive = isMockModeActive();

  useEffect(() => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem("auth_token") : null;
    if (!token && !mockActive) {
      navigate("/login", { replace: true });
    }
  }, [mockActive, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/devices', label: 'Devices', icon: '📱' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/calls', label: 'Calls', icon: '📞' },
    { path: '/location', label: 'Location', icon: '📍' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Top Banner if in Demo Mode */}
      {mockActive && (
        <div className="bg-amber-500/90 backdrop-blur-md text-amber-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between z-50 shadow-sm border-b border-amber-600/20">
          <div className="flex items-center gap-2 truncate">
            <span>⚠️</span>
            <span className="truncate">DEMO / MOCK DATA MODE ACTIVE — Showing simulated data (not live Turso).</span>
          </div>
          <button
            onClick={() => setMockMode(false)}
            className="ml-3 px-2 py-0.5 rounded bg-white/70 hover:bg-white text-amber-900 font-bold text-xs whitespace-nowrap transition-colors"
          >
            Switch to Live Production
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Top Header (hidden on md and up) */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 liquid-glass z-30 flex items-center justify-between px-4 border-b border-white/50" style={{ top: mockActive ? '28px' : '0' }}>
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Logo" className="w-8 h-8 drop-shadow" />
            <span className="font-bold text-lg text-indigo-900 tracking-tight">Device Manager</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 text-gray-700 font-bold focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Slide-down / Drawer Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full liquid-glass p-5 pt-20 flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all font-medium text-sm ${
                        isActive(item.path)
                          ? 'bg-white/80 shadow-sm text-indigo-700 font-bold'
                          : 'text-gray-700 hover:bg-white/40'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t border-white/40">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-3 rounded-2xl text-red-600 font-bold text-sm hover:bg-red-50/60"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar (hidden on mobile, visible on md and up) */}
        <nav className="hidden md:flex w-64 lg:w-72 m-4 liquid-glass rounded-3xl flex-col overflow-hidden relative z-10 shrink-0">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/favicon.svg" alt="Logo" className="w-10 h-10 drop-shadow-md" />
              <div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight leading-tight">
                  Device Manager
                </h2>
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  {mockActive ? "Demo Workspace" : "Production Admin"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 overflow-y-auto pb-4">
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                      isActive(item.path)
                        ? 'bg-white/70 shadow-sm text-indigo-700 font-bold'
                        : 'text-gray-600 hover:bg-white/40 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-t border-white/40 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-2xl text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-all font-medium text-sm"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-4 md:pl-0 pt-20 md:pt-4 overflow-hidden w-full">
          <div className="h-full w-full overflow-y-auto liquid-glass rounded-3xl relative z-10 shadow-lg">
            <Outlet />
          </div>
        </main>

        {/* Decorative background blur elements */}
        <div className="fixed top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
        <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="fixed -bottom-32 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>
      </div>
    </div>
  );
};
