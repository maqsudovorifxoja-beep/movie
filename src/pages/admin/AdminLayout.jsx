import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Film, LayoutDashboard, PlusCircle, MessageSquare, Database, 
  LogOut, ExternalLink, Shield, Menu, X, CheckCircle2, AlertCircle, Bell, Send, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { checkDatabaseStatus } from '../../lib/supabase';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checking: true, isConnected: false });

  useEffect(() => {
    checkDatabaseStatus().then(res => {
      setDbStatus({ checking: false, isConnected: res.isConnected });
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Boshqaruv (Dashboard)', icon: LayoutDashboard, end: true },
    { to: '/admin/movies', label: "Kinolar Ro'yxati", icon: Film, end: true },
    { to: '/admin/movies/new', label: "Yangi Kino Qo'shish", icon: PlusCircle },
    { to: '/admin/messages', label: 'Xabarlar & Murojaatlar', icon: MessageSquare },
    { to: '/admin/telegram', label: 'Telegram Bot', icon: Send },
    { to: '/admin/sql', label: 'Supabase & SQL', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-slate-100 flex transition-colors">
      
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0c0e15] border-r border-slate-200 dark:border-white/[0.08] flex-col justify-between p-4 sticky top-0 h-screen z-30 transition-colors">
        
        {/* Top: Logo & Nav */}
        <div className="space-y-6">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 px-2 py-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white text-base tracking-wider font-['Outfit']">
                CINE<span className="text-red-500">FLOW</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

        </div>

        {/* Bottom: Profile & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
          
          {/* Live DB Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] text-[11px]">
            <span className={`w-2 h-2 rounded-full ${dbStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {dbStatus.isConnected ? 'Supabase Faol' : 'SQL sozlanmagan'}
            </span>
          </div>

          {/* Admin Email Chip */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Tizim administratori</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono mt-0.5">
              {user?.email || 'admin@movie.uz'}
            </div>
          </div>

          {/* View Website & Logout buttons */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10"
              title="Saytga o'tish"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytni Ko'rish</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-600 dark:bg-white/[0.05] dark:hover:bg-red-600 text-slate-600 dark:text-slate-400 hover:text-white transition-all border border-slate-200 dark:border-white/10"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white/90 dark:bg-[#0c0e15]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
          
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-slate-900 dark:text-white font-bold">Admin</span>
              <span>/</span>
              <span className="capitalize text-red-500 font-semibold">
                {location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-amber-500 dark:text-amber-300 border border-slate-200 dark:border-white/[0.08] transition-all"
              title={isDark ? "Yorug' rejim (Light mode)" : "Qorong'i rejim (Dark mode)"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-red-500" />
              <span>Saytga o'tish</span>
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">admin</span>
            </div>
          </div>

        </header>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-[#0c0e15] border-r border-white/10 p-5 flex flex-col justify-between z-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="font-black text-white text-lg font-['Outfit']">
                    CINE<span className="text-red-500">FLOW</span> ADMIN
                  </div>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-red-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
