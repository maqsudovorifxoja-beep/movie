import React, { useState, useEffect } from 'react';
import { X, Film, Image, Star, Clock, Calendar, Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { genresList } from '../../data/initialMovies';
import { useLanguage } from '../../context/LanguageContext';

export function MovieFormModal({ isOpen, onClose, onSave, movieToEdit = null }) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: '',
    title_uz: '',
    title_ru: '',
    description: '',
    description_uz: '',
    description_ru: '',
    poster_url: '',
    backdrop_url: '',
    trailer_url: '',
    trailer_id: '',
    release_year: new Date().getFullYear(),
    duration: 120,
    rating: 8.0,
    quality: '4K Ultra HD',
    genres: ['Action', 'Sci-Fi'],
    director: '',
    cast: [],
    castInput: '',
    is_featured: false,
    is_trending: false,
    views_count: 1000
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        ...movieToEdit,
        title_uz: movieToEdit.title_uz || movieToEdit.title,
        title_ru: movieToEdit.title_ru || movieToEdit.title,
        description_uz: movieToEdit.description_uz || movieToEdit.description,
        description_ru: movieToEdit.description_ru || movieToEdit.description,
        cast: movieToEdit.cast || movieToEdit.cast_members || [],
        castInput: (movieToEdit.cast || movieToEdit.cast_members || []).join(', '),
      });
    } else {
      setFormData({
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
        genres: ['Action', 'Drama'],
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt'],
        castInput: 'Cillian Murphy, Emily Blunt',
        is_featured: false,
        is_trending: true,
        views_count: 5000
      });
    }
  }, [movieToEdit, isOpen]);

  if (!isOpen) return null;

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
      setError("Kino nomi va poster manzili kiritilishi shart!");
      return;
    }

    setLoading(true);
    setError(null);

    // Extract youtube trailer id if possible
    let extractedId = formData.trailer_id;
    if (formData.trailer_url) {
      const match = formData.trailer_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        extractedId = match[1];
      }
    }

    const castList = formData.castInput
      ? formData.castInput.split(',').map(s => s.trim()).filter(Boolean)
      : formData.cast;

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
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {movieToEdit ? "Kinoni Tahrirlash" : "Yangi Kino Qo'shish"}
            </h3>
            <p className="text-xs text-slate-400">
              Supabase bazasiga saqlanadi va real vaqtda landing pageda aks etadi
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Titles: EN, UZ, RU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Asosiy Nomi (Original/EN) *</label>
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nomi (O'zbekcha)</label>
              <input
                type="text"
                name="title_uz"
                value={formData.title_uz}
                onChange={handleChange}
                placeholder="Oppengeymer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nomi (Русский)</label>
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

          {/* Descriptions: UZ, RU, EN */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Film Tavsifi (O'zbekcha) *</label>
              <textarea
                rows={2}
                name="description_uz"
                value={formData.description_uz}
                onChange={handleChange}
                placeholder="Film mazmuni o'zbek tilida..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tavsifi (Русский)</label>
                <textarea
                  rows={2}
                  name="description_ru"
                  value={formData.description_ru}
                  onChange={handleChange}
                  placeholder="Описание фильма на русском..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tavsifi (English)</label>
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

          {/* Poster & Backdrop URLs with live preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Poster URL (Rasm) *</label>
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
                <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/20 bg-black">
                  <img src={formData.poster_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Backdrop URL (Fon Rasmi)</label>
              <input
                type="url"
                name="backdrop_url"
                value={formData.backdrop_url}
                onChange={handleChange}
                placeholder="https://image.tmdb.org/t/p/original/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
              {formData.backdrop_url && (
                <div className="w-32 h-16 rounded-lg overflow-hidden border border-white/20 bg-black">
                  <img src={formData.backdrop_url} alt="Backdrop Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Trailer URL & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">YouTube Treyler URL</label>
              <input
                type="text"
                name="trailer_url"
                value={formData.trailer_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Video Sifati</label>
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

          {/* Release Year, Duration, Rating */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Yil</label>
              <input
                type="number"
                name="release_year"
                value={formData.release_year}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Daqiqa (Duration)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reyting (0 - 10)</label>
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
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rejissyor</label>
              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleChange}
                placeholder="Christopher Nolan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Aktyorlar (vergul bilan)</label>
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

          {/* Genres Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Janrlar (tanlang):</label>
            <div className="flex flex-wrap gap-1.5">
              {genresList.filter(g => g !== 'All').map(g => {
                const active = formData.genres?.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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

          {/* Checkboxes: Featured & Trending */}
          <div className="flex items-center gap-6 pt-2">
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300"
            >
              {t.admin.cancel}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/30"
            >
              {loading ? 'Saqlanmoqda...' : t.admin.save}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
