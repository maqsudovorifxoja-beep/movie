import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Client Layout & Pages
import { ClientLayout } from './components/layout/ClientLayout';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Protected Layout & Pages
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMoviesPage } from './pages/admin/AdminMoviesPage';
import { AdminMovieFormPage } from './pages/admin/AdminMovieFormPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminSqlPage } from './pages/admin/AdminSqlPage';
import { AdminTelegramPage } from './pages/admin/AdminTelegramPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            
            {/* Public Client Routes */}
            <Route element={<ClientLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Standalone Admin Login Page */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Console Routes with Sidebar & Header */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="movies" element={<AdminMoviesPage />} />
                <Route path="movies/new" element={<AdminMovieFormPage />} />
                <Route path="movies/edit/:id" element={<AdminMovieFormPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="telegram" element={<AdminTelegramPage />} />
                <Route path="sql" element={<AdminSqlPage />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
}
