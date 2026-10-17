import { createClient } from '@supabase/supabase-js';
import { initialMovies } from '../data/initialMovies';

export const SUPABASE_URL = 'https://erfwnqbjvyjguflpfifa.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnducWJqdnlqZ3VmbHBmaWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjYxNDMsImV4cCI6MjEwNzY0MjE0M30.EDHT6o_UeRiNS2_PJLh9y1OwdsmLgnYSMZ6SDhcMsf4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

const LOCAL_MOVIES_KEY = 'cineflow_local_movies_v2';
const LOCAL_MESSAGES_KEY = 'cineflow_local_messages_v2';

// Helper to sanitize movie payload for Supabase database schema
function sanitizeMoviePayload(movieData) {
  // Extract cast members safely
  let castMembers = [];
  if (Array.isArray(movieData.cast_members) && movieData.cast_members.length > 0) {
    castMembers = movieData.cast_members;
  } else if (Array.isArray(movieData.cast) && movieData.cast.length > 0) {
    castMembers = movieData.cast;
  } else if (typeof movieData.castInput === 'string' && movieData.castInput.trim()) {
    castMembers = movieData.castInput.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Extract youtube trailer id safely
  let trailerId = movieData.trailer_id || '';
  if (!trailerId && movieData.trailer_url) {
    const match = movieData.trailer_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      trailerId = match[1];
    }
  }

  const payload = {
    title: movieData.title || '',
    title_uz: movieData.title_uz || movieData.title || '',
    title_ru: movieData.title_ru || movieData.title || '',
    description: movieData.description || '',
    description_uz: movieData.description_uz || movieData.description || '',
    description_ru: movieData.description_ru || movieData.description || '',
    poster_url: movieData.poster_url || '',
    backdrop_url: movieData.backdrop_url || movieData.poster_url || '',
    trailer_url: movieData.trailer_url || '',
    trailer_id: trailerId,
    video_url: movieData.video_url || null,
    release_year: parseInt(movieData.release_year, 10) || new Date().getFullYear(),
    duration: parseInt(movieData.duration, 10) || 120,
    rating: parseFloat(movieData.rating) || 7.5,
    quality: movieData.quality || '4K Ultra HD',
    genres: Array.isArray(movieData.genres) ? movieData.genres : ['Action'],
    director: movieData.director || '',
    cast_members: castMembers,
    is_featured: Boolean(movieData.is_featured),
    is_trending: Boolean(movieData.is_trending),
    views_count: parseInt(movieData.views_count, 10) || 0,
  };

  // Only attach ID if it's a valid 36-char UUID
  if (movieData.id && typeof movieData.id === 'string' && movieData.id.length === 36 && movieData.id.includes('-')) {
    payload.id = movieData.id;
  }

  return payload;
}

// Local storage helpers
export function getLocalMovies() {
  try {
    const cached = localStorage.getItem(LOCAL_MOVIES_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage error', e);
  }
  return initialMovies;
}

export function saveLocalMovies(movies) {
  try {
    localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(movies));
  } catch (e) {
    console.warn('LocalStorage save error', e);
  }
}

// Check if Supabase connection and tables are ready
export async function checkDatabaseStatus() {
  try {
    const { data, error } = await supabase.from('movies').select('id').limit(1);
    if (error) {
      return { isConnected: false, error: error.message };
    }
    return { isConnected: true, count: data?.length ?? 0 };
  } catch (err) {
    return { isConnected: false, error: err.message };
  }
}

// Fetch all movies (Supabase first, fallback gracefully)
export async function fetchMovies() {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Normalize cast / cast_members field for frontend convenience
      const normalized = data.map(m => ({
        ...m,
        cast: m.cast_members || m.cast || []
      }));
      saveLocalMovies(normalized);
      return { movies: normalized, source: 'supabase' };
    }
    if (error) {
      console.warn('Supabase fetch error:', error);
    }
  } catch (e) {
    console.warn('Failed to fetch from Supabase, using local fallback:', e);
  }

  const local = getLocalMovies();
  return { movies: local, source: 'local' };
}

// Add movie (writes to Supabase directly, with sanitized fields)
export async function createMovie(movieData) {
  const cleanPayload = sanitizeMoviePayload(movieData);

  const { data, error } = await supabase
    .from('movies')
    .insert([cleanPayload])
    .select();

  if (error) {
    console.error('Supabase movie insert error:', error);
    throw new Error(`Supabase xatolik berdi: ${error.message} (${error.code || 'RLS/Schema'})`);
  }

  if (data && data[0]) {
    const saved = {
      ...data[0],
      cast: data[0].cast_members || []
    };
    const current = getLocalMovies();
    saveLocalMovies([saved, ...current.filter(m => m.id !== saved.id)]);
    return { success: true, movie: saved, source: 'supabase' };
  }

  throw new Error("Kino qo'shilmadi, ma'lumot qaytmadi.");
}

// Update movie
export async function updateMovie(id, updates) {
  const cleanPayload = sanitizeMoviePayload(updates);
  delete cleanPayload.id; // do not overwrite primary key

  const { data, error } = await supabase
    .from('movies')
    .update(cleanPayload)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Supabase movie update error:', error);
    throw new Error(`Supabase yangilashda xatolik: ${error.message}`);
  }

  if (data && data[0]) {
    const updated = {
      ...data[0],
      cast: data[0].cast_members || []
    };
    const current = getLocalMovies();
    const list = current.map(m => String(m.id) === String(id) ? { ...m, ...updated } : m);
    saveLocalMovies(list);
    return { success: true, movie: updated, source: 'supabase' };
  }

  return { success: true, movie: { id, ...updates } };
}

// Delete movie
export async function deleteMovie(id) {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase movie delete error:', error);
    throw new Error(`Supabase o'chirishda xatolik: ${error.message}`);
  }

  const current = getLocalMovies();
  saveLocalMovies(current.filter(m => String(m.id) !== String(id)));
  return { success: true, source: 'supabase' };
}

// Increment movie views
export async function incrementViews(id) {
  try {
    await supabase.rpc('increment_movie_views', { movie_id: id });
  } catch {
    // soft ignore
  }

  const current = getLocalMovies();
  const updated = current.map(m => String(m.id) === String(id) ? { ...m, views_count: (m.views_count || 0) + 1 } : m);
  saveLocalMovies(updated);
}

// Contact form: Send message
export async function sendMessage(formData) {
  const messagePayload = {
    name: formData.name,
    email: formData.email,
    subject: formData.subject || 'Saytdan xabar',
    message: formData.message,
    status: 'unread',
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messagePayload])
      .select();

    if (!error && data) {
      return { success: true, data: data[0] };
    }
  } catch (e) {
    console.warn('Supabase message insert error:', e);
  }

  // Fallback to local storage messages
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
    const newMsg = { ...messagePayload, id: 'msg_' + Date.now() };
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify([newMsg, ...stored]));
    return { success: true, data: newMsg, source: 'local' };
  } catch {
    return { success: true };
  }
}

// Fetch messages for admin
export async function fetchMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Fetch messages error:', e);
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
  } catch {
    return [];
  }
}

// Delete message
export async function deleteMessage(id) {
  try {
    await supabase.from('messages').delete().eq('id', id);
  } catch (e) {
    console.warn('Delete message error:', e);
  }

  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]');
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(stored.filter(m => m.id !== id)));
  } catch (e) {
    console.warn('Local delete message error:', e);
  }
}
