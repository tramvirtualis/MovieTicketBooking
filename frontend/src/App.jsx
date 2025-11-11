import React, { useState, useEffect } from 'react';
import Home from './pages/Home.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import Schedule from './pages/Schedule.jsx';
import Cinemas from './pages/Cinemas.jsx';
import CinemaDetail from './pages/CinemaDetail.jsx';
import BookingHistory from './pages/BookingHistory.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLocationChange = () => {
      // Force re-render when location changes
      forceUpdate({});
    };

    // Listen for hash changes (for hash-based routing)
    window.addEventListener('hashchange', handleLocationChange);
    
    // Listen for browser back/forward navigation (for path-based routing)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Always read directly from window.location for the most up-to-date value
  // Normalize pathname: remove trailing slash and convert to lowercase
  const pathname = window.location.pathname.replace(/\/$/, '').toLowerCase();
  const hash = window.location.hash.toLowerCase();
  
  // Path-based routing - check admin routes first
  if (pathname === '/admin/admindashboard' || 
      pathname === '/admin/admin-dashboard' || 
      pathname === '/admin' ||
      pathname.startsWith('/admin/')) {
    return <AdminDashboard />;
  }
  if (pathname.startsWith('/movie/')) return <MovieDetail />;
  if (pathname === '/cinemas') return <Cinemas />;
  if (pathname.startsWith('/cinema/')) return <CinemaDetail />;
  if (pathname === '/schedule') return <Schedule />;
  if (pathname === '/signup' || pathname === '/register') return <SignUp />;
  if (pathname === '/signin' || pathname === '/login') return <SignIn />;
  if (pathname === '/forgot' || pathname === '/forgot-password') return <ForgotPassword />;
  if (pathname === '/booking-history') return <BookingHistory />;
  if (pathname === '/profile') return <Profile />;
  if (pathname === '/home' || pathname === '/') {
    // Check hash for nested routes on home
    if (hash.startsWith('#movie')) return <MovieDetail />;
    if (hash === '#cinemas') return <Cinemas />;
    if (hash.startsWith('#cinema')) return <CinemaDetail />;
    if (hash === '#schedule') return <Schedule />;
    if (hash === '#signup') return <SignUp />;
    if (hash === '#register') return <SignUp />;
    if (hash === '#signin') return <SignIn />;
    if (hash === '#forgot' || hash === '#forgot-password') return <ForgotPassword />;
    if (hash === '#booking-history') return <BookingHistory />;
    if (hash === '#profile') return <Profile />;
    if (hash === '#admin' || hash === '#admin-dashboard') return <AdminDashboard />;
    return <Home />;
  }
  
  // Hash-based routing (fallback for compatibility)
  if (hash.startsWith('#movie')) return <MovieDetail />;
  if (hash === '#cinemas') return <Cinemas />;
  if (hash.startsWith('#cinema')) return <CinemaDetail />;
  if (hash === '#schedule') return <Schedule />;
  if (hash === '#signup') return <SignUp />;
  if (hash === '#register') return <SignUp />;
  if (hash === '#signin') return <SignIn />;
  if (hash === '#forgot' || hash === '#forgot-password') return <ForgotPassword />;
  if (hash === '#booking-history') return <BookingHistory />;
  if (hash === '#profile') return <Profile />;
  if (hash === '#admin' || hash === '#admin-dashboard') return <AdminDashboard />;
  if (hash === '#home' || hash === '') return <Home />;
  
  return <Home />;
}
