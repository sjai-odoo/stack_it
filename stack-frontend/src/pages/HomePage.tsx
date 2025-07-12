import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, ThumbsUp, Clock, Tag as TagIcon, TrendingUp, Users, Sparkles } from 'lucide-react';
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
      console.log('API Response:', response); // Debug log
      
      // Handle different response formats
      let questionsData: Question[] = [];
      if (response.data) {
        // Cast to any to handle different response formats from backend
        const responseData = response.data as any;
        
        if (Array.isArray(responseData.data)) {
          // Format: { data: { data: [...] } }
          questionsData = responseData.data;
        } else if (Array.isArray(responseData.questions)) {
          // Format: { data: { questions: [...] } }
          questionsData = responseData.questions;
        } else if (Array.isArray(responseData)) {
          // Format: { data: [...] }
          questionsData = responseData;
        }
      }
      
      // Clean and validate questions data
      const cleanedQuestions = questionsData.map(question => {
        const q = question as any; // Cast to handle different backend formats
        return {
          ...question,
          id: q.id || q._id || Math.random().toString(36).substr(2, 9),
          title: question.title || 'Untitled Question',
          content: question.content || '',
          tags: Array.isArray(question.tags) ? question.tags.filter(tag => tag && (tag.name || typeof tag === 'string')).map(tag => {
            if (typeof tag === 'string') {
              return { id: tag, name: tag, questionCount: 0 };
            }
            return tag;
          }) : [],
          author: question.author || { id: 'unknown', username: 'Unknown', email: '', reputation: 0, role: 'user' as const, createdAt: new Date().toISOString() },
          votes: question.votes || 0,
          views: question.views || 0,
          answers: question.answers || [],
          createdAt: question.createdAt || new Date().toISOString(),
          updatedAt: question.updatedAt || new Date().toISOString(),
          isClosed: question.isClosed || false,
        };
      });
      
      setQuestions(cleanedQuestions);
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
    if (votes > 0) return 'text-green-600 dark:text-green-400';
    if (votes < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex space-x-4">
            <div className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="loading-skeleton h-6 w-12 rounded"></div>
              <div className="loading-skeleton h-3 w-8 rounded"></div>
              <div className="loading-skeleton h-6 w-12 rounded"></div>
              <div className="loading-skeleton h-3 w-8 rounded"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="loading-skeleton h-6 w-3/4 rounded"></div>
              <div className="loading-skeleton h-4 w-full rounded"></div>
              <div className="loading-skeleton h-4 w-2/3 rounded"></div>
              <div className="flex space-x-2">
                <div className="loading-skeleton h-6 w-16 rounded-full"></div>
                <div className="loading-skeleton h-6 w-20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in-up">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            All Questions
            <Sparkles className="inline-block w-8 h-8 ml-2 text-primary-500 animate-pulse" />
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Browse and search through all questions in our community
          </p>
        </div>
        <Link
          to="/ask"
          className="mt-6 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium hover-glow"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Ask Question
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card-interactive p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {questions.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Questions</p>
        </div>
        <div className="card-interactive p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {new Set(questions.map(q => q.author?.username)).size}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Contributors</p>
        </div>
        <div className="card-interactive p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {questions.reduce((acc, q) => acc + (q.views || 0), 0)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Total Views</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'newest', label: 'Newest', icon: Clock },
              { value: 'votes', label: 'Most Voted', icon: ThumbsUp },
              { value: 'views', label: 'Most Viewed', icon: Eye },
              { value: 'unanswered', label: 'Unanswered', icon: MessageSquare },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value as QuestionFilters['sort'])}
                className={`inline-flex items-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                  filters.sort === option.value
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-soft'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <option.icon className="w-4 h-4 mr-2" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
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
                    {question.title || 'Untitled Question'}
                  </h3>
                </Link>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {question.content ? question.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No content available'}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(question.tags && question.tags.length > 0) ? question.tags.filter(tag => tag && tag.name).map((tag) => (
                    <Link
                      key={tag.id || tag.name}
                      to={`/tags/${tag.name}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-all duration-200 hover:scale-105"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Link>
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
                    <span className="font-medium text-gray-700 dark:text-gray-300">
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
        <div className="text-center py-16 animate-fade-in-up">
          <div className="text-gray-400 dark:text-gray-500 text-8xl mb-6">🤔</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No questions found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Be the first to ask a question in our community! Share your knowledge and help others learn.
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Ask First Question
          </Link>
        </div>
      )}
    </div>
  );
}; 