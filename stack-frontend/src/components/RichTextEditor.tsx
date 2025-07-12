import React from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Write your answer here...", 
  className = '' 
}: RichTextEditorProps) => {
  return (
    <div className={`relative ${className}`}>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                   dark:focus:ring-primary-400 dark:focus:border-primary-400
                   bg-white dark:bg-gray-900 
                   text-gray-900 dark:text-gray-100 
                   placeholder-gray-500 dark:placeholder-gray-400
                   resize-y
                   transition-colors duration-200"
        rows={8}
      />
    </div>
  );
}; 