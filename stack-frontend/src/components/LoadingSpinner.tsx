import React from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

interface LoadingPageProps {
  title?: string;
  description?: string;
  type?: 'loading' | 'error' | 'success' | 'maintenance';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-gray-600 dark:text-gray-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  type = 'spinner',
  color = 'primary',
  className = ''
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClass} ${colorClass.replace('text-', 'bg-')} rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClass} ${colorClass.replace('text-', 'bg-')} rounded-full animate-pulse`} />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="animate-shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="animate-shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="animate-shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        );
      
      default:
        return (
          <Loader2 className={`${sizeClass} ${colorClass} animate-spin`} />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-sm font-medium ${colorClass} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Loading...',
  description = 'Please wait while we prepare your content.',
  type = 'loading',
  action
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 animate-bounce" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 animate-bounce-in" />;
      case 'maintenance':
        return <Clock className="w-16 h-16 text-yellow-500 dark:text-yellow-400 animate-pulse" />;
      default:
        return <Zap className="w-16 h-16 text-primary-500 dark:text-primary-400 animate-float" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-600 dark:text-red-400'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-600 dark:text-green-400'
        };
      case 'maintenance':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          bg: 'bg-primary-50 dark:bg-primary-900/20',
          border: 'border-primary-200 dark:border-primary-800',
          text: 'text-primary-600 dark:text-primary-400'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`${colors.bg} ${colors.border} border rounded-lg p-8 text-center animate-bounce-in`}>
          <div className="flex justify-center mb-6">
            {getIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>

          {type === 'loading' && (
            <div className="flex justify-center mb-6">
              <LoadingSpinner size="lg" type="spinner" />
            </div>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {action.label}
            </button>
          )}
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 dark:bg-primary-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>
    </div>
  );
};

// Skeleton loader components for specific UI elements
export const QuestionSkeleton: React.FC = () => {
  return (
    <div className="card-interactive p-6 animate-pulse">
      <div className="flex space-x-6">
        <div className="flex flex-col items-center space-y-3 min-w-[80px]">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
        <div className="flex-1">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4" />
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="h-6 w-14 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
      </div>
    </div>
  );
};

export const CommentSkeleton: React.FC = () => {
  return (
    <div className="p-3 animate-pulse">
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" />
      </div>
    </div>
  );
};

export default LoadingSpinner; 