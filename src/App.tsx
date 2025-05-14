import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import GenrePage from './pages/GenrePage';
import GenresPage from './pages/GenresPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const HeaderWithNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };
  
  // Don't show header on login and signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }
  
  return <Header onSearch={handleSearch} />;
};

const FooterWithConditionalRendering: React.FC = () => {
  const location = useLocation();
  
  // Don't show footer on login and signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }
  
  return <Footer />;
};

function App() {
  return (
    <Router>
      <div className="app min-h-screen flex flex-col bg-netflix-black">
        <HeaderWithNavigation />
        <div className="content flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/genre/:id" element={<GenrePage />} />
            <Route path="/genres" element={<GenresPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <FooterWithConditionalRendering />
      </div>
    </Router>
  );
}

export default App;
