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
