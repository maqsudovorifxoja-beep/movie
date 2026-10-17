import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/HeroBanner';
import { TrendingSection } from '../components/TrendingSection';
import { MovieGrid } from '../components/MovieGrid';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { MovieDetailModal } from '../components/MovieDetailModal';
import { fetchMovies } from '../lib/supabase';

export function HomePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMovie, setModalMovie] = useState(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  useEffect(() => {
    fetchMovies().then(res => {
      setMovies(res.movies || []);
      setLoading(false);
    });
  }, []);

  const featuredMovie = movies.find(m => m.is_featured) || movies[0];

  const handleSelectMovie = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  const handleWatchTrailer = (movie) => {
    setModalMovie(movie);
    setIsTrailerModalOpen(true);
  };

  return (
    <div>
      {/* Hero Banner */}
      {featuredMovie && (
        <HeroBanner
          movie={featuredMovie}
          onSelectMovie={handleSelectMovie}
          onWatchTrailer={handleWatchTrailer}
        />
      )}

      {/* Trending Section */}
      {movies.length > 0 && (
        <TrendingSection
          movies={movies}
          onSelectMovie={handleSelectMovie}
          onWatchTrailer={handleWatchTrailer}
        />
      )}

      {/* Catalog Preview */}
      <MovieGrid
        movies={movies}
        onSelectMovie={handleSelectMovie}
        onWatchTrailer={handleWatchTrailer}
      />

      {/* About Section */}
      <AboutSection />

      {/* Contact Section */}
      <ContactSection />

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
