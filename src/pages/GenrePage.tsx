import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import useGenres from '../hooks/useGenres';
import useMoviesByGenre from '../hooks/useMoviesByGenre';
import GenreList from '../components/GenreList';

const GenrePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const genreId = parseInt(id || '0', 10);
  const { genres } = useGenres();
  
  // Use the new hook to fetch movies by genre
  const {
    movies,
    loading,
    error,
    totalPages,
    currentPage,
    setPage
  } = useMoviesByGenre(genreId);
  
  // Get the genre name
  const genreName = genres.find(g => g.id === genreId)?.name || 'Genre';
  
  return (
    <div className="pt-24 pb-20 w-full">
      <div className="flex">
        {/* Left Sidebar - Categories */}
        <aside className="hidden lg:block w-64 min-w-64 pr-4 border-r border-gray-800">
          <div className="sticky top-24 pl-4">
            <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
            <GenreList />
          </div>
        </aside>
        
        {/* Main Content - Full Width */}
        <main className="flex-1 px-4 md:px-8">
          {/* Mobile Breadcrumbs */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">{genreName}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-6">
            {genreName} Movies
          </h1>
          
          {/* Genres horizontal list (mobile only) */}
          <div className="lg:hidden mb-8">
            <GenreList layout="horizontal" />
          </div>
          
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
              <h3 className="text-xl text-white mb-3">No movies found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any {genreName.toLowerCase()} movies. Try another genre.
              </p>
              <Link 
                to="/" 
                className="inline-block bg-netflix-red hover:bg-netflix-red/80 transition-colors text-white px-6 py-2 rounded"
              >
                Explore All Movies
              </Link>
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
  );
};

export default GenrePage;