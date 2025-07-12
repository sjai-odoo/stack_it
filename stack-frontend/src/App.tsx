import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { LoadingPage } from './components/LoadingSpinner';
import { HomePage } from './pages/HomePage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingPage title="Authenticating..." description="Verifying your credentials" />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {isAuthenticated && <Header />}
      <main className="page-transition">{children}</main>
    </div>
  );
};

// App Routes
const AppRoutes = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/questions" element={<HomePage />} />
                <Route 
                  path="/ask" 
                  element={
                    <ProtectedRoute>
                      <AskQuestionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Add more routes here as we create them */}
                <Route path="/questions/:id" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Question Detail Page</h1><p className="text-gray-600 dark:text-gray-400">Coming Soon</p></div></div>} />
                <Route path="/tags" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tags Page</h1><p className="text-gray-600 dark:text-gray-400">Coming Soon</p></div></div>} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/search" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Search Results</h1><p className="text-gray-600 dark:text-gray-400">Coming Soon</p></div></div>} />
                <Route path="/users/:id" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">User Profile</h1><p className="text-gray-600 dark:text-gray-400">Coming Soon</p></div></div>} />
                <Route path="/settings" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1><p className="text-gray-600 dark:text-gray-400">Coming Soon</p></div></div>} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default AppRoutes;
