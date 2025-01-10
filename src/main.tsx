import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import App from './App';
import LandingPage from './pages/landing';
import AuthPage from './pages/auth';
import ProfilePage from './pages/profile';
import PersonasPage from './pages/personas';
import ImagesPage from './pages/images';
import { PageTransition } from './components/page-transition';
import './index.css';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="loading-dots flex space-x-2">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/landing" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/landing" 
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <PageTransition>
              <AuthPage />
            </PageTransition>
          } 
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/personas"
          element={
            <PrivateRoute>
              <PageTransition>
                <PersonasPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/images"
          element={
            <PrivateRoute>
              <PageTransition>
                <ImagesPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <PageTransition>
                <App />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </StrictMode>
);