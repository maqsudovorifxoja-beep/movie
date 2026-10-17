import React, { useState, useEffect } from 'react';
import { X, Play, Film, Star, Clock, Calendar, User, Users, Volume2, Share2, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { incrementViews } from '../lib/supabase';

export function MovieDetailModal({ movie, isOpen, onClose, initialPlayTrailer = false }) {
  const { t, getMovieTitle, getMovieDesc } = useLanguage();
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(initialPlayTrailer);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsPlayingTrailer(initialPlayTrailer);
  }, [initialPlayTrailer, movie]);

  useEffect(() => {
    if (isOpen && movie) {
      incrementViews(movie.id);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const title = getMovieTitle(movie);
  const description = getMovieDesc(movie);

  // Extract youtube trailer id from trailer_url or trailer_id
  const getEmbedUrl = () => {
    if (movie.trailer_id) {
      return `https://www.youtube-nocookie.com/embed/${movie.trailer_id}?autoplay=1&rel=0`;
    }
    if (movie.trailer_url) {
      const match = movie.trailer_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
      }
    }
    return 'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1&rel=0';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      {/* Backdrop Glass Overlay */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0f111a] border border-white/10 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 backdrop-blur-md transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Header (Trailer or Backdrop) */}
        <div className="relative w-full aspect-video max-h-[420px] bg-black overflow-hidden flex-shrink-0">
          {isPlayingTrailer ? (
            <iframe
              src={getEmbedUrl()}
              title={`${title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full group">
              <img
                src={movie.backdrop_url || movie.poster_url}
                alt={title}
                className="w-full h-full object-cover filter brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/40 to-transparent" />
              
              {/* Play Trailer CTA Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 transform hover:scale-110 active:scale-95 transition-all group"
                >
                  <Play className="w-7 h-7 fill-white ml-1" />
                </button>
                <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                  {t.hero.watchTrailer}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Details Content Container (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Title & Quick Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit']">
                {title}
              </h2>
              {movie.title !== title && (
                <p className="text-xs text-slate-400 italic">Original: {movie.title}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsPlayingTrailer(!isPlayingTrailer)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isPlayingTrailer
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>{isPlayingTrailer ? 'Pleyerni yopish' : t.hero.watchTrailer}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
                title="Ulashish"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{movie.rating} / 10</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold px-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{movie.release_year}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold px-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{movie.duration} {t.movieDetail.minutes}</span>
            </div>

            <div className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 ml-auto">
              {movie.quality || "4K Ultra HD"}
            </div>
          </div>

          {/* Genres Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">{t.movieDetail.genres}:</span>
            {movie.genres?.map((g, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-red-600/10 text-red-400 border border-red-500/20"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-['Outfit']">
              {t.movieDetail.synopsis}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Director & Cast Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.06]">
            {movie.director && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-400 border border-white/10">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">{t.movieDetail.director}</div>
                  <div className="text-sm font-bold text-white">{movie.director}</div>
                </div>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-400 border border-white/10 flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">{t.movieDetail.cast}</div>
                  <div className="text-sm font-semibold text-slate-200">{movie.cast.join(', ')}</div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
