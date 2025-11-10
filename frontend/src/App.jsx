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
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const hash = currentHash.toLowerCase();
  
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
