import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RichTextEditor } from '../components/RichTextEditor';
import { TagSelector } from '../components/TagSelector';
import apiService from '../services/api';

export const AskQuestionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a question title');
      return;
    }
    
    if (!content.trim() || content === '<p></p>') {
      setError('Please enter question content');
      return;
    }
    
    if (selectedTags.length === 0) {
      setError('Please select at least one tag');
      return;
    }
    
    if (selectedTags.length > 5) {
      setError('You can select up to 5 tags');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiService.createQuestion({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
      });
      
      navigate(`/questions/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-6">
            You need to be logged in to ask a question.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="mt-2 text-gray-600">
          Share your knowledge and help others in our community
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question? Be specific."
            className="input"
            maxLength={300}
          />
          <p className="mt-1 text-sm text-gray-500">
            {title.length}/300 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Details *
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Provide all the information someone would need to answer your question..."
            className="min-h-[300px]"
          />
          <p className="mt-2 text-sm text-gray-500">
            Use the toolbar to format your question. You can include code, links, and images.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <TagSelector
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select up to 5 tags that describe your question..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Add up to 5 tags to help others find your question. Tags should be relevant to the topic.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting Question...' : 'Post Question'}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">How to ask a good question</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Be specific and provide enough context for others to understand your problem</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Include relevant code snippets, error messages, or examples</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Choose appropriate tags to help others find your question</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Check if your question has already been answered before posting</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Be respectful and follow our community guidelines</span>
          </li>
        </ul>
      </div>
    </div>
  );
}; 