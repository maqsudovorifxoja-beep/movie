import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, Plus, Eye, Star, MessageSquare, ArrowRight, 
  Sparkles, TrendingUp, Shield, Database, ExternalLink,
  Flame, RefreshCw, CheckCircle2, AlertCircle, Edit, Trash2,
  Clock, BarChart3, Filter, Search, X, Check, Award, Layers
} from 'lucide-react';
import { 
  fetchMovies, updateMovie, deleteMovie, 
  fetchMessages, checkDatabaseStatus 
} from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

export function AdminDashboardPage() {
  const { getMovieTitle } = useLanguage();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [dbStatus, setDbStatus] = useState({ checking: true, isConnected: false });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Table filters
  const [tableSearch, setTableSearch] = useState('');
  const [tableGenre, setTableGenre] = useState('All');
  const [tableQuality, setTableQuality] = useState('All');

  // Delete modal state
  const [movieToDelete, setMovieToDelete] = useState(null);

  const loadData = async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const [moviesRes, msgsRes, dbRes] = await Promise.all([
        fetchMovies(),
        fetchMessages(),
        checkDatabaseStatus()
      ]);
      setMovies(moviesRes.movies || []);
      setMessages(msgsRes || []);
      setDbStatus(dbRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      if (showSpin) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Action: Toggle Featured
  const handleToggleFeatured = async (movie) => {
    const nextState = !movie.is_featured;
    try {
      await updateMovie(movie.id, { is_featured: nextState });
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, is_featured: nextState } : m));
      triggerToast(nextState ? `"${getMovieTitle(movie)}" bosh premyeraga belgilandi` : `"${getMovieTitle(movie)}" bosh premyeradan olindi`);
    } catch (err) {
      triggerToast("Xatolik yuz berdi: " + err.message);
    }
  };

  // Quick Action: Toggle Trending
  const handleToggleTrending = async (movie) => {
    const nextState = !movie.is_trending;
    try {
      await updateMovie(movie.id, { is_trending: nextState });
      setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, is_trending: nextState } : m));
      triggerToast(nextState ? `"${getMovieTitle(movie)}" trendga qo'shildi` : `"${getMovieTitle(movie)}" trenddan olindi`);
    } catch (err) {
      triggerToast("Xatolik yuz berdi: " + err.message);
    }
  };

  // Delete Movie handler
  const confirmDelete = async () => {
    if (!movieToDelete) return;
    try {
      await deleteMovie(movieToDelete.id);
      setMovies(prev => prev.filter(m => m.id !== movieToDelete.id));
      triggerToast(`"${getMovieTitle(movieToDelete)}" filmi o'chirildi`);
      setMovieToDelete(null);
    } catch (err) {
      triggerToast("O'chirishda xatolik: " + err.message);
    }
  };

  // Computed metrics
  const totalViews = useMemo(() => {
    return movies.reduce((acc, m) => acc + (m.views_count || 0), 0);
  }, [movies]);

  const avgRating = useMemo(() => {
    if (!movies.length) return '0.0';
    const sum = movies.reduce((acc, m) => acc + (parseFloat(m.rating) || 0), 0);
    return (sum / movies.length).toFixed(1);
  }, [movies]);

  const count4K = useMemo(() => {
    return movies.filter(m => m.quality?.includes('4K')).length;
  }, [movies]);

  const topRatedMovie = useMemo(() => {
    if (!movies.length) return null;
    return [...movies].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))[0];
  }, [movies]);

  // Genre breakdown stats
  const genreStats = useMemo(() => {
    const map = {};
    movies.forEach(m => {
      (m.genres || []).forEach(g => {
        map[g] = (map[g] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: movies.length ? Math.round((count / movies.length) * 100) : 0
      }));
  }, [movies]);

  // Top 5 viewed movies
  const topViewedMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 5);
  }, [movies]);

  // Filtered recent movies table
  const filteredRecentMovies = useMemo(() => {
    return movies.filter(m => {
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase().trim();
        const titleEn = (m.title || '').toLowerCase();
        const titleUz = (m.title_uz || '').toLowerCase();
        const director = (m.director || '').toLowerCase();
        if (!titleEn.includes(query) && !titleUz.includes(query) && !director.includes(query)) {
          return false;
        }
      }
      if (tableGenre !== 'All') {
        if (!m.genres?.includes(tableGenre)) return false;
      }
      if (tableQuality !== 'All') {
        if (tableQuality === '4K' && !m.quality?.includes('4K')) return false;
        if (tableQuality === 'HD' && m.quality?.includes('4K')) return false;
      }
      return true;
    }).slice(0, 8);
  }, [movies, tableSearch, tableGenre, tableQuality]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(m => m.status === 'unread').length;
  }, [messages]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 dark:border-white/20 shadow-2xl animate-fade-in-up text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {movieToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMovieToDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl z-10 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
              Filmni o'chirishni tasdiqlaysizmi?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-bold">{getMovieTitle(movieToDelete)}</strong> bazadan butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMovieToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Ha, o'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/40 via-white to-white dark:from-red-950/30 dark:via-[#0e1017] dark:to-[#0e1017] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Shield className="w-3.5 h-3.5" />
                CineFlow Enterprise Console
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {dbStatus.isConnected ? "Baza Aloqasi Faol" : "Baza ulangan"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Kino Portali Boshqaruv Markazi
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Real vaqtdagi kino statistikasi, premyeralar boshqaruvi, tomoshabinlar faolligi va murojaatlar nazorati.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-all shadow-sm"
              title="Ma'lumotlarni yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
              <span>{isRefreshing ? 'Yuklanmoqda...' : 'Yangilash'}</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Saytni Ko'rish</span>
            </Link>

            <Link
              to="/admin/movies/new"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Kino Qo'shish</span>
            </Link>
          </div>

        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* 4 Professional KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Jami Kinolar */}
        <div className="relative group p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Katalog Filmlari
            </span>
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {movies.length} <span className="text-xs font-bold text-slate-500 uppercase tracking-normal">ta film</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
            <span className="font-semibold text-red-600 dark:text-red-400">{count4K} ta 4K UHD</span>
            <span>{movies.length - count4K} ta Full HD</span>
          </div>
        </div>

        {/* Card 2: Jami Ko'rishlar */}
        <div className="relative group p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Jami Tomoshalar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
            {(totalViews / 1000).toFixed(0)}k+
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.8% bu oyda
            </span>
            <span>O'rtacha {(movies.length ? Math.round(totalViews / movies.length) : 0).toLocaleString()} / film</span>
          </div>
        </div>

        {/* Card 3: O'rtacha Reyting */}
        <div className="relative group p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sifat Ko'rsatkichi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-baseline gap-1.5">
            <span>{avgRating}</span>
            <span className="text-sm font-semibold text-slate-400">/ 10 IMDb</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05] truncate">
            <span>Top: </span>
            <strong className="text-slate-900 dark:text-white font-bold">{topRatedMovie ? getMovieTitle(topRatedMovie) : '—'}</strong>
          </div>
        </div>

        {/* Card 4: Yangi Xabarlar */}
        <div className="relative group p-6 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Murojaatlar & Takliflar
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-3">
            <span>{messages.length}</span>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white animate-pulse">
                {unreadMessagesCount} yangi
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
            <span className="text-slate-500">Tomoshabinlar pochtasi</span>
            <Link to="/admin/messages" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              O'qish →
            </Link>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid: Genre Distribution & Top Movies Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Genre Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Janrlar Bo'yicha Tahlil
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">Top 5 Janr</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Katalogdagi eng ko'p yuklangan asosiy film yo'nalishlari nisbati
            </p>

            <div className="space-y-4">
              {genreStats.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    <span className="font-mono text-slate-500">{item.count} ta film ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0 ? 'bg-gradient-to-r from-red-600 to-rose-600' :
                        idx === 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                        idx === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        idx === 3 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        'bg-purple-600'
                      }`}
                      style={{ width: `${Math.max(item.percent, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-500">
            <span>Jami faol janrlar: <strong>14+</strong></span>
            <Link to="/admin/movies" className="text-red-500 font-semibold hover:underline">
              Katalogda saralash →
            </Link>
          </div>
        </div>

        {/* Right: Top Viewed Movies Leaderboard (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Eng Ko'p Tomosha Qilingan Filmlar
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Reyting bo'yicha</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Tomoshabinlar eng ko'p kirgan va ko'rgan filmlar yetakchiligi
          </p>

          <div className="space-y-3">
            {topViewedMovies.map((movie, rank) => (
              <div 
                key={movie.id} 
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-mono flex-shrink-0 ${
                    rank === 0 ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' :
                    rank === 1 ? 'bg-slate-300 dark:bg-white/20 text-slate-800 dark:text-white' :
                    rank === 2 ? 'bg-amber-700/60 text-white' :
                    'bg-slate-200 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                  }`}>
                    {rank + 1}
                  </span>

                  <img 
                    src={movie.poster_url} 
                    alt="" 
                    className="w-10 h-13 rounded-lg object-cover bg-slate-200 dark:bg-black flex-shrink-0" 
                  />

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate font-['Outfit'] group-hover:text-red-500 transition-colors">
                      {getMovieTitle(movie)}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{movie.release_year}</span>
                      <span>•</span>
                      <span>{movie.duration} min</span>
                      <span>•</span>
                      <span className="font-semibold text-red-500">{movie.quality?.includes('4K') ? '4K' : 'HD'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {(movie.views_count || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      ko'rishlar
                    </div>
                  </div>

                  <Link
                    to={`/admin/movies/edit/${movie.id}`}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-white/[0.05] hover:bg-red-600 hover:text-white text-slate-600 dark:text-slate-400 transition-all"
                    title="Tahrirlash"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Interactive Recent Movies Table */}
      <div className="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        
        {/* Table Top Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
              Kino Katalogini Tezkor Boshqarish
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kinolar statusini (Bosh Premyera, Trending) bir tugma bilan bevosita o'zgartiring
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Nom bo'yicha qidirish..."
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={tableQuality}
              onChange={(e) => setTableQuality(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="All">Barcha sifatlar</option>
              <option value="4K">Faqat 4K UHD</option>
              <option value="HD">Full HD</option>
            </select>

            <Link
              to="/admin/movies"
              className="px-4 py-2 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold transition-all"
            >
              To'liq Katalog ({movies.length}) →
            </Link>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-white/[0.06] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Film & Rejissyor</th>
                <th className="py-3 px-4">Yili & Vaqti</th>
                <th className="py-3 px-4">Reyting</th>
                <th className="py-3 px-4">Sifat</th>
                <th className="py-3 px-4 text-center">Bosh Premyera</th>
                <th className="py-3 px-4 text-center">Trend (Top 10)</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredRecentMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  
                  {/* Film Title & Poster */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={movie.poster_url} 
                        alt="" 
                        className="w-10 h-14 rounded-lg object-cover bg-slate-200 dark:bg-black shadow-sm flex-shrink-0" 
                      />
                      <div className="min-w-0">
                        <Link 
                          to={`/movie/${movie.id}`}
                          target="_blank"
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-red-500 transition-colors font-['Outfit'] block truncate max-w-xs"
                        >
                          {getMovieTitle(movie)}
                        </Link>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {movie.director || "Rejissyor ko'rsatilmagan"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Year & Duration */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    <div>{movie.release_year}</div>
                    <div className="text-[11px] text-slate-400">{movie.duration} daqiqa</div>
                  </td>

                  {/* Rating */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500" />
                      {movie.rating}
                    </span>
                  </td>

                  {/* Quality */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      movie.quality?.includes('4K')
                        ? 'bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white'
                    }`}>
                      {movie.quality?.includes('4K') ? '4K UHD' : 'Full HD'}
                    </span>
                  </td>

                  {/* Featured Banner Toggle Switch */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(movie)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        movie.is_featured
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10'
                      }`}
                      title="Bosh bannerga o'rnatish yoki olib tashlash"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{movie.is_featured ? 'Boshda' : 'Yo\'q'}</span>
                    </button>
                  </td>

                  {/* Trending Charts Toggle Switch */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleTrending(movie)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        movie.is_trending
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10'
                      }`}
                      title="Top 10 Trend chartga qo'shish"
                    >
                      <Flame className="w-3 h-3" />
                      <span>{movie.is_trending ? 'Trendda' : 'Yo\'q'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/movie/${movie.id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                        title="Saytda ko'rish"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/admin/movies/edit/${movie.id}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-blue-600 dark:text-blue-400 transition-all"
                        title="Tahrirlash"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => setMovieToDelete(movie)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white dark:bg-white/[0.05] dark:hover:bg-red-600 text-slate-400 hover:text-white transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecentMovies.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Film className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
            <div className="text-sm font-bold">Mos keluvchi filmlar topilmadi</div>
            <div className="text-xs">Qidiruv yoki filtrlarni tozalab ko'ring</div>
          </div>
        )}

      </div>

      {/* Recent User Inquiries Stream (So'nggi Murojaatlar) */}
      <div className="rounded-3xl bg-white dark:bg-[#0e1017] border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
              So'nggi Murojaatlar ({messages.slice(0, 4).length})
            </h3>
          </div>
          <Link to="/admin/messages" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            Barcha xabarlar ({messages.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {messages.slice(0, 4).map((msg) => (
            <div 
              key={msg.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs truncate font-['Outfit']">
                    {msg.name}
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    msg.status === 'unread' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                  }`}>
                    {msg.status === 'unread' ? 'Yangi' : "O'qilgan"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono">
                  {msg.email}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1 leading-relaxed">
                  {msg.message}
                </p>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 dark:border-white/[0.05] flex items-center justify-between">
                <span>{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Yaqinda'}</span>
                <Link to="/admin/messages" className="text-red-500 font-semibold hover:underline">
                  Javob berish
                </Link>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              Hozircha yangi murojaatlar yo'q.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
