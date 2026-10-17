import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Send, Globe, Video, ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#06070a] pt-16 pb-12 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link 
              to="/"
              className="flex items-center gap-3 group w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-wider text-slate-900 dark:text-white font-['Outfit']">
                CINE<span className="text-red-500">FLOW</span>
              </span>
            </Link>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Jahon kinematografiyasining eng sara durdonalari, 4K Ultra HD formatdagi filmlar va yuqori sifatli onlayn tomosha platformasi.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a href="https://t.me" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-200 dark:border-transparent shadow-sm" title="Telegram">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-200 dark:border-transparent shadow-sm" title="Video">
                <Video className="w-4 h-4" />
              </a>
              <Link to="/about" className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all border border-slate-200 dark:border-transparent shadow-sm" title="Website">
                <Globe className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Outfit']">
              Sahifalar
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="hover:text-red-500 transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/movies" className="hover:text-red-500 transition-colors">{t.nav.movies}</Link></li>
              <li><Link to="/about" className="hover:text-red-500 transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="hover:text-red-500 transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          {/* Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Outfit']">
              Janrlar
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/movies?genre=Action" className="hover:text-red-500 transition-colors">Action (Jangari)</Link></li>
              <li><Link to="/movies?genre=Sci-Fi" className="hover:text-red-500 transition-colors">Sci-Fi (Fantastika)</Link></li>
              <li><Link to="/movies?genre=Drama" className="hover:text-red-500 transition-colors">Drama</Link></li>
              <li><Link to="/movies?genre=Animation" className="hover:text-red-500 transition-colors">Animation (Multfilm)</Link></li>
            </ul>
          </div>

          {/* Tech Stack & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Outfit']">
              Infratuzilma
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Cloud DB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>React + React Router</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <Link to="/admin/login" className="hover:underline">Admin: movie@movie.uz</Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CineFlow Movie Portal. Barcha huquqlar himoyalangan.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <span>Yuqoriga qaytish</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
