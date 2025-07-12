import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Tag, 
  TrendingUp, 
  AlertTriangle, 
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Send,
  Download,
  BarChart3,
  Activity,
  Shield,
  Flag,
  Search,
  Filter,
  Calendar,
  Clock,
  UserX,
  MessageCircle,
  Trash2,
  FileText,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import type { Question, User, Comment } from '../types';
import apiService from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalTags: number;
  activeUsers: number;
  bannedUsers: number;
  pendingReports: number;
  todayQuestions: number;
  todayAnswers: number;
  todayUsers: number;
}

interface ReportedContent {
  id: string;
  type: 'question' | 'answer' | 'comment';
  content: string;
  reportedBy: User;
  reportedAt: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  contentId: string;
}

interface PlatformMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  createdAt: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'reports' | 'messages' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    totalTags: 0,
    activeUsers: 0,
    bannedUsers: 0,
    pendingReports: 0,
    todayQuestions: 0,
    todayAnswers: 0,
    todayUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [platformMessages, setPlatformMessages] = useState<PlatformMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

  // Pagination state
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [reportsPagination, setReportsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [messagesPagination, setMessagesPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
  });

  // New message form
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    type: 'info' as PlatformMessage['type'],
  });

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be separate API calls
      const [usersResponse, questionsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getQuestions({ limit: 50 }),
      ]);

      setUsers(usersResponse.data || []);
      setQuestions(questionsResponse.data.data || []);

      // Mock stats - in production, these would come from dedicated admin endpoints
      setStats({
        totalUsers: usersResponse.data?.length || 0,
        totalQuestions: questionsResponse.data.data?.length || 0,
        totalAnswers: questionsResponse.data.data?.reduce((sum: number, q: Question) => sum + (q.answers?.length || 0), 0) || 0,
        totalTags: 25, // Mock value
        activeUsers: usersResponse.data?.filter((u: User) => u.role !== 'banned').length || 0,
        bannedUsers: usersResponse.data?.filter((u: User) => u.role === 'banned').length || 0,
        pendingReports: 3, // Mock value
        todayQuestions: 5, // Mock value
        todayAnswers: 12, // Mock value
        todayUsers: 2, // Mock value
      });

      // Mock reported content
      setReportedContent([
        {
          id: '1',
          type: 'question',
          content: 'How to hack into systems?',
          reportedBy: { id: '1', username: 'reporter1', email: 'reporter@example.com', reputation: 100, role: 'user', createdAt: new Date().toISOString() },
          reportedAt: new Date().toISOString(),
          reason: 'Inappropriate content',
          status: 'pending',
          contentId: 'q1',
        },
        {
          id: '2',
          type: 'answer',
          content: 'This is spam content...',
          reportedBy: { id: '2', username: 'reporter2', email: 'reporter2@example.com', reputation: 200, role: 'user', createdAt: new Date().toISOString() },
          reportedAt: new Date().toISOString(),
          reason: 'Spam',
          status: 'pending',
          contentId: 'a1',
        },
      ]);

      // Mock platform messages
      setPlatformMessages([
        {
          id: '1',
          title: 'Scheduled Maintenance',
          content: 'The platform will be under maintenance on Sunday from 2-4 AM UTC.',
          type: 'info',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    
    try {
      await apiService.banUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'banned' } : u));
      setStats(prev => ({ ...prev, bannedUsers: prev.bannedUsers + 1, activeUsers: prev.activeUsers - 1 }));
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user. Please try again.');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    
    try {
      await apiService.unbanUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'user' } : u));
      setStats(prev => ({ ...prev, bannedUsers: prev.bannedUsers - 1, activeUsers: prev.activeUsers + 1 }));
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Failed to unban user. Please try again.');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      await apiService.resolveReport(reportId, action);
      setReportedContent(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r));
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Failed to resolve report. Please try again.');
    }
  };

  const handleDeleteContent = async (contentId: string, contentType: 'question' | 'answer' | 'comment') => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      if (contentType === 'question') {
        await apiService.deleteQuestion(contentId);
        setQuestions(prev => prev.filter(q => q.id !== contentId));
      } else if (contentType === 'answer') {
        await apiService.deleteAnswer(contentId);
      } else if (contentType === 'comment') {
        await apiService.deleteComment(contentId);
      }
      alert('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  const handleCreateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.title || !newMessage.content) return;

    try {
      const message: PlatformMessage = {
        id: Date.now().toString(),
        ...newMessage,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      await apiService.createPlatformMessage(message);
      setPlatformMessages(prev => [message, ...prev]);
      setNewMessage({ title: '', content: '', type: 'info' });
      alert('Platform message created successfully');
    } catch (error) {
      console.error('Failed to create message:', error);
      alert('Failed to create message. Please try again.');
    }
  };

  const handleToggleMessage = async (messageId: string) => {
    try {
      const message = platformMessages.find(m => m.id === messageId);
      if (!message) return;

      await apiService.togglePlatformMessage(messageId, !message.isActive);
      setPlatformMessages(prev => prev.map(m => m.id === messageId ? { ...m, isActive: !m.isActive } : m));
    } catch (error) {
      console.error('Failed to toggle message:', error);
      alert('Failed to toggle message. Please try again.');
    }
  };

  const handleExportData = async (dataType: 'users' | 'questions' | 'reports') => {
    try {
      const response = await apiService.exportData(dataType);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Pagination handlers
  const handleUsersPageChange = (page: number) => {
    setUsersPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleUsersItemsPerPageChange = (itemsPerPage: number) => {
    setUsersPagination({ currentPage: 1, itemsPerPage });
  };

  const handleReportsPageChange = (page: number) => {
    setReportsPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleReportsItemsPerPageChange = (itemsPerPage: number) => {
    setReportsPagination({ currentPage: 1, itemsPerPage });
  };

  const handleMessagesPageChange = (page: number) => {
    setMessagesPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleMessagesItemsPerPageChange = (itemsPerPage: number) => {
    setMessagesPagination({ currentPage: 1, itemsPerPage });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.role !== 'banned') ||
                         (filterStatus === 'banned' && user.role === 'banned');
    return matchesSearch && matchesFilter;
  });

  const pendingReports = reportedContent.filter(r => r.status === 'pending');

  // Paginated data
  const paginatedUsers = filteredUsers.slice(
    (usersPagination.currentPage - 1) * usersPagination.itemsPerPage,
    usersPagination.currentPage * usersPagination.itemsPerPage
  );
  
  const paginatedReports = reportedContent.slice(
    (reportsPagination.currentPage - 1) * reportsPagination.itemsPerPage,
    reportsPagination.currentPage * reportsPagination.itemsPerPage
  );
  
  const paginatedMessages = platformMessages.slice(
    (messagesPagination.currentPage - 1) * messagesPagination.itemsPerPage,
    messagesPagination.currentPage * messagesPagination.itemsPerPage
  );

  // Calculate total pages
  const usersTotalPages = Math.ceil(filteredUsers.length / usersPagination.itemsPerPage);
  const reportsTotalPages = Math.ceil(reportedContent.length / reportsPagination.itemsPerPage);
  const messagesTotalPages = Math.ceil(platformMessages.length / messagesPagination.itemsPerPage);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'messages', label: 'Messages', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your StackIt community and monitor platform activity
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.id === 'reports' && pendingReports.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {pendingReports.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Users</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{stats.todayUsers} today</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Questions</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalQuestions}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{stats.todayQuestions} today</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Answers</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAnswers}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+{stats.todayAnswers} today</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pending Reports</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingReports}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Needs attention</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {questions.slice(0, 5).map((question, index) => (
                <div key={question.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/questions/${question.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {question.title}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {question.author.username} • {new Date(question.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional tab content would go here... */}
      {/* This is getting quite long, so I'll continue with the key tabs */}
      
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Tools */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Management</h3>
              <div className="flex space-x-4 mt-4 sm:mt-0">
                <button
                  onClick={() => handleExportData('users')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="block border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="banned">Banned Users</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.role === 'moderator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          user.role === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.reputation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/users/${user.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          View
                        </Link>
                        {user.role === 'banned' ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Unban
                          </button>
                        ) : user.role !== 'admin' && (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Users Pagination */}
            {filteredUsers.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={usersPagination.currentPage}
                  totalPages={usersTotalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={usersPagination.itemsPerPage}
                  onPageChange={handleUsersPageChange}
                  onItemsPerPageChange={handleUsersItemsPerPageChange}
                  itemName="user"
                  itemNamePlural="users"
                  showGoToPage={usersTotalPages > 5}
                  itemsPerPageOptions={[5, 10, 25, 50]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Content Reports</h3>
            <div className="space-y-4">
              {paginatedReports.map((report) => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.type === 'question' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          report.type === 'answer' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {report.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                        <strong>Content:</strong> {report.content}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Reported by {report.reportedBy.username} on {new Date(report.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResolveReport(report.id, 'resolve')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleDeleteContent(report.contentId, report.type)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Reports Pagination */}
            {reportedContent.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={reportsPagination.currentPage}
                  totalPages={reportsTotalPages}
                  totalItems={reportedContent.length}
                  itemsPerPage={reportsPagination.itemsPerPage}
                  onPageChange={handleReportsPageChange}
                  onItemsPerPageChange={handleReportsItemsPerPageChange}
                  itemName="report"
                  itemNamePlural="reports"
                  showGoToPage={reportsTotalPages > 5}
                  itemsPerPageOptions={[5, 10, 25, 50]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Create New Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create Platform Message</h3>
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Title
                </label>
                <input
                  type="text"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={3}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Type
                </label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
                  className="block border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Create Message
              </button>
            </form>
          </div>

          {/* Existing Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Platform Messages</h3>
            <div className="space-y-4">
              {paginatedMessages.map((message) => (
                <div key={message.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {message.title}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          message.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          message.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {message.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          message.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {message.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created on {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleMessage(message.id)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                        message.isActive
                          ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                          : 'text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {message.isActive ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                      {message.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Messages Pagination */}
            {platformMessages.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={messagesPagination.currentPage}
                  totalPages={messagesTotalPages}
                  totalItems={platformMessages.length}
                  itemsPerPage={messagesPagination.itemsPerPage}
                  onPageChange={handleMessagesPageChange}
                  onItemsPerPageChange={handleMessagesItemsPerPageChange}
                  itemName="message"
                  itemNamePlural="messages"
                  showGoToPage={messagesTotalPages > 5}
                  itemsPerPageOptions={[5, 10, 25, 50]}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}; 