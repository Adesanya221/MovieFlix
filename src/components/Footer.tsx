import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // Social media links
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/oluwafisayomi-adesanya-09452922b/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
        </svg>
      )
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Adesanya221',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"></path>
        </svg>
      )
    },
    {
      name: 'Portfolio',
      url: 'https://my-potifolio-95cf0.web.app/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-netflix-dark py-10 border-t border-gray-800 mt-auto">
      <div className="netflix-container">
        {/* Movie-style credits section */}
        <div className="mb-8">
          <h2 className="text-gray-400 text-xl mb-4 font-medium">Credits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Directed by</h3>
              <p className="text-white">Oluwafisayomi Adesanya</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Developed by</h3>
              <p className="text-white">Adesanya Studios</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Frontend</h3>
              <p className="text-white">React + TypeScript</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Styling</h3>
              <p className="text-white">TailwindCSS</p>
            </div>
          </div>
        </div>
        
        {/* Movie title and social links */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-netflix-red text-2xl font-bold mb-2">MovieFlix</h1>
            <p className="text-gray-400 text-sm">A Netflix-inspired movie application</p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-netflix-red hover:text-white transition-colors"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        
        {/* Navigation links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-500 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/my-list" className="text-gray-500 hover:text-white transition-colors">My List</Link></li>
              <li><Link to="/categories" className="text-gray-500 hover:text-white transition-colors">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Genres</h3>
            <ul className="space-y-2">
              <li><Link to="/genre/28" className="text-gray-500 hover:text-white transition-colors">Action</Link></li>
              <li><Link to="/genre/12" className="text-gray-500 hover:text-white transition-colors">Adventure</Link></li>
              <li><Link to="/genre/16" className="text-gray-500 hover:text-white transition-colors">Animation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-500 hover:text-white transition-colors">Cookie Preferences</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-500">Lagos, Nigeria</li>
              <li><a href="mailto:contact@movieflix.com" className="text-gray-500 hover:text-white transition-colors">contact@movieflix.com</a></li>
            </ul>
          </div>
        </div>
        
        {/* "Post-credits scene" - Copyright */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} MovieFlix. Developed by <a href="https://github.com/Adesanya221" target="_blank" rel="noopener noreferrer" className="text-netflix-red hover:text-white transition-colors">Adesanya Oluwafisayomi</a>. All rights reserved.</p>
          <p className="mt-2 text-xs">This is a demo project and not affiliated with Netflix.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 