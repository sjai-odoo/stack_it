import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  // Core pagination data
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Callbacks
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  
  // Display options
  showItemsPerPage?: boolean;
  showResultsInfo?: boolean;
  showGoToPage?: boolean;
  maxPageButtons?: number;
  itemsPerPageOptions?: number[];
  
  // Styling
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Labels
  itemName?: string; // e.g., "questions", "users", "tags"
  itemNamePlural?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showResultsInfo = true,
  showGoToPage = true,
  maxPageButtons = 7,
  itemsPerPageOptions = [10, 20, 50, 100],
  size = 'md',
  className = '',
  itemName = 'item',
  itemNamePlural,
}) => {
  const [goToPageInput, setGoToPageInput] = useState('');
  const [showGoToInput, setShowGoToInput] = useState(false);
  
  const itemNameDisplay = itemNamePlural || `${itemName}s`;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Size-based styling
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-sm',
      input: 'px-2 py-1 text-sm',
      select: 'px-2 py-1 text-sm',
      text: 'text-sm',
    },
    md: {
      button: 'px-3 py-2 text-sm',
      input: 'px-3 py-2 text-sm',
      select: 'px-3 py-2 text-sm',
      text: 'text-sm',
    },
    lg: {
      button: 'px-4 py-3 text-base',
      input: 'px-4 py-3 text-base',
      select: 'px-4 py-3 text-base',
      text: 'text-base',
    },
  };
  
  const sizeClass = sizeClasses[size];
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle range
      const start = Math.max(2, currentPage - Math.floor(maxPageButtons / 2));
      const end = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2));
      
      // Add ellipsis if there's a gap after first page
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap before last page
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(goToPageInput);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPageInput('');
      setShowGoToInput(false);
    }
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };
  
  // Don't render if there's only one page and no other controls
  if (totalPages <= 1 && !showItemsPerPage && !showResultsInfo) {
    return null;
  }
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results Info */}
      {showResultsInfo && (
        <div className={`text-gray-700 dark:text-gray-300 ${sizeClass.text}`}>
          {totalItems > 0 ? (
            <span>
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> {itemNameDisplay}
            </span>
          ) : (
            <span>No {itemNameDisplay} found</span>
          )}
        </div>
      )}
      
      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Items per page */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label className={`text-gray-700 dark:text-gray-300 ${sizeClass.text}`}>
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              className={`
                border border-gray-300 dark:border-gray-600 rounded-md
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${sizeClass.select}
              `}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center">
            <nav className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className={`
                  flex items-center justify-center border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  rounded-l-md transition-colors duration-200
                  ${sizeClass.button}
                `}
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              {/* Previous Page */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`
                  flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                  ${sizeClass.button}
                `}
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === 'ellipsis' ? (
                    <span className={`
                      flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                      ${sizeClass.button}
                    `}>
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page)}
                      className={`
                        flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600
                        transition-colors duration-200
                        ${sizeClass.button}
                        ${currentPage === page
                          ? 'bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-400 z-10'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              
              {/* Next Page */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`
                  flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                  ${sizeClass.button}
                `}
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Last Page */}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`
                  flex items-center justify-center border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  rounded-r-md transition-colors duration-200
                  ${sizeClass.button}
                `}
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
        
        {/* Go to Page */}
        {showGoToPage && totalPages > 1 && (
          <div className="flex items-center gap-2">
            {!showGoToInput ? (
              <button
                onClick={() => setShowGoToInput(true)}
                className={`
                  text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300
                  transition-colors duration-200 ${sizeClass.text}
                `}
              >
                Go to page
              </button>
            ) : (
              <form onSubmit={handleGoToPage} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={goToPageInput}
                  onChange={(e) => setGoToPageInput(e.target.value)}
                  placeholder="Page #"
                  className={`
                    w-20 border border-gray-300 dark:border-gray-600 rounded-md
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    ${sizeClass.input}
                  `}
                  autoFocus
                />
                <button
                  type="submit"
                  className={`
                    bg-primary-600 hover:bg-primary-700 text-white rounded-md
                    transition-colors duration-200 ${sizeClass.button}
                  `}
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoToInput(false);
                    setGoToPageInput('');
                  }}
                  className={`
                    text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                    transition-colors duration-200 ${sizeClass.text}
                  `}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 