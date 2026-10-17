import React, { useRef } from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { useLanguage } from '../context/LanguageContext';

export function TrendingSection({ movies, onSelectMovie, onWatchTrailer }) {
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  const trendingMovies = movies.filter(m => m.is_trending).slice(0, 10);
  const displayMovies = trendingMovies.length > 0 ? trendingMovies : movies.slice(0, 10);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-red-500 font-bold text-xs uppercase tracking-widest">
            <Flame className="w-4 h-4 fill-red-500" />
            <span>Top Charts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            {t.sections.trending}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.sections.trendingSub}
          </p>
        </div>

        {/* Scroll Nav Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 shadow-sm transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 shadow-sm transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="min-w-[200px] sm:min-w-[240px] md:min-w-[260px] snap-start flex-shrink-0"
          >
            <MovieCard
              movie={movie}
              rank={index + 1}
              onSelect={onSelectMovie}
              onWatchTrailer={onWatchTrailer}
            />
          </div>
        ))}
      </div>

    </section>
  );
}
