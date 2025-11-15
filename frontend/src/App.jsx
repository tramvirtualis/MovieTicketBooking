import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
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
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/cinemas" element={<Cinemas />} />
        <Route path="/cinema/:name" element={<CinemaDetail />} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/library" element={<Library />} />
        <Route path="/events" element={<Events />} />
        <Route path="/food-drinks" element={<FoodAndDrinks />} />
        <Route path="/food-and-drinks" element={<FoodAndDrinks />} />
        <Route path="/order-food" element={<FoodAndDrinks />} />
        <Route path="/food-drinks-with-ticket" element={<FoodAndDrinksWithTicket />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking" element={<BookTicket />} />
        <Route path="/book-ticket" element={<BookTicket />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/manager/*" element={<ManagerDashboard />} />
        <Route path="/managerdashboard" element={<ManagerDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      </Routes>
    </>
  );
}
