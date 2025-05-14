import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import GenreList from '../components/GenreList';
import useMovies from '../hooks/useMovies';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  
  const {
    movies,
    loading,
    error,
    totalPages,
    currentPage,
    setPage,
    setSearchQuery
  } = useMovies();
  
  React.useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
  }, [query, setSearchQuery]);
  
  return (
    <div className="pt-24 pb-20">
      <div className="netflix-container">
        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <GenreList />
            </div>
          </aside>
          
          {/* Main Content */}
          <main>
            <h1 className="text-3xl font-bold text-white mb-6">
              {query 
                ? `Search results for "${query}"`
                : 'Search Results'
              }
            </h1>
            
            {error && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-8">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <MovieGrid 
              movies={movies} 
              loading={loading}
            />
            
            {!loading && movies.length === 0 && (
              <div className="py-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl text-white mb-3">No results found</h3>
                  <p className="text-gray-400 mb-6">
                    We couldn't find any matches for "{query}". Try different keywords or browse by genre.
                  </p>
                  <div className="inline-flex space-x-4">
                    <Link 
                      to="/" 
                      className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-6 py-2 rounded"
                    >
                      Browse Movies
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {!loading && movies.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 