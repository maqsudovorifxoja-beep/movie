import React, { useState } from 'react';
import { Play, Film, Star, Clock, Info, Volume2, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function HeroBanner({ movie, onSelectMovie, onWatchTrailer }) {
  const { t, getMovieTitle, getMovieDesc } = useLanguage();

  if (!movie) return null;

  const title = getMovieTitle(movie);
  const description = getMovieDesc(movie);

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 transition-colors">
      
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-[0.9] dark:brightness-[0.6] scale-105 transition-transform duration-1000 ease-out"
        />
        
        {/* Cinematic Gradient Overlays: Light and Dark responsive */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/75 to-transparent dark:from-[#08090d] dark:via-[#08090d]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/85 to-transparent dark:from-[#08090d] dark:via-[#08090d]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,250,252,0.85)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#08090d_100%)] opacity-80" />
      </div>

      {/* Decorative Glow Orb */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="max-w-2xl space-y-6">
          
          {/* Badges Ribbon */}
          <div className="flex flex-wrap items-center gap-2.5 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/40">
              <Sparkles className="w-3.5 h-3.5" />
              {t.hero.premiereBadge}
            </span>

            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-white/80 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/15 backdrop-blur-md shadow-sm">
              {movie.quality || "4K Ultra HD"}
            </span>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 dark:border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{movie.rating}</span>
            </div>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {movie.duration} {t.movieDetail.minutes}
            </span>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {movie.release_year}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] drop-shadow-sm dark:drop-shadow-2xl font-['Outfit'] animate-fade-in-up animation-delay-100">
            {title}
          </h1>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-2 pt-1 animate-fade-in-up animation-delay-200">
            {movie.genres?.map((genre, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.08] px-3 py-1 rounded-full border border-slate-300 dark:border-white/10 shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base line-clamp-3 max-w-xl leading-relaxed font-medium animate-fade-in-up animation-delay-300">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4 animate-fade-in-up animation-delay-400">
            
            {/* Play Button with pulse ring */}
            <button
              onClick={() => onSelectMovie(movie)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all duration-300 hover:scale-105 active:scale-95 animate-play-pulse"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <span>{t.hero.watchNow}</span>
            </button>

            {/* Trailer Button */}
            <button
              onClick={() => onWatchTrailer(movie)}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/90 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.15] text-slate-900 dark:text-white font-semibold text-sm sm:text-base border border-slate-300 dark:border-white/15 backdrop-blur-xl shadow-md dark:shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Film className="w-5 h-5 text-red-500" />
              <span>{t.hero.watchTrailer}</span>
            </button>

            {/* Details Button */}
            <button
              onClick={() => onSelectMovie(movie)}
              className="p-4 rounded-2xl bg-white/90 dark:bg-white/[0.05] hover:bg-white dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 shadow-md dark:shadow-none transition-all hover:scale-105 active:scale-95"
              title={t.hero.moreInfo}
            >
              <Info className="w-5 h-5" />
            </button>

          </div>

          {/* Star Cast Quick Row */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-500">{t.movieDetail.cast}:</span>
              <span className="text-slate-800 dark:text-slate-300 truncate max-w-md font-medium">
                {movie.cast.slice(0, 3).join(', ')}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Fade Gradient for Smooth Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#08090d] pointer-events-none" />
    </section>
  );
}
