import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/overrides.css'
import App from './App.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import Schedule from './pages/Schedule.jsx'
import Cinemas from './pages/Cinemas.jsx'
import CinemaDetail from './pages/CinemaDetail.jsx'
import BookingHistory from './pages/BookingHistory.jsx'
import Profile from './pages/Profile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function Router() {
  const hash = window.location.hash.toLowerCase();
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
  return <App />;
}

const root = createRoot(document.getElementById('root'));

function render() {
  root.render(
    <StrictMode>
      <Router />
    </StrictMode>
  );
}

window.addEventListener('hashchange', render);
render()
