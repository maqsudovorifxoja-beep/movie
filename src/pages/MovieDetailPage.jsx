import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Play, Film, Star, Clock, Calendar, User, Users, 
  Share2, Check, Volume2, Shield, Eye, Sparkles, Tv 
} from 'lucide-react';
import { fetchMovies, incrementViews } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { MovieCard } from '../components/MovieCard';

export function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, getMovieTitle, getMovieDesc } = useLanguage();

  const [movie, setMovie] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchMovies().then(res => {
      const list = res.movies || [];
      setAllMovies(list);
      const found = list.find(m => String(m.id) === String(id));
      setMovie(found || list[0]);
      if (found) {
        incrementViews(found.id);
      }
      setLoading(false);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#08090d] flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Film topilmadi</h2>
        <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs">
          Kinolar katalogiga qaytish
        </Link>
      </div>
    );
  }

  const title = getMovieTitle(movie);
  const description = getMovieDesc(movie);

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

  // Similar movies
  const similarMovies = allMovies
    .filter(m => String(m.id) !== String(movie.id) && m.genres?.some(g => movie.genres?.includes(g)))
    .slice(0, 5);

  return (
    <div className="min-h-screen pt-20 pb-20">
      
      {/* Top Breadcrumb & Back Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga qaytish</span>
        </button>
      </div>

      {/* Main Video Theater Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative w-full aspect-video rounded-3xl bg-black overflow-hidden border border-white/10 shadow-2xl">
          {isPlaying ? (
            <iframe
              src={getEmbedUrl()}
              title={`${title} Trailer Player`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full group">
              <img
                src={movie.backdrop_url || movie.poster_url}
                alt={title}
                className="w-full h-full object-cover filter brightness-[0.55]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/30 to-transparent" />

              {/* Centered Large Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 transform hover:scale-110 active:scale-95 transition-all group"
                >
                  <Play className="w-10 h-10 fill-white ml-1.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm sm:text-base font-bold text-white uppercase tracking-wider bg-black/60 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                    Rasmiy Treylerni Tomosha Qilish
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Details Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Poster Thumbnail & Quick Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[2/3] max-w-sm mx-auto lg:max-w-none bg-black">
              <img
                src={movie.poster_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Pleyerni ishga tushirish</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 transition-all"
                title="Havolani nusxalash"
              >
                {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Cast, Synopsis (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-white border border-white/15">
                  {movie.quality || "4K Ultra HD"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>IMDb {movie.rating}</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-slate-300">
                  {movie.release_year}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-slate-300">
                  {movie.duration} {t.movieDetail.minutes}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Outfit']">
                {title}
              </h1>

              {movie.title !== title && (
                <p className="text-sm text-slate-400 italic">
                  Asl nomi: <span className="text-slate-200">{movie.title}</span>
                </p>
              )}
            </div>

            {/* Genres Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {movie.genres?.map((genre, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="p-6 rounded-3xl bg-[#10121a]/80 backdrop-blur-xl border border-white/[0.08] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
                {t.movieDetail.synopsis}
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Director */}
              {movie.director && (
                <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08] flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-slate-400 border border-white/10">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-bold">{t.movieDetail.director}</div>
                    <div className="text-sm font-bold text-white">{movie.director}</div>
                  </div>
                </div>
              )}

              {/* Views */}
              <div className="p-5 rounded-2xl bg-[#10121a] border border-white/[0.08] flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-blue-400 border border-white/10">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Ko'rishlar soni</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {movie.views_count?.toLocaleString() || 1200} marta
                  </div>
                </div>
              </div>

            </div>

            {/* Cast Members */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#10121a] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Users className="w-4 h-4 text-red-500" />
                  <span>{t.movieDetail.cast}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-200"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Similar Recommendations Section */}
        {similarMovies.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/[0.08]">
            <h3 className="text-2xl font-black text-white font-['Outfit'] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <span>O'xshash Filmlar</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {similarMovies.map((sim) => (
                <MovieCard
                  key={sim.id}
                  movie={sim}
                  onSelect={(m) => navigate(`/movie/${m.id}`)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
