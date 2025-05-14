import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (initialQuery !== query && initialQuery !== '') {
      setQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <form 
      className={`relative flex items-center transition-all duration-300 ${
        isFocused ? 'bg-black border border-netflix-red' : 'bg-[rgba(0,0,0,0.6)] border border-gray-700'
      } rounded-full overflow-hidden`}
      onSubmit={handleSubmit}
    >
      <button 
        type="submit" 
        className="flex-shrink-0 px-3 text-gray-400 hover:text-white"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      <input
        ref={inputRef}
        type="text"
        className="w-full bg-transparent text-sm text-white py-2 px-1 focus:outline-none placeholder-gray-400"
        placeholder="Titles, people, genres"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      
      {query && (
        <button 
          type="button" 
          className="flex-shrink-0 px-3 text-gray-400 hover:text-white"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchBar; 