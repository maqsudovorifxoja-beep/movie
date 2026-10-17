import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Film, Plus, Search, Edit2, Trash2, Star, Eye, CheckCircle2, 
  Sparkles, Filter, ExternalLink 
} from 'lucide-react';
import { fetchMovies, deleteMovie, updateMovie } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { genresList } from '../../data/initialMovies';

export function AdminMoviesPage() {
  const { getMovieTitle } = useLanguage();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchMovies();
    setMovies(res.movies || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id) => {
    await deleteMovie(id);
    setMovies(prev => prev.filter(m => m.id !== id));
    setDeleteConfirmId(null);
    showToast("Film o'chirildi!");
  };

  const handleToggleFeatured = async (movie) => {
    const updated = !movie.is_featured;
    await updateMovie(movie.id, { is_featured: updated });
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, is_featured: updated } : m));
    showToast(updated ? "Film asosiy bannerga belgilandi" : "Bannerdan olindi");
  };

  const handleToggleTrending = async (movie) => {
    const updated = !movie.is_trending;
    await updateMovie(movie.id, { is_trending: updated });
    setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, is_trending: updated } : m));
    showToast(updated ? "Film trendga qo'shildi" : "Trenddan olindi");
  };

  const filteredMovies = movies.filter(m => {
    const matchSearch = !searchQuery.trim() || 
      (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title_uz || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = selectedGenre === 'All' || 
      m.genres?.some(g => g.toLowerCase() === selectedGenre.toLowerCase());
    return matchSearch && matchGenre;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
            Kinolar Boshqaruvi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Barcha mavjud filmlarni tahrirlash, o'chirish va yangilarini qo'shish ({movies.length} ta film)
          </p>
        </div>

        <Link
          to="/admin/movies/new"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Kino Qo'shish</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#10121a] p-4 rounded-2xl border border-white/[0.08]">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nomi bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Genre Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Janr:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#161824] border border-white/[0.08] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
          >
            {genresList.map(g => (
              <option key={g} value={g}>{g === 'All' ? 'Barcha janrlar' : g}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Movies Table */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#10121a] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Film</th>
                <th className="py-3.5 px-4">Yili</th>
                <th className="py-3.5 px-4">Reyting</th>
                <th className="py-3.5 px-4">Sifat</th>
                <th className="py-3.5 px-4">Holat</th>
                <th className="py-3.5 px-4">Ko'rishlar</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredMovies.map((movie) => {
                const title = getMovieTitle(movie);
                return (
                  <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Poster & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster_url}
                          alt={title}
                          className="w-10 h-14 rounded-lg object-cover bg-black flex-shrink-0"
                        />
                        <div>
                          <Link 
                            to={`/movie/${movie.id}`} 
                            className="font-bold text-white text-sm hover:text-red-400 transition-colors line-clamp-1"
                          >
                            {title}
                          </Link>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {movie.genres?.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Year */}
                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {movie.release_year}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{movie.rating}</span>
                      </div>
                    </td>

                    {/* Quality */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/10 text-white">
                        {movie.quality?.includes('4K') ? '4K UHD' : 'HD'}
                      </span>
                    </td>

                    {/* Badges Toggle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(movie)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            movie.is_featured
                              ? 'bg-rose-600 text-white'
                              : 'bg-white/[0.05] text-slate-500 hover:text-white'
                          }`}
                          title="Bannerga chiqarish"
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
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {movie.views_count?.toLocaleString() || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <Link
                          to={`/movie/${movie.id}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-all"
                          title="Saytda ko'rish"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          to={`/admin/movies/edit/${movie.id}`}
                          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        {deleteConfirmId === movie.id ? (
                          <div className="flex items-center gap-1 bg-red-600/20 p-1 rounded-lg border border-red-500/30">
                            <button
                              onClick={() => handleDelete(movie.id)}
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
  );
}
