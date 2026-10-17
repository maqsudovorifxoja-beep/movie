import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const ADMIN_EMAIL = 'movie@movie.uz';
const LOCAL_ADMIN_STORAGE_KEY = 'cineflow_admin_auth_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check user role from profiles table or email
  const verifyAdminRole = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      setProfile(null);
      return false;
    }

    // Direct check: if email matches designated admin email
    if (currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      return true;
    }

    // Secondary check: query profiles table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile(data);
        const adminStatus = data.role === 'admin';
        setIsAdmin(adminStatus);
        return adminStatus;
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }

    setIsAdmin(false);
    return false;
  };

  useEffect(() => {
    // 1. Initial session check
    const checkSession = async () => {
      try {
        // A. Check local admin session
        const savedAdmin = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
        if (savedAdmin) {
          try {
            const parsed = JSON.parse(savedAdmin);
            if (parsed && parsed.isLocalAdmin) {
              const localAdminUser = {
                id: 'local-admin-id',
                email: 'movie@movie.uz',
                role: 'admin',
                user_metadata: { full_name: 'Administrator' }
              };
              setUser(localAdminUser);
              setProfile({
                id: 'local-admin-id',
                email: 'movie@movie.uz',
                role: 'admin',
                full_name: 'Administrator'
              });
              setIsAdmin(true);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
          }
        }

        // B. Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await verifyAdminRole(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const savedAdmin = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
      if (savedAdmin) return; // preserve local admin session

      if (session?.user) {
        setUser(session.user);
        await verifyAdminRole(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Login handler: accepts admin/adminlegand or Supabase credentials
  const login = async (inputIdentifier, password) => {
    setLoading(true);
    const identifier = (inputIdentifier || '').trim().toLowerCase();
    const pwd = (password || '').trim();

    try {
      // 1. Check direct admin credentials: login = admin, password = adminlegand
      if (
        (identifier === 'admin' || identifier === 'movie@movie.uz' || identifier === 'admin@movie.uz') &&
        pwd === 'adminlegand'
      ) {
        const localAdminUser = {
          id: 'local-admin-id',
          email: 'movie@movie.uz',
          role: 'admin',
          user_metadata: { full_name: 'Administrator' }
        };
        const localAdminProfile = {
          id: 'local-admin-id',
          email: 'movie@movie.uz',
          role: 'admin',
          full_name: 'Administrator'
        };
        localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify({
          isLocalAdmin: true,
          email: 'movie@movie.uz',
          timestamp: Date.now()
        }));
        setUser(localAdminUser);
        setProfile(localAdminProfile);
        setIsAdmin(true);
        return { success: true, user: localAdminUser };
      }

      // 2. Direct check via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error("Login yoki parol noto'g'ri. Admin login: admin, parol: adminlegand");
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        const isUserAdmin = await verifyAdminRole(data.user);
        if (!isUserAdmin) {
          await supabase.auth.signOut();
          throw new Error("Kechirasiz, ushbu foydalanuvchiga admin huquqi berilmagan!");
        }
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, login, logout, adminEmail: ADMIN_EMAIL }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
