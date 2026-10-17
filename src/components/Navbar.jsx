import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Globe, Shield, Menu, X, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar({ onSearchClick }) {
  const { lang, changeLanguage, t } = useLanguage();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const navItems = [
    { path: '/', label: t.nav.home },
    { path: '/movies', label: t.nav.movies },
    { path: '/about', label: t.nav.about },
    { path: '/contact', label: t.nav.contact },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/movies?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setIsMobileMenuOpen(false);
    } else {
      navigate('/movies');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-[#08090d]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl py-3.5' 
        : 'bg-gradient-to-b from-white/95 dark:from-[#08090d]/95 via-white/60 dark:via-[#08090d]/60 to-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 transition-all duration-300 group-hover:scale-105">
              <Film className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-1 font-['Outfit']">
                CINE<span className="text-red-500">FLOW</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-semibold -mt-1 hidden sm:block">
                Ultra Cinema
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-slate-100 dark:bg-white/[0.04] p-1.5 rounded-full border border-slate-200 dark:border-white/[0.07] backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-36 lg:w-48 pl-9 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:w-56 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Dark / Light Mode Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-amber-500 dark:text-amber-300 border border-slate-200 dark:border-white/[0.08] transition-all flex items-center gap-1.5 shadow-sm"
              title={isDark ? "Yorug' rejim (Light Mode)" : "Qorong'i rejim (Dark Mode)"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
                  <span className="hidden xl:inline text-xs font-semibold text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-all shadow-sm"
              >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline uppercase">{currentLang.code}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#12141d]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        changeLanguage(item.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs text-left transition-colors ${
                        item.code === lang
                          ? 'bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Portal Button */}
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                isAdmin
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-lg shadow-red-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/[0.1]'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-white' : 'text-red-500'}`} />
              <span className="hidden sm:inline">{isAdmin ? 'Admin Dashboard' : t.nav.admin}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0d0f17]/98 border-b border-slate-200 dark:border-white/10 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white"
            />
          </form>

          {/* Theme switcher in mobile drawer */}
          <button
            onClick={() => {
              toggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 border border-slate-200 dark:border-white/10"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span>{isDark ? "Yorug' rejim (Light mode)" : "Qorong'i rejim (Dark mode)"}</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 uppercase font-mono">
              {theme}
            </span>
          </button>

          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-white/10">
            <Link
              to={isAdmin ? '/admin' : '/admin/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold shadow-lg shadow-red-600/30"
            >
              <Shield className="w-4 h-4" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
