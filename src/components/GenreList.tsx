import React from 'react';
import { Link } from 'react-router-dom';
import useGenres from '../hooks/useGenres';

interface GenreListProps {
  onSelectGenre?: (genreId: number) => void;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

const GenreList: React.FC<GenreListProps> = ({ 
  onSelectGenre, 
  className = '',
  layout = 'vertical'
}) => {
  const { genres, loading, error } = useGenres();

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(10).fill(0).map((_, i) => (
          <div 
            key={i} 
            className="h-8 rounded bg-white/10 shimmer"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-md">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        No genres available
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {genres.map((genre) => (
          <GenreItem 
            key={genre.id}
            genre={genre}
            onClick={onSelectGenre}
            horizontal
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <h3 className="text-lg font-medium text-white mb-3">Categories</h3>
      {genres.map((genre) => (
        <GenreItem 
          key={genre.id}
          genre={genre}
          onClick={onSelectGenre}
        />
      ))}
    </div>
  );
};

// Genre item component
interface GenreItemProps {
  genre: {
    id: number;
    name: string;
  };
  onClick?: (genreId: number) => void;
  horizontal?: boolean;
}

const GenreItem: React.FC<GenreItemProps> = ({ genre, onClick, horizontal }) => {
  const className = horizontal 
    ? "px-4 py-1 bg-netflix-dark rounded-full text-sm text-white hover:bg-netflix-red transition-colors duration-200"
    : "block py-2 px-3 text-gray-300 hover:bg-netflix-dark hover:text-white rounded transition-colors duration-200";

  if (onClick) {
    return (
      <button 
        className={className}
        onClick={() => onClick(genre.id)}
      >
        {genre.name}
      </button>
    );
  }

  return (
    <Link 
      to={`/genre/${genre.id}`} 
      className={className}
    >
      {genre.name}
    </Link>
  );
};

export default GenreList; 