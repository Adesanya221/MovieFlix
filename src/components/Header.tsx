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
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-netflix-black shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-netflix-red text-3xl font-bold">MovieFlix</h1>
            </Link>
            
            <nav className="hidden md:flex">
              <ul className="flex space-x-6">
                <li>
                  <Link 
                    to="/" 
                    className={`hover:text-white transition ${
                      location.pathname === '/' ? 'text-white font-medium' : 'text-gray-300'
                    }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/favorites" 
                    className={`hover:text-white transition ${
                      location.pathname === '/favorites' ? 'text-white font-medium' : 'text-gray-300'
                    }`}
                  >
                    My List
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/genres" 
                    className={`hover:text-white transition ${
                      location.pathname.includes('/genre') ? 'text-white font-medium' : 'text-gray-300'
                    }`}
                  >
                    Categories
                  </Link>
                </li>
                <li className="relative">
                  <button
                    onClick={toggleOrderMenu}
                    className={`
                      px-4 py-1 rounded-full flex items-center gap-1.5
                      transition-all duration-300 border
                      ${isOrderMenuOpen 
                        ? 'bg-netflix-red text-white border-netflix-red' 
                        : 'text-gray-300 border-gray-700 hover:bg-netflix-dark hover:text-white hover:border-gray-500'
                      }
                    `}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                      />
                    </svg>
                    Order
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform duration-300 ${isOrderMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isOrderMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-netflix-black border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                      <div className="p-4 border-b border-gray-700 bg-netflix-dark">
                        <h3 className="text-white font-medium flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2 text-netflix-red" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          Nigerian Snacks
                        </h3>
                      </div>
                      <ul className="py-2">
                        {nigerianSnacks.map((snack, index) => (
                          <li key={index} className="px-4 py-2.5 hover:bg-netflix-dark transition-colors duration-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">{snack.name}</span>
                              <span className="text-netflix-red font-medium">{snack.price}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="p-4 border-t border-gray-700 bg-netflix-dark bg-opacity-50">
                        <button className="w-full bg-netflix-red text-white py-2.5 rounded-full hover:bg-red-700 transition-colors duration-300 flex items-center justify-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                            />
                          </svg>
                          Order Now
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block w-64">
              <SearchBar onSearch={onSearch} />
            </div>
            
            <div className="block sm:hidden">
              <button 
                onClick={() => document.getElementById('mobile-search')?.classList.toggle('hidden')}
                className="p-2 text-gray-300 hover:text-white"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-300 hover:text-white"
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <div className="relative">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-label="Profile Menu"
                  >
                    <span className="hidden md:inline text-sm text-gray-300">Profile</span>
                    <div className="w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{userEmail.charAt(0).toUpperCase()}</span>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 text-gray-300 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-netflix-black border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                      <div className="p-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-netflix-red flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{userEmail.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Profile</h3>
                            <p className="text-xs text-gray-400">{userEmail}</p>
                          </div>
                        </div>
                      </div>
                      <ul className="py-2">
                        <li>
                          <Link to="/favorites" className="block px-4 py-2 text-gray-300 hover:bg-netflix-dark hover:text-white transition-colors">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              My List
                            </div>
                          </Link>
                        </li>
                        <li>
                          <Link to="/account" className="block px-4 py-2 text-gray-300 hover:bg-netflix-dark hover:text-white transition-colors">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Account Settings
                            </div>
                          </Link>
                        </li>
                      </ul>
                      <div className="border-t border-gray-700 p-3">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center text-left px-4 py-2 text-gray-300 hover:bg-netflix-dark hover:text-white rounded-md transition-colors"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-1.5 bg-netflix-red text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div id="mobile-search" className="sm:hidden pb-4 hidden">
          <SearchBar onSearch={onSearch} />
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-netflix-black">
            <nav className="flex flex-col">
              <Link 
                to="/" 
                className={`py-2 px-4 ${location.pathname === '/' ? 'text-white font-medium' : 'text-gray-300'}`}
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/favorites" 
                className={`py-2 px-4 ${location.pathname === '/favorites' ? 'text-white font-medium' : 'text-gray-300'}`}
                onClick={toggleMobileMenu}
              >
                My List
              </Link>
              <Link 
                to="/genres" 
                className={`py-2 px-4 ${location.pathname.includes('/genre') ? 'text-white font-medium' : 'text-gray-300'}`}
                onClick={toggleMobileMenu}
              >
                Categories
              </Link>
              
              {!isLoggedIn && (
                <Link 
                  to="/login" 
                  className="py-2 px-4 text-white font-medium"
                  onClick={toggleMobileMenu}
                >
                  Sign In
                </Link>
              )}
              
              {isLoggedIn && (
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="py-2 px-4 text-gray-300 text-left"
                >
                  Log Out
                </button>
              )}
              
              {/* Order section in mobile menu */}
              <div className="py-4 px-4 border-t border-gray-700 mt-2">
                <h3 className="text-white font-medium py-2 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2 text-netflix-red" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Nigerian Snacks
                </h3>
                {nigerianSnacks.map((snack, index) => (
                  <div key={index} className="flex justify-between py-1.5 border-b border-gray-800 last:border-b-0">
                    <span className="text-gray-300">{snack.name}</span>
                    <span className="text-netflix-red">{snack.price}</span>
                  </div>
                ))}
                <button className="mt-4 w-full bg-netflix-red text-white py-2.5 rounded-full hover:bg-red-700 transition-colors duration-300 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                    />
                  </svg>
                  Order Now
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 