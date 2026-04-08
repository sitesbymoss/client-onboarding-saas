import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, Settings as SettingsIcon, Bell, CircleUserRound, Menu, X, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthProvider';

export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, loading, user, orgDetails, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Templates', path: '/admin/templates', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex font-sans text-textMain selection:bg-accent selection:text-white">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary border-r border-accent/5 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 border-b border-accent/5">
          <Link to="/" className="text-xl font-bold tracking-tight text-textMain">SwiftBoard</Link>
          <button 
            className="md:hidden text-textMuted hover:text-textMain transition-colors" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 relative overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-accent text-textMain shadow-sm' 
                    : 'text-textMuted hover:bg-black/5 hover:text-textMain'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-primary/50 backdrop-blur-md border-b border-accent/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button 
              className="md:hidden text-textMuted hover:text-textMain transition-colors p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-textMuted hover:text-textMain transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 border-l border-accent/10 pl-4 md:pl-6">
              {orgDetails?.logo_url && (
                <img src={orgDetails.logo_url} alt="Organization Logo" className="w-8 h-8 rounded-full border border-accent/20 object-cover" />
              )}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-textMain">{user?.user_metadata?.full_name || 'Admin User'}</div>
                <div className="text-xs text-textMuted">{user?.email}</div>
              </div>
              <button title="Log Out" onClick={() => signOut()} className="p-3 ml-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors">
                <LogOut size={20} className="text-accent" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
