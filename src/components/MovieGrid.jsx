import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Star, Calendar, X, Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { genresList } from '../data/initialMovies';
import { useLanguage } from '../context/LanguageContext';

export function MovieGrid({ movies, onSelectMovie, onWatchTrailer, initialSearch = '' }) {
  const { t, getMovieTitle, getMovieDesc } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedSort, setSelectedSort] = useState('newest'); // 'newest', 'rating', 'views', 'title'
  const [selectedQuality, setSelectedQuality] = useState('all');

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleEn = (movie.title || '').toLowerCase();
        const titleUz = (movie.title_uz || '').toLowerCase();
        const titleRu = (movie.title_ru || '').toLowerCase();
        const director = (movie.director || '').toLowerCase();
        const cast = (movie.cast || []).join(' ').toLowerCase();

        const match = titleEn.includes(query) ||
                      titleUz.includes(query) ||
                      titleRu.includes(query) ||
                      director.includes(query) ||
                      cast.includes(query);
        if (!match) return false;
      }

      // 2. Genre Filter
      if (selectedGenre !== 'All') {
        const hasGenre = movie.genres?.some(
          g => g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      // 3. Quality Filter
      if (selectedQuality !== 'all') {
        if (selectedQuality === '4k' && !movie.quality?.includes('4K')) return false;
        if (selectedQuality === 'hd' && movie.quality?.includes('4K')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (selectedSort === 'views') {
        return (b.views_count || 0) - (a.views_count || 0);
      }
      if (selectedSort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // default: newest
      return (b.release_year || 0) - (a.release_year || 0);
    });
  }, [movies, searchQuery, selectedGenre, selectedSort, selectedQuality]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedSort('newest');
    setSelectedQuality('all');
  };

  return (
    <section id="movies-catalog" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
          {t.sections.allMovies}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t.sections.allMoviesSub}
        </p>
      </div>

      {/* Control Panel: Search + Filters */}
      <div className="bg-white/95 dark:bg-[#10121a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] p-4 sm:p-5 rounded-2xl mb-8 space-y-4 shadow-sm dark:shadow-xl transition-colors">
        
        {/* Top Controls: Search Input + Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.filters.search}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400 hidden lg:inline font-medium">{t.filters.sort}:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#161824] border border-slate-300 dark:border-white/[0.1] text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="newest">{t.filters.sortNewest}</option>
              <option value="rating">{t.filters.sortRating}</option>
              <option value="views">{t.filters.sortViews}</option>
              <option value="title">{t.filters.sortTitle}</option>
            </select>
          </div>

          {/* Quality Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <button
              onClick={() => setSelectedQuality('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedQuality === 'all'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.filters.all}
            </button>
            <button
              onClick={() => setSelectedQuality('4k')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedQuality === '4k'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              4K UHD
            </button>
            <button
              onClick={() => setSelectedQuality('hd')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedQuality === 'hd'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full HD
            </button>
          </div>

        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {genresList.map((genre) => {
            const isSelected = selectedGenre.toLowerCase() === genre.toLowerCase();
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/[0.07] hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {genre === 'All' ? t.filters.all : genre}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Active Filter Indicators */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-white/[0.05]">
          <span>
            <strong className="text-slate-900 dark:text-white font-bold">{filteredMovies.length}</strong> {t.filters.resultsFound}
          </span>

          {(searchQuery || selectedGenre !== 'All' || selectedQuality !== 'all' || selectedSort !== 'newest') && (
            <button
              onClick={clearFilters}
              className="text-red-400 hover:text-red-300 font-semibold underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Tozalash
            </button>
          )}
        </div>

      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={onSelectMovie}
              onWatchTrailer={onWatchTrailer}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-[#10121a]/60 border border-white/[0.06]">
          <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">
            {t.filters.noMovies}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Boshqa janr yoki kalit so'zlarni kiritib ko'ring yoki barcha filtrlarni qayta sozlang.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30"
          >
            Barcha Filtrlarni Bekor Qilish
          </button>
        </div>
      )}

    </section>
  );
}
