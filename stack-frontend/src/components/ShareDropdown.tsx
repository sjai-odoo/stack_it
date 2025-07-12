import React, { useState } from 'react';
import { 
  Share2, 
  Link, 
  Twitter, 
  Facebook, 
  Copy, 
  X,
  Check
} from 'lucide-react';

interface ShareDropdownProps {
  url: string;
  title: string;
  description?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const ShareDropdown: React.FC<ShareDropdownProps> = ({
  url,
  title,
  description,
  onSuccess,
  onError
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onSuccess?.('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      try {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setCopied(true);
        onSuccess?.('Link copied to clipboard!');
        setTimeout(() => {
          setCopied(false);
          setIsOpen(false);
        }, 2000);
      } catch (fallbackError) {
        onError?.('Failed to copy link. Please copy manually.');
      }
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
        onSuccess?.('Shared successfully!');
        setIsOpen(false);
      } else {
        // Fallback to copy link
        handleCopyLink();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        onError?.('Failed to share. Please try again.');
      }
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || title);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2">
              {/* Native Share (if available) */}
              {'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via...</span>
                </button>
              )}

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-gray-200 dark:border-gray-600" />

              {/* Social Media Options */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                <span>Share on Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Share on Facebook</span>
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Link className="w-4 h-4 text-blue-700" />
                <span>Share on LinkedIn</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 