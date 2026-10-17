import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MovieGrid } from '../components/MovieGrid';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { fetchMovies } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { Film } from 'lucide-react';

export function MoviesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMovie, setModalMovie] = useState(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  const initialSearch = searchParams.get('q') || '';

  useEffect(() => {
    fetchMovies().then(res => {
      setMovies(res.movies || []);
      setLoading(false);
    });
  }, []);

  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchTrailer = (movie) => {
    setModalMovie(movie);
    setIsTrailerModalOpen(true);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#10121a] to-[#10121a] border border-white/[0.08] relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">
              <Film className="w-3.5 h-3.5" />
              <span>Kinolar Olami</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit']">
              {t.sections.allMovies}
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              {t.sections.allMoviesSub}
            </p>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Movie Catalog Grid */}
      <MovieGrid
        movies={movies}
        onSelectMovie={handleSelectMovie}
        onWatchTrailer={handleWatchTrailer}
        initialSearch={initialSearch}
      />

      {/* Quick Trailer Modal */}
      <MovieDetailModal
        movie={modalMovie}
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        initialPlayTrailer={true}
      />

    </div>
  );
}
