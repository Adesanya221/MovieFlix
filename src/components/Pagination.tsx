import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate visible page range
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-sm"
        >
          1
        </button>
      );
      
      // Ellipsis after first page
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="text-gray-500 px-1">...</span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
            currentPage === i 
              ? 'bg-netflix-red text-white' 
              : 'text-gray-300 hover:bg-white/20'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      // Ellipsis before last page
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="text-gray-500 px-1">...</span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-sm"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div className="flex justify-center items-center py-8 space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-full flex items-center text-sm ${
          currentPage === 1 
            ? 'text-gray-600 cursor-not-allowed' 
            : 'text-gray-300 hover:bg-white/20'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>
      
      <div className="hidden sm:flex items-center space-x-1">
        {renderPageNumbers()}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-full flex items-center text-sm ${
          currentPage === totalPages 
            ? 'text-gray-600 cursor-not-allowed' 
            : 'text-gray-300 hover:bg-white/20'
        }`}
      >
        Next
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination; 