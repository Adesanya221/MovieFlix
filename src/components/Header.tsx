import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { isUserLoggedIn, logoutUser, getUserInfo } from '../utils/authUtils';

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Check the login state on component mount and when location changes
  useEffect(() => {
    const checkLoginState = () => {
      const loggedIn = isUserLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const userInfo = getUserInfo();
        if (userInfo && userInfo.email) {
          setUserEmail(userInfo.email);
        }
      }
    };
    
    checkLoginState();
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isOrderMenuOpen) setIsOrderMenuOpen(false);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleOrderMenu = () => {
    setIsOrderMenuOpen(!isOrderMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isOrderMenuOpen) setIsOrderMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setIsProfileMenuOpen(false);
    setUserEmail('');
    // If on a page that requires login, redirect to home
    if (location.pathname === '/favorites') {
      navigate('/');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const nigerianSnacks = [
    { name: 'Puff Puff', price: '₦500' },
    { name: 'Akara', price: '₦400' },
    { name: 'Garri', price: '₦300' },
    { name: 'Beans', price: '₦700' },
    { name: 'Jollof Rice', price: '₦1,200' },
    { name: 'Suya', price: '₦800' }
  ];

  return (
    <header className="bg-netflix-black/90 backdrop-blur fixed top-0 left-0 right-0 z-40 py-3 overflow-hidden">
      <div className="netflix-container flex flex-wrap items-center justify-between gap-y-2">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img 
            src="/logo.png" 
            alt="MovieFlix" 
            className="h-8 w-auto object-contain"
          />
        </Link>
        
        {/* Navigation - hidden on smallest screens */}
        <nav className="hidden sm:flex items-center space-x-4 flex-grow justify-center ml-4 text-sm md:text-base">
          <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
          <Link to="/movies" className="text-white hover:text-gray-300 transition-colors">Movies</Link>
          <Link to="/genres" className="text-white hover:text-gray-300 transition-colors">Genres</Link>
          <Link to="/favorites" className="text-white hover:text-gray-300 transition-colors">My List</Link>
        </nav>
        
        {/* Search box and user menu */}
        <div className="flex items-center space-x-3 flex-shrink-0 ml-auto">
          {/* Search form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(searchQuery);
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-netflix-dark/80 text-white px-3 py-1 rounded w-full md:w-auto text-sm"
            />
          </form>
          
          {/* User icon */}
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu button - only visible on small screens */}
        <button className="sm:hidden ml-2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 