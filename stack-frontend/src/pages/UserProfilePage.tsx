import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Award, 
  MessageSquare, 
  Eye, 
  ThumbsUp, 
  Clock,
  Tag as TagIcon,
  Edit3,
  Settings,
  Trophy,
  Target
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import type { User as UserType, Question } from '../types';
import apiService from '../services/api';

export const UserProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answers' | 'activity'>('overview');
  const [error, setError] = useState('');
  
  // Pagination state
  const [questionsPagination, setQuestionsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [answersPagination, setAnswersPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Try to get user first
      const userResponse = await apiService.getUser(id!);
      setUser(userResponse.data);
      
      // Then get questions
      try {
        const questionsResponse = await apiService.getQuestions({});
        // Filter questions by author (this would be done by the API in a real app)
        setUserQuestions(questionsResponse.data.data?.filter(q => q.author?.id === id) || []);
      } catch (questionsError) {
        console.warn('Failed to fetch user questions:', questionsError);
        setUserQuestions([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 10000) return 'text-purple-600 dark:text-purple-400';
    if (reputation >= 5000) return 'text-blue-600 dark:text-blue-400';
    if (reputation >= 1000) return 'text-green-600 dark:text-green-400';
    if (reputation >= 100) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 10000) return { icon: Trophy, label: 'Expert', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
    if (reputation >= 5000) return { icon: Award, label: 'Veteran', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    if (reputation >= 1000) return { icon: Target, label: 'Skilled', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (reputation >= 100) return { icon: Award, label: 'Contributor', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { icon: User, label: 'Newcomer', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
  };

  const isOwnProfile = currentUser?.id === id;

  // Pagination handlers
  const handleQuestionsPageChange = (page: number) => {
    setQuestionsPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionsItemsPerPageChange = (itemsPerPage: number) => {
    setQuestionsPagination({ currentPage: 1, itemsPerPage });
  };

  const handleAnswersPageChange = (page: number) => {
    setAnswersPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswersItemsPerPageChange = (itemsPerPage: number) => {
    setAnswersPagination({ currentPage: 1, itemsPerPage });
  };

  // Paginated data
  const paginatedQuestions = userQuestions.slice(
    (questionsPagination.currentPage - 1) * questionsPagination.itemsPerPage,
    questionsPagination.currentPage * questionsPagination.itemsPerPage
  );

  const paginatedAnswers = userAnswers.slice(
    (answersPagination.currentPage - 1) * answersPagination.itemsPerPage,
    answersPagination.currentPage * answersPagination.itemsPerPage
  );

  // Calculate total pages
  const questionsTotalPages = Math.ceil(userQuestions.length / questionsPagination.itemsPerPage);
  const answersTotalPages = Math.ceil(userAnswers.length / answersPagination.itemsPerPage);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" text="Loading user profile..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">User not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const badge = getReputationBadge(user.reputation);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Header */}
      <div className="card p-8 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          {/* Avatar */}
          <div className="flex-shrink-0 mb-6 md:mb-0">
            <div className="w-32 h-32 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center shadow-strong">
              <span className="text-white text-4xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {user.username}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                    <badge.icon className="w-4 h-4 mr-1" />
                    {badge.label}
                  </div>
                  <div className={`text-2xl font-bold ${getReputationColor(user.reputation)}`}>
                    {user.reputation.toLocaleString()} reputation
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="btn btn-secondary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button className="btn btn-outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {user.bio}
              </p>
            )}

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userQuestions.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Questions</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userAnswers.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Answers</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userQuestions.reduce((acc, q) => acc + (q.views || 0), 0).toLocaleString()}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Views</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {userQuestions.reduce((acc, q) => acc + (q.votes || 0), 0)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Total Votes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', count: null },
              { id: 'questions', label: 'Questions', count: userQuestions.length },
              { id: 'answers', label: 'Answers', count: userAnswers.length },
              { id: 'activity', label: 'Activity', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Top Tags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Top Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {/* This would be calculated from user's questions/answers */}
                  {['javascript', 'react', 'typescript', 'node.js', 'css'].map(tag => (
                    <Link
                      key={tag}
                      to={`/tags/${tag}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {userQuestions.slice(0, 5).map((question, index) => (
                    <div key={question.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/questions/${question.id}`}
                          className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                        >
                          {question.title}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Asked {formatDate(question.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {question.votes || 0}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {question.views || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {userQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile ? 'Start asking questions to help others!' : 'This user hasn\'t asked any questions yet.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex space-x-4">
                          <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {question.votes || 0} votes
                            </div>
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {question.answers?.length || 0} answers
                            </div>
                            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {question.views || 0} views
                            </div>
                          </div>
                          <div className="flex-1">
                            <Link
                              to={`/questions/${question.id}`}
                              className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                            >
                              {question.title}
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {question.tags.map(tag => (
                                <Link
                                  key={tag.id}
                                  to={`/tags/${tag.name}`}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                                >
                                  {tag.name}
                                </Link>
                              ))}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Asked {formatDate(question.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Questions Pagination */}
                  {userQuestions.length > 0 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={questionsPagination.currentPage}
                        totalPages={questionsTotalPages}
                        totalItems={userQuestions.length}
                        itemsPerPage={questionsPagination.itemsPerPage}
                        onPageChange={handleQuestionsPageChange}
                        onItemsPerPageChange={handleQuestionsItemsPerPageChange}
                        itemName="question"
                        itemNamePlural="questions"
                        showGoToPage={questionsTotalPages > 5}
                        itemsPerPageOptions={[5, 10, 20, 50]}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Answers coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Answer tracking will be available in a future update.
              </p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Activity timeline coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed activity tracking will be available in a future update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 