import React, { useState, useEffect } from 'react';
import { 
  Film, Plus, Edit2, Trash2, Search, Star, Eye, Shield, LogOut, ArrowLeft, 
  Database, Check, Copy, AlertCircle, MessageSquare, BarChart3, Sparkles, 
  ExternalLink, CheckCircle2, Clock, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MovieFormModal } from './MovieFormModal';
import { 
  fetchMovies, createMovie, updateMovie, deleteMovie, 
  fetchMessages, deleteMessage, checkDatabaseStatus 
} from '../../lib/supabase';

export function AdminDashboard({ onBackToSite, movies, onRefreshMovies }) {
  const { user, logout } = useAuth();
  const { t, getMovieTitle } = useLanguage();

  const [activeTab, setActiveTab] = useState('movies'); // 'movies', 'messages', 'sql', 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieToEdit, setSelectedMovieToEdit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [dbStatus, setDbStatus] = useState({ checking: true, isConnected: false });
  const [copiedSql, setCopiedSql] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Load messages and check DB status
  useEffect(() => {
    loadMessages();
    checkDb();
  }, []);

  const checkDb = async () => {
    setDbStatus({ checking: true, isConnected: false });
    const status = await checkDatabaseStatus();
    setDbStatus({ checking: false, isConnected: status.isConnected, count: status.count });
  };

  const loadMessages = async () => {
    const list = await fetchMessages();
    setMessages(list);
  };

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Movie CRUD Handlers
  const handleOpenAdd = () => {
    setSelectedMovieToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setSelectedMovieToEdit(movie);
    setIsModalOpen(true);
  };

  const handleSaveMovie = async (movieData) => {
    if (selectedMovieToEdit) {
      await updateMovie(selectedMovieToEdit.id, movieData);
      showNotification("Film muvaffaqiyatli yangilandi!");
    } else {
      await createMovie(movieData);
      showNotification("Yangi film muvaffaqiyatli qo'shildi!");
    }
    onRefreshMovies();
  };

  const handleDeleteMovie = async (id) => {
    await deleteMovie(id);
    setDeleteConfirmId(null);
    showNotification("Film o'chirildi!");
    onRefreshMovies();
  };

  const handleToggleFeatured = async (movie) => {
    await updateMovie(movie.id, { is_featured: !movie.is_featured });
    onRefreshMovies();
  };

  const handleToggleTrending = async (movie) => {
    await updateMovie(movie.id, { is_trending: !movie.is_trending });
    onRefreshMovies();
  };

  const handleDeleteMsg = async (id) => {
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    showNotification("Xabar o'chirildi");
  };

  // Stats calculation
  const totalViews = movies.reduce((acc, m) => acc + (m.views_count || 0), 0);
  const avgRating = movies.length > 0 
    ? (movies.reduce((acc, m) => acc + (parseFloat(m.rating) || 0), 0) / movies.length).toFixed(1) 
    : '0';

  // Filter movies
  const filteredMovies = movies.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (m.title || '').toLowerCase().includes(q) ||
           (m.title_uz || '').toLowerCase().includes(q) ||
           (m.director || '').toLowerCase().includes(q);
  });

  const sqlCode = `-- CINEFLOW SUPABASE SQL SKRIPTI
-- Ushbu skriptni Supabase SQL Editor ga nusxalang va "RUN" tugmasini bosing:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_uz TEXT,
    title_ru TEXT,
    description TEXT,
    description_uz TEXT,
    description_ru TEXT,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT,
    trailer_url TEXT,
    trailer_id TEXT,
    release_year INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 7.5,
    quality TEXT DEFAULT '4K Ultra HD',
    genres TEXT[] DEFAULT '{}',
    director TEXT,
    cast_members TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Trigger (movie@movie.uz ga avtomatik admin roli beriladi)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN NEW.email = 'movie@movie.uz' THEN 'admin' ELSE 'user' END
    )
    ON CONFLICT (id) DO UPDATE
    SET role = CASE WHEN NEW.email = 'movie@movie.uz' THEN 'admin' ELSE profiles.role END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Admins Modify Movies" ON public.movies FOR ALL USING (true);
CREATE POLICY "Public Insert Messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col pt-4 pb-20">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-white/[0.08] bg-[#0c0e15]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Saytga qaytish</span>
            </button>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-['Outfit'] hidden sm:inline">
                CineFlow Admin
              </span>
            </div>
          </div>

          {/* Admin User Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300 font-mono">
                {user?.email || 'movie@movie.uz'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                Admin
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-red-600 text-slate-400 hover:text-white border border-white/[0.08] transition-all"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full space-y-6">
        
        {/* Supabase Status Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          dbStatus.isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold">
                {dbStatus.isConnected ? "Supabase Bazasiga Ulandi!" : "Supabase Bazasini Sozlash Kerak"}
              </span>
              <span className="block text-slate-300 text-[11px] mt-0.5">
                {dbStatus.isConnected
                  ? `Real vaqtdagi PostgreSQL jadvallari faol. Kinolar soni: ${movies.length} ta`
                  : "Boshlang'ich 20 ta kinolar bilan jadvallarni yaratish uchun 'SQL Sozlamalari' bo'limidagi kodni run qiling."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!dbStatus.isConnected && (
              <button
                onClick={() => setActiveTab('sql')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
              >
                SQL Skriptini Olish
              </button>
            )}
            <button
              onClick={checkDb}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
            >
              Qayta tekshirish
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{t.admin.totalMovies}</span>
              <Film className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {movies.length}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
              +20 boshlang'ich film
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{t.admin.totalViews}</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {(totalViews / 1000).toFixed(0)}k+
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Haqiqiy tomoshabinlar
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{t.admin.avgRating}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {avgRating} <span className="text-sm text-slate-500 font-normal">/ 10</span>
            </div>
            <span className="text-[11px] text-amber-400 mt-1 block">
              IMDb ballari asosida
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08]">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">{t.admin.unreadMessages}</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
              {messages.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Murojaatlar qutisi
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'movies'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{t.admin.tabMovies} ({movies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.admin.tabMessages} ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'sql'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.admin.tabSql}</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.admin.tabAnalytics}</span>
          </button>
        </div>

        {/* TAB 1: MOVIES MANAGEMENT */}
        {activeTab === 'movies' && (
          <div className="space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kinolar ichidan qidirish..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                onClick={handleOpenAdd}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>{t.admin.addMovieBtn}</span>
              </button>
            </div>

            {/* Movies Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] border-b border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Film</th>
                      <th className="py-3 px-4">Yili</th>
                      <th className="py-3 px-4">Reyting</th>
                      <th className="py-3 px-4">Sifat</th>
                      <th className="py-3 px-4">Holat (Banner / Trend)</th>
                      <th className="py-3 px-4">Ko'rishlar</th>
                      <th className="py-3 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredMovies.map((movie) => {
                      const title = getMovieTitle(movie);
                      return (
                        <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                          
                          {/* Title & Poster */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={movie.poster_url}
                                alt={title}
                                className="w-10 h-14 rounded-lg object-cover bg-black flex-shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white text-sm line-clamp-1">{title}</div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">{movie.genres?.join(', ')}</div>
                              </div>
                            </div>
                          </td>

                          {/* Year */}
                          <td className="py-3 px-4 font-semibold text-slate-300">
                            {movie.release_year}
                          </td>

                          {/* Rating */}
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{movie.rating}</span>
                            </div>
                          </td>

                          {/* Quality */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/10 text-white">
                              {movie.quality?.includes('4K') ? '4K' : 'HD'}
                            </span>
                          </td>

                          {/* Badges Toggles */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleFeatured(movie)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  movie.is_featured
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white/[0.05] text-slate-500 hover:text-white'
                                }`}
                                title="Hero bannerga chiqarish"
                              >
                                Featured
                              </button>
                              <button
                                onClick={() => handleToggleTrending(movie)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                  movie.is_trending
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white/[0.05] text-slate-500 hover:text-white'
                                }`}
                                title="Trendga chiqarish"
                              >
                                Trending
                              </button>
                            </div>
                          </td>

                          {/* Views */}
                          <td className="py-3 px-4 text-slate-300 font-mono">
                            {movie.views_count?.toLocaleString() || 0}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(movie)}
                                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all"
                                title="Tahrirlash"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {deleteConfirmId === movie.id ? (
                                <div className="flex items-center gap-1 bg-red-600/20 p-1 rounded-lg border border-red-500/30">
                                  <button
                                    onClick={() => handleDeleteMovie(movie.id)}
                                    className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded"
                                  >
                                    Ha
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-0.5 bg-white/10 text-white text-[10px] rounded"
                                  >
                                    Yo'q
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(movie.id)}
                                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-all"
                                  title="O'chirish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Sayt orqali yuborilgan murojaatlar ({messages.length})
              </h3>
            </div>

            {messages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08] space-y-3 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-white text-sm">{msg.name}</div>
                        <div className="text-xs text-red-400 font-mono">{msg.email}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteMsg(msg.id)}
                        className="p-2 rounded-lg bg-white/[0.05] hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {msg.subject && (
                      <div className="text-xs font-semibold text-slate-300">
                        Mavzu: {msg.subject}
                      </div>
                    )}

                    <p className="text-xs text-slate-300 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05] leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="text-[10px] text-slate-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#10121a] rounded-2xl border border-white/[0.06] text-slate-400 text-xs">
                Hozircha hech qanday xabar kelib tushmagan.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SQL & SUPABASE SETUP */}
        {activeTab === 'sql' && (
          <div className="space-y-6">
            
            {/* Guide Step-by-Step */}
            <div className="p-6 rounded-3xl bg-[#10121a] border border-white/[0.08] space-y-4">
              <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Database className="w-5 h-5 text-red-500" />
                <span>Supabase SQL Editor orqali ishga tushirish yo'riqnomasi</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">1</span>
                  <div className="font-bold text-sm text-white">SQL Kodini Nusxalang</div>
                  <p className="text-xs text-slate-400">Pastdagi yashil "Kodni nusxalash" tugmasini bosing.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">2</span>
                  <div className="font-bold text-sm text-white">Supabase Dashboard oching</div>
                  <p className="text-xs text-slate-400">
                    <a href="https://supabase.com/dashboard/project/erfwnqbjvyjguflpfifa/sql" target="_blank" rel="noreferrer" className="text-red-400 underline font-semibold flex items-center gap-1">
                      <span>SQL Editorga o'tish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">3</span>
                  <div className="font-bold text-sm text-white">"RUN" tugmasini bosing</div>
                  <p className="text-xs text-slate-400">Skript barcha jadvallarni, triggerlarni va 20 ta filmni bazangizga joylaydi!</p>
                </div>
              </div>
            </div>

            {/* SQL Code Block */}
            <div className="rounded-3xl border border-white/[0.1] bg-[#0c0d14] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#12141e]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">supabase_schema.sql</span>
                </div>

                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Kopiya qilindi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>SQL Kodini Nusxalash</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-6 text-xs text-emerald-400 font-mono overflow-x-auto max-h-[460px] leading-relaxed bg-[#0a0b11]">
                {sqlCode}
              </pre>
            </div>

          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top 5 Most Viewed Movies */}
            <div className="p-6 rounded-3xl bg-[#10121a] border border-white/[0.08] space-y-4">
              <h4 className="text-base font-bold text-white font-['Outfit']">
                Eng ko'p ko'rilgan filmlar
              </h4>
              <div className="space-y-3">
                {[...movies].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5).map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-500 w-4">#{i + 1}</span>
                      <span className="font-semibold text-white">{m.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{m.views_count?.toLocaleString()} ko'rish</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Distribution */}
            <div className="p-6 rounded-3xl bg-[#10121a] border border-white/[0.08] space-y-4">
              <h4 className="text-base font-bold text-white font-['Outfit']">
                Video Formatlari Sifati
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">4K Ultra HD</span>
                    <span className="text-red-400 font-bold">
                      {movies.filter(m => m.quality?.includes('4K')).length} ta film
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full" 
                      style={{ width: `${(movies.filter(m => m.quality?.includes('4K')).length / (movies.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Full HD (1080p)</span>
                    <span className="text-blue-400 font-bold">
                      {movies.filter(m => !m.quality?.includes('4K')).length} ta film
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" 
                      style={{ width: `${(movies.filter(m => !m.quality?.includes('4K')).length / (movies.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Add / Edit Movie Modal */}
      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovie}
        movieToEdit={selectedMovieToEdit}
      />

    </div>
  );
}
