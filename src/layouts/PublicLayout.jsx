import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export const Navbar = () => {
  return (
    <div className="absolute top-6 left-0 right-0 z-50 flex justify-center px-4 md:px-10 w-full">
      <nav className="rounded-full px-6 py-4 flex items-center justify-between w-full glass">
        <Link to="/" className="text-xl font-bold tracking-tighter text-textMain">
          SwiftBoard
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-sm font-medium text-textMuted hover:text-textMain transition-colors flex items-center gap-2">
            <LogIn size={18} /> Login
          </Link>
          <Link to="/pricing" className="bg-accent text-textMain px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity desktop-lift shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default function PublicLayout() {
  return (
    <div className="animate-bg-gradient text-textMain min-h-screen flex flex-col font-sans selection:bg-accent selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
