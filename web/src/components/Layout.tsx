import React from "react";

import { Outlet, Link } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">Device Manager</h2>
        <ul className="space-y-2">
          <li><Link to="/" className="block p-2 hover:bg-gray-100 rounded">Dashboard</Link></li>
          <li><Link to="/devices" className="block p-2 hover:bg-gray-100 rounded">Devices</Link></li>
          <li><Link to="/messages" className="block p-2 hover:bg-gray-100 rounded">Messages</Link></li>
          <li><Link to="/calls" className="block p-2 hover:bg-gray-100 rounded">Calls</Link></li>
          <li><Link to="/location" className="block p-2 hover:bg-gray-100 rounded">Location</Link></li>
          <li><Link to="/settings" className="block p-2 hover:bg-gray-100 rounded">Settings</Link></li>
        </ul>
      </nav>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
