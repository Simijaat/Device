import React, { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Smartphone,
  Send,
  PhoneCall,
  Compass,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("auth_token")
        : null;
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/devices", label: "Devices", icon: Smartphone },
    { path: "/messages", label: "Messages", icon: Send },
    { path: "/calls", label: "Calls", icon: PhoneCall },
    { path: "/location", label: "Location", icon: Compass },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isSettingsActive = location.pathname === "/settings";

  return (
    <div className="flex flex-col h-screen overflow-hidden relative select-none sm:select-auto">
      {/* Ambient Chromatic Caustic Orbs for Optical Glass Refraction */}
      <div className="fixed top-[-6rem] left-[8%] w-96 h-96 bg-amber-300/45 rounded-full filter blur-3xl pointer-events-none z-0"></div>
      <div className="fixed top-[10%] right-[10%] w-96 h-96 bg-rose-400/35 rounded-full filter blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-[12%] left-[20%] w-96 h-96 bg-cyan-400/35 rounded-full filter blur-3xl pointer-events-none z-0"></div>

      {/* Refractive Color Ribbon Behind Bottom Pill Navigation */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90vw] max-w-[500px] h-16 rounded-full pointer-events-none z-20 opacity-75 blur-xl"
        style={{
          background:
            "linear-gradient(90deg, rgba(234,179,8,0.62) 0%, rgba(244,63,94,0.68) 38%, rgba(59,130,246,0.62) 72%, rgba(16,185,129,0.60) 100%)",
        }}
      />

      {/* Sleek Floating Liquid Glass Top Header */}
      <header className="px-3 sm:px-6 pt-3 sm:pt-4 pb-1 z-30 shrink-0">
        <div className="max-w-6xl mx-auto liquid-glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl liquid-glass-droplet p-1 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/favicon.svg"
                alt="Device Manager Logo"
                className="w-8 h-8 rounded-xl drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-none">
                Device Manager
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                Live Production Telemetry
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleLogout}
              className="liquid-glass-droplet px-3.5 py-2 rounded-full text-xs font-extrabold text-slate-900 hover:text-red-700 flex items-center gap-1.5 transition-all active:scale-95"
              title="Sign out of session"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.4]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content Area (Padded at bottom for Floating Liquid Glass Pill Bar) */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pt-2 pb-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Universal Floating Liquid Glass Pill Bottom Navigation Bar (Matching Attached Reference Images) */}
      <nav
        aria-label="Primary Bottom Navigation"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-[520px]"
      >
        <div className="liquid-glass-pill-nav rounded-full p-2 flex items-center justify-between gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                title={item.label}
                className={`relative flex items-center justify-center h-13 sm:h-14 rounded-full transition-all duration-300 ${
                  active
                    ? "liquid-glass-droplet px-6 sm:px-8 text-slate-950 scale-[1.02]"
                    : "px-3.5 sm:px-5 text-slate-900/85 hover:text-slate-950 hover:bg-white/25"
                }`}
              >
                <IconComponent
                  className="w-6 h-6 transition-transform duration-200"
                  strokeWidth={active ? 2.6 : 2.2}
                  fill={active && item.path === "/" ? "currentColor" : "none"}
                />
              </Link>
            );
          })}

          {/* Right-Most Circular Profile / Settings Avatar Pill (Matching Reference Images) */}
          <Link
            to="/settings"
            aria-label="Settings"
            title="System Settings"
            className={`relative flex items-center justify-center h-13 sm:h-14 rounded-full transition-all duration-300 ${
              isSettingsActive
                ? "liquid-glass-droplet px-5 sm:px-6 scale-[1.02]"
                : "px-2.5 sm:px-3.5 hover:bg-white/25"
            }`}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/95 shadow-md bg-slate-950 flex items-center justify-center relative">
              <img
                src="/favicon.svg"
                alt="Settings Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
};
