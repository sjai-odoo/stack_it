import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  ThumbsUp, 
  Eye, 
  MessageSquare, 
  Tag as TagIcon,
  TrendingUp,
  Users,
  X,
  ChevronDown
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Question, QuestionFilters } from '../types';
import apiService from '../services/api';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Search parameters
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<QuestionFilters['sort']>('newest');
  const [dateRange, setDateRange] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [minVotes, setMinVotes] = useState<number>(0);
  const [hasAcceptedAnswer, setHasAcceptedAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, currentPage, sortBy, selectedTags, dateRange, minVotes, hasAcceptedAnswer]);

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const filters: QuestionFilters = {
        search: query,
        sort: sortBy,
        page: currentPage,
        limit: 20,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      const response = await apiService.searchQuestions(query, filters);
      
      if (response.data) {
        setQuestions(response.data.data);
        setTotalResults(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getVoteColor = (votes: number) => {
    if (votes > 0) return 'text-green-600 dark:text-green-400';
    if (votes < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSortBy('newest');
    setDateRange('all');
    setMinVotes(0);
    setHasAcceptedAnswer(null);
  };

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No search query provided
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please enter a search term to find questions.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isLoading ? 'Searching...' : `${totalResults} results for "${query}"`}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-16 text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary py-2"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {(selectedTags.length > 0 || sortBy !== 'newest' || dateRange !== 'all' || minVotes > 0 || hasAcceptedAnswer !== null) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="card p-6 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as QuestionFilters['sort'])}
                  className="input"
                >
                  <option value="newest">Newest</option>
                  <option value="votes">Most Voted</option>
                  <option value="views">Most Viewed</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="input"
                >
                  <option value="all">All Time</option>
                  <option value="day">Past Day</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>

              {/* Min Votes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Votes
                </label>
                <input
                  type="number"
                  min="0"
                  value={minVotes}
                  onChange={(e) => setMinVotes(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>

              {/* Answer Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer Status
                </label>
                <select
                  value={hasAcceptedAnswer === null ? 'all' : hasAcceptedAnswer ? 'answered' : 'unanswered'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setHasAcceptedAnswer(value === 'all' ? null : value === 'answered');
                  }}
                  className="input"
                >
                  <option value="all">All Questions</option>
                  <option value="answered">Has Accepted Answer</option>
                  <option value="unanswered">No Accepted Answer</option>
                </select>
              </div>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtered by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagRemove(tag)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Searching questions..." />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Search Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => performSearch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try different keywords or adjust your filters.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
            >
              Clear Search
            </button>
            <button
              onClick={clearFilters}
              className="btn btn-outline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="card-interactive p-6 animate-fade-in-up"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex space-x-6">
                {/* Stats */}
                <div className="flex flex-col items-center space-y-3 min-w-[80px]">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getVoteColor(question.votes || 0)}`}>
                      {question.votes || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">votes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${(question.answers && question.answers.length > 0) ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {(question.answers && question.answers.length) || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">answers</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {question.views || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">views</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/questions/${question.id}`}
                    className="block group"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2 mb-3">
                      {question.title}
                    </h3>
                  </Link>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {question.content ? question.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No content available'}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(question.tags && question.tags.length > 0) ? question.tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagAdd(tag.name)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-all duration-200 hover:scale-105"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag.name}
                      </button>
                    )) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">No tags</span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(question.createdAt || new Date().toISOString())}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{(question.answers && question.answers.length) || 0} answers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{question.views || 0} views</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center shadow-soft">
                        <span className="text-white text-xs font-medium">
                          {question.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <Link
                        to={`/users/${question.author?.id}`}
                        className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {question.author?.username || 'Unknown User'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex space-x-2">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = Math.max(1, currentPage - 2) + i;
              if (pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`btn ${pageNumber === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn btn-secondary"
              >
                Next
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}; 