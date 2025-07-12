import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ThumbsUp, Clock, Tag as TagIcon } from 'lucide-react';
import type { Question, QuestionFilters } from '../types';
import apiService from '../services/api';

export const HomePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilters>({
    sort: 'newest',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getQuestions(filters);
      if (response.data && Array.isArray(response.data.data)) {
        setQuestions(response.data.data);
      } else {
        console.error('Invalid response format:', response);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sort: QuestionFilters['sort']) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getVoteColor = (votes: number) => {
    if (votes > 0) return 'text-green-600';
    if (votes < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="mt-2 text-gray-600">
            Browse and search through all questions in our community
          </p>
        </div>
        <Link
          to="/ask"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Ask Question
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { value: 'newest', label: 'Newest' },
              { value: 'votes', label: 'Most Voted' },
              { value: 'views', label: 'Most Viewed' },
              { value: 'unanswered', label: 'Unanswered' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value as QuestionFilters['sort'])}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filters.sort === option.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex space-x-4">
              {/* Stats */}
              <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                <div className={`text-lg font-semibold ${getVoteColor(question.votes || 0)}`}>
                  {question.votes || 0}
                </div>
                <div className="text-xs text-gray-500">votes</div>
                
                <div className="text-lg font-semibold text-gray-700">
                  {(question.answers && question.answers.length) || 0}
                </div>
                <div className="text-xs text-gray-500">answers</div>
                
                <div className="text-sm font-semibold text-gray-700">
                  {question.views || 0}
                </div>
                <div className="text-xs text-gray-500">views</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/questions/${question.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                >
                  {question.title || 'Untitled Question'}
                </Link>
                
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {question.content ? question.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No content available'}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {(question.tags && question.tags.length > 0) ? question.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tags/${tag.name}`}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Link>
                  )) : (
                    <span className="text-xs text-gray-500">No tags</span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
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
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {question.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700">
                      {question.author?.username || 'Unknown User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-6">
            Be the first to ask a question in our community!
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
          >
            Ask Question
          </Link>
        </div>
      )}
    </div>
  );
}; 