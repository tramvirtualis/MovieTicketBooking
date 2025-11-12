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
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import Events from './pages/Events.jsx';
import Library from './pages/Library.jsx';
import FoodAndDrinks from './pages/FoodAndDrinks.jsx';
import FoodAndDrinksWithTicket from './pages/FoodAndDrinksWithTicket.jsx';
import Checkout from './pages/Checkout.jsx';
import BookTicket from './pages/BookTicket.jsx';

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
  // Handle both lowercase and mixed case URLs
  const normalizedPath = pathname.toLowerCase();
  if (normalizedPath === '/admin/admindashboard' || 
      normalizedPath === '/admin/admin-dashboard' || 
      normalizedPath === '/admin' ||
      normalizedPath === '/admindashboard' ||
      normalizedPath === '/admin-dashboard' ||
      normalizedPath.startsWith('/admin/') ||
      pathname === '/AdminDashboard' || // Handle exact case
      pathname === '/Admin-Dashboard') {
    return <AdminDashboard />;
  }
  if (pathname === '/manager' ||
      pathname.startsWith('/manager/') ||
      pathname === '/managerdashboard' ||
      pathname === '/manager-dashboard') {
    return <ManagerDashboard />;
  }
  if (pathname.startsWith('/movie/')) return <MovieDetail />;
  if (pathname === '/cinemas') return <Cinemas />;
  if (pathname === '/events') return <Events />;
  if (pathname === '/food-drinks' || pathname === '/food-and-drinks') return <FoodAndDrinks />;
  if (pathname === '/order-food' || pathname === '/food-drinks-with-ticket') return <FoodAndDrinksWithTicket />;
  if (pathname === '/checkout') return <Checkout />;
  if (pathname === '/booking' || pathname === '/book-ticket') return <BookTicket />;
  if (pathname.startsWith('/cinema/')) return <CinemaDetail />;
  if (pathname === '/schedule') return <Schedule />;
  if (pathname === '/signup' || pathname === '/register') return <SignUp />;
  if (pathname === '/signin' || pathname === '/login') return <SignIn />;
  if (pathname === '/forgot' || pathname === '/forgot-password') return <ForgotPassword />;
  if (pathname === '/booking-history') return <BookingHistory />;
  if (pathname === '/orders') return <Orders />;
  if (pathname === '/profile') return <Profile />;
  if (pathname === '/library') return <Library />;
  if (pathname === '/home' || pathname === '/') {
    // Check hash for nested routes on home
    if (hash.startsWith('#movie')) return <MovieDetail />;
    if (hash === '#cinemas') return <Cinemas />;
    if (hash === '#food-drinks' || hash === '#food-and-drinks') return <FoodAndDrinks />;
    if (hash === '#order-food' || hash === '#food-drinks-with-ticket') return <FoodAndDrinksWithTicket />;
    if (hash === '#checkout') return <Checkout />;
    if (hash.startsWith('#booking') || hash.startsWith('#book-ticket')) return <BookTicket />;
    if (hash.startsWith('#cinema')) return <CinemaDetail />;
    if (hash === '#schedule') return <Schedule />;
    if (hash === '#signup') return <SignUp />;
    if (hash === '#register') return <SignUp />;
    if (hash === '#signin') return <SignIn />;
    if (hash === '#forgot' || hash === '#forgot-password') return <ForgotPassword />;
    if (hash === '#booking-history') return <BookingHistory />;
    if (hash === '#orders') return <Orders />;
    if (hash === '#profile') return <Profile />;
    if (hash === '#library') return <Library />;
    if (hash === '#admin' || hash === '#admin-dashboard') return <AdminDashboard />;
    return <Home />;
  }
  
  // Hash-based routing (fallback for compatibility)
  if (hash.startsWith('#movie')) return <MovieDetail />;
  if (hash === '#cinemas') return <Cinemas />;
  if (hash === '#events') return <Events />;
  if (hash === '#food-drinks' || hash === '#food-and-drinks') return <FoodAndDrinks />;
  if (hash === '#order-food' || hash === '#food-drinks-with-ticket') return <FoodAndDrinksWithTicket />;
  if (hash === '#checkout') return <Checkout />;
  if (hash.startsWith('#booking') || hash.startsWith('#book-ticket')) return <BookTicket />;
  if (hash.startsWith('#cinema')) return <CinemaDetail />;
  if (hash === '#schedule') return <Schedule />;
  if (hash === '#signup') return <SignUp />;
  if (hash === '#register') return <SignUp />;
  if (hash === '#signin') return <SignIn />;
  if (hash === '#forgot' || hash === '#forgot-password') return <ForgotPassword />;
  if (hash === '#booking-history') return <BookingHistory />;
  if (hash === '#orders') return <Orders />;
  if (hash === '#profile') return <Profile />;
  if (hash === '#library') return <Library />;
  if (hash === '#admin' || hash === '#admin-dashboard') return <AdminDashboard />;
  if (hash === '#manager' || hash === '#manager-dashboard') return <ManagerDashboard />;
  if (hash === '#home' || hash === '') return <Home />;
  
  return <Home />;
}
