import React from "react";
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      {/* Liquid Glass Sidebar */}
      <nav className="w-72 m-4 liquid-glass rounded-3xl flex flex-col overflow-hidden relative z-10">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">Device Manager</h2>
          </div>
        </div>
        
        <div className="flex-1 px-4 overflow-y-auto pb-4">
          <ul className="space-y-2">
            {[
              { path: '/', label: 'Dashboard', icon: '📊' },
              { path: '/devices', label: 'Devices', icon: '📱' },
              { path: '/messages', label: 'Messages', icon: '💬' },
              { path: '/calls', label: 'Calls', icon: '📞' },
              { path: '/location', label: 'Location', icon: '📍' },
              { path: '/settings', label: 'Settings', icon: '⚙️' }
            ].map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 font-medium ${
                    isActive(item.path) 
                      ? 'bg-white/60 shadow-sm text-indigo-700' 
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

        <div className="p-4 border-t border-white/40">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 w-full p-3 rounded-2xl text-red-500 hover:bg-red-50/50 hover:text-red-600 transition-all font-medium"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pl-0 overflow-hidden">
        <div className="h-full w-full overflow-y-auto liquid-glass rounded-3xl relative z-10">
           <Outlet />
        </div>
      </main>
      
      {/* Decorative background blur elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed -bottom-32 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>
    </div>
  );
};
