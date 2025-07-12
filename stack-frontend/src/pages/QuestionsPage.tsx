import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  Clock, 
  Tag as TagIcon, 
  Filter,
  Search,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import type { Question, QuestionFilters } from '../types';
import apiService from '../services/api';

export const QuestionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilters>({
    sort: (searchParams.get('sort') as QuestionFilters['sort']) || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    search: searchParams.get('search') || '',
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.search) params.set('search', filters.search);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getQuestions(filters);
      console.log('Questions API Response:', response); // Debug log
      
      // Handle different response formats
      let questionsData: Question[] = [];
      let total = 0;
      let totalPagesCount = 0;
      
      if (response.data) {
        const responseData = response.data as any;
        
        if (Array.isArray(responseData.data)) {
          // Format: { data: { data: [...], total: number, totalPages: number } }
          questionsData = responseData.data;
          total = responseData.total || 0;
          totalPagesCount = responseData.totalPages || 0;
        } else if (Array.isArray(responseData.questions)) {
          // Format: { data: { questions: [...] } }
          questionsData = responseData.questions;
          total = responseData.total || questionsData.length;
          totalPagesCount = Math.ceil(total / (filters.limit || 20));
        } else if (Array.isArray(responseData)) {
          // Format: { data: [...] }
          questionsData = responseData;
          total = questionsData.length;
          totalPagesCount = 1;
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
      setTotalQuestions(total);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
      setTotalQuestions(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sort: QuestionFilters['sort']) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setFilters(prev => ({ ...prev, limit: itemsPerPage, page: 1 }));
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
      return 'Invalid date';
    }
  };

  const getVoteColor = (votes: number) => {
    if (votes > 0) return 'text-green-600 dark:text-green-400';
    if (votes < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getQuestionStats = () => {
    const answered = questions.filter(q => q.answers && q.answers.length > 0).length;
    const unanswered = questions.length - answered;
    const totalVotes = questions.reduce((sum, q) => sum + (q.votes || 0), 0);
    
    return { answered, unanswered, totalVotes };
  };

  const stats = getQuestionStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            All Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} in our community
          </p>
        </div>
        <Link
          to="/ask"
          className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200 hover:scale-105"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Ask Question
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Questions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalQuestions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Answered</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.answered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unanswered</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.unanswered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ThumbsUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Votes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalVotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value as QuestionFilters['sort'])}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="newest">Newest</option>
              <option value="votes">Most Votes</option>
              <option value="views">Most Views</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 p-6"
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
              <div className="flex-1">
                <Link
                  to={`/questions/${question.id}`}
                  className="block group"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2 mb-3">
                    {question.title || 'Untitled Question'}
                  </h3>
                </Link>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {question.content ? question.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No content available'}
                </div>

                                 {/* Tags */}
                 <div className="flex flex-wrap gap-2 mb-4">
                   {(question.tags && question.tags.length > 0) ? question.tags.filter(tag => tag && tag.name).map((tag) => (
                     <Link
                       key={tag.id || tag.name}
                       to={`/tags/${tag.name}`}
                       className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-all duration-200"
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
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(question.createdAt)}
                    </div>
                    {question.acceptedAnswerId && (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accepted
                      </div>
                    )}
                  </div>
                                     <div className="flex items-center space-x-2">
                     <div className="flex items-center">
                       <Users className="w-4 h-4 mr-1" />
                       {question.author?.username || 'Unknown'}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-500 text-8xl mb-6">🤔</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {filters.search ? 'No questions found' : 'No questions yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {filters.search 
              ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
              : 'Be the first to ask a question in our community! Share your knowledge and help others learn.'
            }
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Ask Question
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            totalItems={totalQuestions}
            itemsPerPage={filters.limit || 20}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="question"
            itemNamePlural="questions"
            showGoToPage={totalPages > 5}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}; 