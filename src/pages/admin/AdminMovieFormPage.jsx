import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Film, ArrowLeft, Save, AlertCircle, Play, Star, Calendar, 
  Clock, CheckCircle2, User, Users, Image as ImageIcon 
} from 'lucide-react';
import { fetchMovies, createMovie, updateMovie } from '../../lib/supabase';
import { sendMovieToTelegram, getTelegramConfig } from '../../lib/telegram';
import { genresList } from '../../data/initialMovies';

export function AdminMovieFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [sendToTelegram, setSendToTelegram] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    title_uz: '',
    title_ru: '',
    description: '',
    description_uz: '',
    description_ru: '',
    poster_url: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    trailer_id: 'uYPbbksJxIg',
    release_year: 2024,
    duration: 140,
    rating: 8.5,
    quality: '4K Ultra HD',
    genres: ['Action', 'Sci-Fi'],
    director: '',
    castInput: '',
    is_featured: false,
    is_trending: false,
    views_count: 5000
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchMovies().then(res => {
        const found = res.movies?.find(m => String(m.id) === String(id));
        if (found) {
          setFormData({
            ...found,
            title_uz: found.title_uz || found.title,
            title_ru: found.title_ru || found.title,
            description_uz: found.description_uz || found.description,
            description_ru: found.description_ru || found.description,
            castInput: (found.cast || found.cast_members || []).join(', ')
          });
        }
        setFetching(false);
      });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleGenre = (genre) => {
    if (genre === 'All') return;
    setFormData(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.poster_url.trim()) {
      setError("Film nomi va poster havolasini kiritish majburiy!");
      return;
    }

    setLoading(true);
    setError(null);

    // Extract youtube trailer id
    let extractedId = formData.trailer_id;
    if (formData.trailer_url) {
      const match = formData.trailer_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        extractedId = match[1];
      }
    }

    const castList = formData.castInput
      ? formData.castInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      trailer_id: extractedId || 'Way9Dexny3w',
      cast: castList,
      cast_members: castList,
      release_year: parseInt(formData.release_year, 10) || 2024,
      duration: parseInt(formData.duration, 10) || 120,
      rating: parseFloat(formData.rating) || 7.5,
    };

    try {
      let savedResult = null;
      if (isEditMode) {
        savedResult = await updateMovie(id, payload);
      } else {
        savedResult = await createMovie(payload);
      }

      // Automatically send poster and caption to Telegram if enabled
      if (sendToTelegram && savedResult?.movie) {
        try {
          await sendMovieToTelegram(savedResult.movie);
        } catch (tgErr) {
          console.warn('Telegram post error:', tgErr);
        }
      }

      navigate('/admin/movies');
    } catch (err) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 flex justify-center text-white">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/movies')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kinolar ro'yxatiga qaytish</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
          {isEditMode ? "Filmni Tahrirlash" : "Yangi Film Qo'shish"}
        </h1>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#10121a] border border-white/[0.08] shadow-2xl space-y-6">
        
        {/* Titles: EN, UZ, RU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Asosiy Nomi (Original/EN) *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Oppenheimer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Nomi (O'zbekcha)
            </label>
            <input
              type="text"
              name="title_uz"
              value={formData.title_uz}
              onChange={handleChange}
              placeholder="Oppengeymer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Nomi (Русский)
            </label>
            <input
              type="text"
              name="title_ru"
              value={formData.title_ru}
              onChange={handleChange}
              placeholder="Оппенгеймер"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Film Mazmuni / Tavsifi (O'zbekcha) *
            </label>
            <textarea
              rows={2}
              name="description_uz"
              value={formData.description_uz}
              onChange={handleChange}
              placeholder="Film voqealari haqida qisqacha ma'lumot..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tavsifi (Русский)
              </label>
              <textarea
                rows={2}
                name="description_ru"
                value={formData.description_ru}
                onChange={handleChange}
                placeholder="Описание на русском..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tavsifi (English)
              </label>
              <textarea
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Synopsis in English..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Images & Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          
          {/* Poster */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Poster URL (Vertikal rasm) *
            </label>
            <input
              type="url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handleChange}
              required
              placeholder="https://image.tmdb.org/t/p/w500/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
            {formData.poster_url && (
              <div className="w-20 h-28 rounded-xl overflow-hidden border border-white/20 bg-black mt-2">
                <img src={formData.poster_url} alt="Poster" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Backdrop */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Backdrop URL (Gorizontal fon rasmi)
            </label>
            <input
              type="url"
              name="backdrop_url"
              value={formData.backdrop_url}
              onChange={handleChange}
              placeholder="https://image.tmdb.org/t/p/original/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
            {formData.backdrop_url && (
              <div className="w-40 h-24 rounded-xl overflow-hidden border border-white/20 bg-black mt-2">
                <img src={formData.backdrop_url} alt="Backdrop" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

        </div>

        {/* Trailer & Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              YouTube Treyler Havolasi
            </label>
            <input
              type="text"
              name="trailer_url"
              value={formData.trailer_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Video Format Sifati
            </label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#161824] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="4K Ultra HD">4K Ultra HD</option>
              <option value="Full HD">Full HD (1080p)</option>
              <option value="HD">HD (720p)</option>
            </select>
          </div>
        </div>

        {/* Numbers: Year, Duration, Rating */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Yil</label>
            <input
              type="number"
              name="release_year"
              value={formData.release_year}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Daqiqa</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">IMDb Reyting</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
            />
          </div>
        </div>

        {/* Director & Cast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Rejissyor</label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              placeholder="Christopher Nolan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Rollarda (vergul bilan)</label>
            <input
              type="text"
              name="castInput"
              value={formData.castInput}
              onChange={handleChange}
              placeholder="Cillian Murphy, Robert Downey Jr."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
            />
          </div>
        </div>

        {/* Genres Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Janrlar (bosing):</label>
          <div className="flex flex-wrap gap-1.5">
            {genresList.filter(g => g !== 'All').map(g => {
              const active = formData.genres?.includes(g);
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-red-600 text-white'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
            />
            <span>Asosiy Bannerga chiqarish (Featured)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              name="is_trending"
              checked={formData.is_trending}
              onChange={handleChange}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 accent-red-600"
            />
            <span>Trendga chiqarish (Trending)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/20">
            <input
              type="checkbox"
              checked={sendToTelegram}
              onChange={(e) => setSendToTelegram(e.target.checked)}
              className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 accent-sky-500"
            />
            <span>✈️ Telegram kanal/botga rasmi bilan yuborish</span>
          </label>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300"
          >
            Bekor qilish
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-xl shadow-red-600/30 transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saqlanmoqda...' : 'Filmni Saqlash'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
