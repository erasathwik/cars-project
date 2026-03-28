import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // For Admin login
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Check localStorage for admin
    const storedAdmin = localStorage.getItem('cars_admin');
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    const res = await axios.post('/api/login', { email, password });
    if (res.data.session) {
      await supabase.auth.setSession({
        access_token: res.data.session.access_token,
        refresh_token: res.data.session.refresh_token,
      });
      setUser(res.data.user);
      setProfile(res.data.profile);
    }
    return res.data;
  };

  const signupUser = async (userData) => {
    const res = await axios.post('/api/signup', userData);
    return res.data;
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
  };

  const loginAdmin = async (email, password) => {
    const res = await axios.post('/api/admin/login', { email, password });
    setAdmin(res.data.admin);
    localStorage.setItem('cars_admin', JSON.stringify(res.data.admin));
    return res.data;
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem('cars_admin');
  };

  const value = {
    user,
    profile,
    loading,
    admin,
    loginUser,
    signupUser,
    logoutUser,
    loginAdmin,
    logoutAdmin,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
