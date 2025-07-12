import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Eye, 
  Tag as TagIcon, 
  Clock, 
  User, 
  Award, 
  Flag,
  Bookmark,
  BookmarkCheck,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RichTextEditor } from '../components/RichTextEditor';
import { Pagination } from '../components/Pagination';
import { ShareDropdown } from '../components/ShareDropdown';
import type { Question, Answer, Comment } from '../types';
import apiService from '../services/api';

export const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [answersPagination, setAnswersPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });
  
  // Vote tracking
  const [userVotes, setUserVotes] = useState<{
    question?: 'up' | 'down' | null;
    answers: Record<string, 'up' | 'down' | null>;
  }>({
    question: null,
    answers: {}
  });
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getQuestion(id!);
      
      // Clean and validate question data
      const questionData = response.data;
      const q = questionData as any; // Cast to handle MongoDB format
      
      const cleanedQuestion = {
        ...questionData,
        id: q.id || q._id || questionData.id,
        title: questionData.title || 'Untitled Question',
        content: questionData.content || '',
        tags: Array.isArray(questionData.tags) ? questionData.tags.filter(tag => tag && (tag.name || typeof tag === 'string')).map(tag => {
          if (typeof tag === 'string') {
            return { id: tag, name: tag, questionCount: 0 };
          }
          return tag;
        }) : [],
        author: questionData.author || { 
          id: 'unknown', 
          username: 'Unknown', 
          email: '', 
          reputation: 0, 
          role: 'user' as const, 
          createdAt: new Date().toISOString() 
        },
        votes: questionData.votes || 0,
        views: questionData.views || 0,
        answers: Array.isArray(questionData.answers) ? questionData.answers.map(answer => {
          const a = answer as any; // Cast to handle MongoDB format
          return {
            ...answer,
            id: a.id || a._id || Math.random().toString(36).substr(2, 9),
            author: answer.author || { 
              id: 'unknown', 
              username: 'Unknown', 
              email: '', 
              reputation: 0, 
              role: 'user' as const, 
              createdAt: new Date().toISOString() 
            },
            votes: answer.votes || 0,
            isAccepted: answer.isAccepted || false,
            comments: answer.comments || []
          };
        }) : [],
        comments: questionData.comments || [],
        createdAt: questionData.createdAt || new Date().toISOString(),
        updatedAt: questionData.updatedAt || new Date().toISOString(),
        isClosed: questionData.isClosed || false,
      };
      
      setQuestion(cleanedQuestion);
      setAnswers(cleanedQuestion.answers);
      
      // Collect all comments from question and answers
      const allComments: Comment[] = [];
      
      // Add question comments if they exist
      if (cleanedQuestion.comments && Array.isArray(cleanedQuestion.comments)) {
        allComments.push(...cleanedQuestion.comments);
      }
      
      // Add answer comments
      cleanedQuestion.answers.forEach(answer => {
        if (answer.comments && Array.isArray(answer.comments)) {
          allComments.push(...answer.comments);
        }
      });
      
      setComments(allComments);
      
      // Simulate bookmark status
      setIsBookmarked(Math.random() > 0.5);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      setError('Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (type: 'up' | 'down', targetType: 'question' | 'answer' | 'comment', targetId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple simultaneous votes
    const voteKey = `${targetType}-${targetId}`;
    if (votingStates[voteKey]) {
      return;
    }
    
    setVotingStates(prev => ({ ...prev, [voteKey]: true }));
    
    try {
      const currentVote = targetType === 'question' 
        ? userVotes.question 
        : userVotes.answers[targetId];
      
      let voteChange = 0;
      let newVoteState: 'up' | 'down' | null = type;
      
      if (currentVote === type) {
        // User is clicking the same vote button - remove vote
        voteChange = type === 'up' ? -1 : 1;
        newVoteState = null;
      } else if (currentVote === null) {
        // User is voting for the first time
        voteChange = type === 'up' ? 1 : -1;
      } else {
        // User is changing their vote
        voteChange = type === 'up' ? 2 : -2; // up to down = +2, down to up = -2
      }
      
      // Only call API if there's an actual vote (not removal)
      if (newVoteState !== null) {
        const voteValue = newVoteState === 'up' ? 1 : -1;
        
        if (targetType === 'question') {
          await apiService.voteQuestion(targetId, voteValue);
        } else if (targetType === 'answer') {
          await apiService.voteAnswer(targetId, voteValue);
        } else if (targetType === 'comment') {
          await apiService.voteComment(targetId, voteValue);
        }
      }
      
      // Update local state regardless of API call
      if (targetType === 'question') {
        if (question) {
          setQuestion({
            ...question,
            votes: question.votes + voteChange
          });
        }
        setUserVotes(prev => ({ ...prev, question: newVoteState }));
      } else if (targetType === 'answer') {
        setAnswers(prev => prev.map(answer => 
          answer.id === targetId 
            ? { ...answer, votes: answer.votes + voteChange }
            : answer
        ));
        setUserVotes(prev => ({
          ...prev,
          answers: { ...prev.answers, [targetId]: newVoteState }
        }));
      } else if (targetType === 'comment') {
        setComments(prev => prev.map(comment => 
          comment.id === targetId 
            ? { ...comment, votes: comment.votes + voteChange }
            : comment
        ));
      }
    } catch (error) {
      console.error('Vote failed:', error);
      // Show user-friendly error
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote. Please try again.';
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setVotingStates(prev => ({ ...prev, [voteKey]: false }));
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (isBookmarked) {
        await apiService.unbookmarkQuestion(question!.id);
      } else {
        await apiService.bookmarkQuestion(question!.id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!answerContent.trim() || answerContent === '<p></p>') {
      setError('Please enter your answer');
      return;
    }

    if (isSubmittingAnswer) {
      return; // Prevent double submission
    }

    try {
      setIsSubmittingAnswer(true);
      setError('');
      
      const response = await apiService.createAnswer(question!.id, answerContent);
      setAnswers(prev => [...prev, response.data]);
      setAnswerContent('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, targetId: string, targetType: 'question' | 'answer') => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!commentContent.trim()) return;

    try {
      const commentData = {
        content: commentContent,
        ...(targetType === 'question' ? { questionId: targetId } : { answerId: targetId })
      };
      const response = await apiService.createComment(commentData);
      setComments(prev => [...prev, response.data]);
      setCommentContent('');
      setActiveCommentForm(null);
      
      // Show success feedback
      setError('');
      setSuccessMessage('Comment posted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setError('Failed to post comment. Please try again.');
      setSuccessMessage('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const acceptAnswer = async (answerId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!user || user.id !== question?.author.id) {
      console.log('Not authorized to accept answer');
      return;
    }
    
    if (!answerId || typeof answerId !== 'string') {
      console.error('Invalid answer ID');
      return;
    }

    // Check if this answer is already accepted
    const targetAnswer = answers.find(a => a.id === answerId);
    if (targetAnswer?.isAccepted) {
      console.log('Answer already accepted');
      return;
    }

    // Confirm action
    if (!window.confirm('Are you sure you want to accept this answer as the solution?')) {
      return;
    }
    
    try {
      await apiService.acceptAnswer(answerId);
      
      // Update answers state - only one answer can be accepted
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })));
      
      // Update question state
      setQuestion(prev => prev ? { ...prev, acceptedAnswerId: answerId } : null);
      
      // Show success message
      setSuccessMessage('Answer accepted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      console.log('Answer accepted successfully');
    } catch (error) {
      console.error('Failed to accept answer:', error);
      setError('Failed to accept answer. Please try again.');
      setTimeout(() => setError(''), 5000);
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

  // Pagination handlers
  const handleAnswersPageChange = (page: number) => {
    setAnswersPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswersItemsPerPageChange = (itemsPerPage: number) => {
    setAnswersPagination({ currentPage: 1, itemsPerPage });
  };



  // Paginated data
  const paginatedAnswers = answers.slice(
    (answersPagination.currentPage - 1) * answersPagination.itemsPerPage,
    answersPagination.currentPage * answersPagination.itemsPerPage
  );

  // Calculate total pages
  const answersTotalPages = Math.ceil(answers.length / answersPagination.itemsPerPage);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" text="Loading question..." />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Question not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The question you're looking for doesn't exist or has been deleted.
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Questions
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="text-green-600 dark:text-green-400 text-sm">
            {successMessage}
          </div>
        </div>
      )}

      {/* Question */}
      <div className="card p-8 mb-8 animate-fade-in-up">
        <div className="flex space-x-6">
          {/* Voting */}
          <div className="flex flex-col items-center space-y-2 min-w-[60px]">
            <button
              onClick={() => handleVote('up', 'question', question.id)}
              disabled={!user || votingStates[`question-${question.id}`]}
              className={`p-2 rounded-full transition-all duration-200 ${
                !user
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : userVotes.question === 'up'
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!user ? 'Login to vote' : userVotes.question === 'up' ? 'Remove upvote' : 'Upvote'}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {question.votes}
            </span>
            <button
              onClick={() => handleVote('down', 'question', question.id)}
              disabled={!user || votingStates[`question-${question.id}`]}
              className={`p-2 rounded-full transition-all duration-200 ${
                !user
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : userVotes.question === 'down'
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!user ? 'Login to vote' : userVotes.question === 'down' ? 'Remove downvote' : 'Downvote'}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {question.title}
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: question.content }} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tags/${tag.name}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShareDropdown
                  url={`${window.location.origin}/questions/${question.id}`}
                  title={question.title}
                  description={`Check out this question: ${question.title}`}
                  onSuccess={(message) => {
                    setSuccessMessage(message);
                    setTimeout(() => setSuccessMessage(''), 3000);
                  }}
                  onError={(error) => {
                    setError(error);
                    setTimeout(() => setError(''), 5000);
                  }}
                />

                <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  <Flag className="w-4 h-4" />
                  <span>Flag</span>
                </button>
                <button 
                  onClick={() => setActiveCommentForm(question.id)}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Add Comment</span>
                </button>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Asked {formatDate(question.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {question.author.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <Link
                        to={`/users/${question.author.id}`}
                        className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {question.author.username}
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {question.author.reputation} reputation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Comments */}
            {comments.filter(comment => comment.questionId === question.id).length > 0 && (
              <div className="mt-6 space-y-3">
                {comments
                  .filter(comment => comment.questionId === question.id)
                  .map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {comment.content}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>by</span>
                            <Link
                              to={`/users/${comment.author.id}`}
                              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {comment.author.username}
                            </Link>
                            <span>•</span>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <button
                            onClick={() => handleVote('up', 'comment', comment.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Upvote comment"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-gray-600 dark:text-gray-400">
                            {comment.votes || 0}
                          </span>
                          <button
                            onClick={() => handleVote('down', 'comment', comment.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Downvote comment"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Question Comment Form */}
            {activeCommentForm === question.id && (
              <form 
                onSubmit={(e) => handleSubmitComment(e, question.id, 'question')}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="textarea mb-3"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add Comment
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveCommentForm(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {paginatedAnswers.map((answer, index) => (
            <div 
              key={answer.id} 
              id={`answer-${answer.id}`}
              className={`card p-6 animate-fade-in-up ${answer.isAccepted ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
              style={{ animationDelay: `${index * 100}ms`, scrollMarginTop: '100px' }}
            >
              <div className="flex space-x-6">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                  <button
                    onClick={() => handleVote('up', 'answer', answer.id)}
                    disabled={!user || votingStates[`answer-${answer.id}`]}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      !user
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : userVotes.answers[answer.id] === 'up'
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!user ? 'Login to vote' : userVotes.answers[answer.id] === 'up' ? 'Remove upvote' : 'Upvote'}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {answer.votes}
                  </span>
                  <button
                    onClick={() => handleVote('down', 'answer', answer.id)}
                    disabled={!user || votingStates[`answer-${answer.id}`]}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      !user
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : userVotes.answers[answer.id] === 'down'
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!user ? 'Login to vote' : userVotes.answers[answer.id] === 'down' ? 'Remove downvote' : 'Downvote'}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                  {user && user.id === question.author.id && (
                    <button
                      type="button"
                      onClick={(e) => acceptAnswer(answer.id, e)}
                      disabled={answer.isAccepted}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        answer.isAccepted 
                          ? 'text-green-600 dark:text-green-400 cursor-default' 
                          : 'text-gray-400 hover:text-green-600 dark:hover:text-green-400 cursor-pointer'
                      }`}
                      title={answer.isAccepted ? 'Already accepted' : 'Accept this answer'}
                    >
                      <CheckCircle className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {answer.isAccepted && (
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Accepted Answer
                      </span>
                    </div>
                  )}
                  
                  <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
                    <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <ShareDropdown
                        url={`${window.location.origin}/questions/${question.id}#answer-${answer.id}`}
                        title={`Answer to: ${question.title}`}
                        description={`Check out this answer to: ${question.title}`}
                        onSuccess={(message) => {
                          setSuccessMessage(message);
                          setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        onError={(error) => {
                          setError(error);
                          setTimeout(() => setError(''), 5000);
                        }}
                      />

                      <button 
                        onClick={() => setActiveCommentForm(answer.id)}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      >
                        Add Comment
                      </button>
                    </div>

                    {/* Answer Author */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Answered {formatDate(answer.createdAt)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {answer.author.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <Link
                              to={`/users/${answer.author.id}`}
                              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {answer.author.username}
                            </Link>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {answer.author.reputation} reputation
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Comments */}
                  {comments.filter(comment => comment.answerId === answer.id).length > 0 && (
                    <div className="mt-4 space-y-3">
                      {comments
                        .filter(comment => comment.answerId === answer.id)
                        .map((comment) => (
                          <div key={comment.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  {comment.content}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>by</span>
                                  <Link
                                    to={`/users/${comment.author.id}`}
                                    className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                                  >
                                    {comment.author.username}
                                  </Link>
                                  <span>•</span>
                                  <span>{formatDate(comment.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-xs">
                                <button
                                  onClick={() => handleVote('up', 'comment', comment.id)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                  title="Upvote comment"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {comment.votes || 0}
                                </span>
                                <button
                                  onClick={() => handleVote('down', 'comment', comment.id)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                  title="Downvote comment"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Comment Form */}
                  {activeCommentForm === answer.id && (
                    <form 
                      onSubmit={(e) => handleSubmitComment(e, answer.id, 'answer')}
                      className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Add a comment..."
                        className="textarea mb-3"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="btn btn-primary btn-sm">
                          Add Comment
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setActiveCommentForm(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Answers Pagination */}
        {answers.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={answersPagination.currentPage}
              totalPages={answersTotalPages}
              totalItems={answers.length}
              itemsPerPage={answersPagination.itemsPerPage}
              onPageChange={handleAnswersPageChange}
              onItemsPerPageChange={handleAnswersItemsPerPageChange}
              itemName="answer"
              itemNamePlural="answers"
              showGoToPage={answersTotalPages > 5}
              itemsPerPageOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>

      {/* Answer Form */}
      {user && (
        <div className="card p-6 animate-fade-in-up">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your Answer
          </h3>
          <form onSubmit={handleSubmitAnswer} noValidate>
            <div className="mb-4">
              <RichTextEditor
                content={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
              />
            </div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmittingAnswer || !answerContent.trim()}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAnswer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  'Post Your Answer'
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAnswerContent('');
                  setError('');
                }}
                disabled={isSubmittingAnswer}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="card p-6 text-center animate-fade-in-up">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Want to answer this question?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to share your knowledge and help others.
          </p>
          <Link to="/login" className="btn btn-primary">
            Sign In to Answer
          </Link>
        </div>
      )}
    </div>
  );
}; 