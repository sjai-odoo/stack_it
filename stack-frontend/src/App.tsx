import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header />}
      <main>{children}</main>
    </div>
  );
};

// App Routes
const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
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
            <Route path="/questions/:id" element={<div>Question Detail Page (Coming Soon)</div>} />
            <Route path="/tags" element={<div>Tags Page (Coming Soon)</div>} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/search" element={<div>Search Results (Coming Soon)</div>} />
            <Route path="/users/:id" element={<div>User Profile (Coming Soon)</div>} />
            <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
