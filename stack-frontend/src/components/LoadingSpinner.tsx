import React from 'react';
import { Loader2, Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    ghost: 'text-gray-400 dark:text-gray-500'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2 className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`} />
        {variant === 'primary' && (
          <div className="absolute inset-0 animate-ping">
            <div className={`${sizeClasses[size]} rounded-full bg-primary-400 opacity-25`} />
          </div>
        )}
      </div>
      {text && (
        <p className={`mt-2 ${textSizeClasses[size]} ${variantClasses[variant]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Loading...',
  description = 'Please wait while we load your content'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="relative mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mx-auto shadow-strong animate-bounce-gentle">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className="w-16 h-16 rounded-2xl bg-primary-400 opacity-20 mx-auto" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {description}
        </p>
        
        <div className="loading-dots text-primary-600 dark:text-primary-400">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner; 