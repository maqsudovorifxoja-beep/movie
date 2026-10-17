import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, Film, Clock, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function MovieCard({ movie, onSelect, onWatchTrailer, rank }) {
  const { getMovieTitle, t } = useLanguage();
  const navigate = useNavigate();
  const title = getMovieTitle(movie);

  const handleClick = () => {
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  return (
    <div 
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#10121a] border border-slate-200 dark:border-white/[0.08] hover:border-red-500/50 transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-red-600/25 hover:-translate-y-2 cursor-pointer shadow-sm dark:shadow-none"
      onClick={handleClick}
    >
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-200 dark:bg-[#161823]">
        <img
          src={movie.poster_url}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
          }}
        />

        {/* Dark Vignette Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-[#08090d] via-black/20 dark:via-[#08090d]/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Subtle Shimmer Light Beam Sweep on Hover */}
        <div className="shine-sweep" />

        {/* Rank Number Badge (for Trending section) */}
        {rank !== undefined && (
          <div className="absolute -left-1 -bottom-2 z-20 pointer-events-none select-none">
            <span className="text-7xl sm:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-white via-slate-200 to-transparent/30 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] font-['Outfit'] group-hover:scale-105 inline-block transition-transform duration-300">
              {rank}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Quality Badge */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
            {movie.quality?.includes('4K') ? '4K UHD' : 'Full HD'}
          </span>

          {/* Rating Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/90 text-black backdrop-blur-md shadow-md">
            <Star className="w-3 h-3 fill-black text-black" />
            <span>{movie.rating}</span>
          </div>
        </div>

        {/* Centered Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-13 h-13 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 transform group-hover:scale-100 scale-75 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Quick Trailer Trigger */}
        {onWatchTrailer && (
          <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchTrailer(movie);
              }}
              className="p-2 rounded-xl bg-white/20 hover:bg-red-600 text-white backdrop-blur-lg border border-white/20 transition-all"
              title={t.hero.watchTrailer}
            >
              <Film className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Card Info Box */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between bg-white dark:bg-gradient-to-b dark:from-[#10121a] dark:to-[#0c0d13]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-500 transition-colors line-clamp-1 font-['Outfit']">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{movie.release_year}</span>
            <span>•</span>
            <span>{movie.duration} min</span>
            {movie.views_count ? (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400">
                  <Eye className="w-3 h-3" />
                  {(movie.views_count > 1000 ? (movie.views_count / 1000).toFixed(0) + 'k' : movie.views_count)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Primary Genre Tag */}
        <div className="flex items-center gap-1 overflow-hidden pt-1">
          {movie.genres?.slice(0, 2).map((g, i) => (
            <span
              key={i}
              className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/[0.06]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
