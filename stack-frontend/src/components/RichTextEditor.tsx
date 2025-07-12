import React, { useRef, useCallback, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Link, 
  Image,
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const EMOJI_LIST = [
  '😀', '😂', '😍', '🤔', '😮', '😢', '😡', '👍', '👎', '❤️',
  '🎉', '🔥', '💯', '✨', '⚡', '🚀', '💡', '🎯', '🎪', '🏆',
  '📝', '💻', '🔧', '🐛', '✅', '❌', '⚠️', '📚', '🎓', '💪'
];

export const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "Write your answer here...", 
  className = '',
  onImageUpload
}: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkSelection, setLinkSelection] = useState({ start: 0, end: 0 });
  const [linkUrlError, setLinkUrlError] = useState('');

  const insertFormatting = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const formatBold = () => insertFormatting('**', '**');
  const formatItalic = () => insertFormatting('*', '*');
  const formatUnderline = () => insertFormatting('<u>', '</u>');
  const formatStrikethrough = () => insertFormatting('~~', '~~');
  const formatCode = () => insertFormatting('`', '`');
  const formatCodeBlock = () => insertFormatting('\n```\n', '\n```\n');
  const formatQuote = () => insertFormatting('\n> ', '');
  const formatH1 = () => insertFormatting('\n# ', '');
  const formatH2 = () => insertFormatting('\n## ', '');
  const formatH3 = () => insertFormatting('\n### ', '');
  const formatUnorderedList = () => insertFormatting('\n- ', '');
  const formatOrderedList = () => insertFormatting('\n1. ', '');
  const formatLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    setLinkSelection({ start, end });
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkUrlError(''); // Clear any previous errors
    setShowEmojiPicker(false); // Close emoji picker if open
    setShowLinkModal(true);
  };
  const formatImage = () => insertFormatting('![alt text](', ')');
  const formatAlignLeft = () => insertFormatting('\n<div style="text-align: left;">\n', '\n</div>\n');
  const formatAlignCenter = () => insertFormatting('\n<div style="text-align: center;">\n', '\n</div>\n');
  const formatAlignRight = () => insertFormatting('\n<div style="text-align: right;">\n', '\n</div>\n');

  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = content.substring(0, start) + emoji + content.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    setShowEmojiPicker(false);
  }, [content, onChange]);

  const handleLinkSubmit = useCallback(() => {
    if (!linkUrl.trim()) {
      setLinkUrlError('Please enter a URL');
      return;
    }
    
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Clear any previous errors
    setLinkUrlError('');
    
    // Validate URL format
    let validUrl = linkUrl.trim();
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailPattern.test(validUrl)) {
      validUrl = 'mailto:' + validUrl;
    } else if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://') && !validUrl.startsWith('mailto:')) {
      if (urlPattern.test('https://' + validUrl)) {
        validUrl = 'https://' + validUrl;
      } else {
        setLinkUrlError('Please enter a valid URL (e.g., example.com or https://example.com)');
        return;
      }
    }
    
    const linkMarkdown = `[${linkText || linkUrl}](${validUrl})`;
    const newText = content.substring(0, linkSelection.start) + linkMarkdown + content.substring(linkSelection.end);
    onChange(newText);
    
    // Close modal and reset
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    setLinkUrlError('');
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = linkSelection.start + linkMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange, linkText, linkUrl, linkSelection]);

  const handleLinkCancel = useCallback(() => {
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    setLinkUrlError('');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      if (onImageUpload) {
        const imageUrl = await onImageUpload(file);
        insertFormatting(`![${file.name}](${imageUrl})`);
      } else {
        // Fallback: create a data URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          insertFormatting(`![${file.name}](${dataUrl})`);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [insertFormatting, onImageUpload]);

  const toolbarButtons = [
    { icon: Bold, onClick: formatBold, title: 'Bold (Ctrl+B)', shortcut: 'Ctrl+B' },
    { icon: Italic, onClick: formatItalic, title: 'Italic (Ctrl+I)', shortcut: 'Ctrl+I' },
    { icon: Underline, onClick: formatUnderline, title: 'Underline', shortcut: '' },
    { icon: Strikethrough, onClick: formatStrikethrough, title: 'Strikethrough', shortcut: '' },
    { icon: Code, onClick: formatCode, title: 'Inline Code', shortcut: '' },
    { icon: Quote, onClick: formatQuote, title: 'Quote', shortcut: '' },
    { icon: Heading1, onClick: formatH1, title: 'Heading 1', shortcut: '' },
    { icon: Heading2, onClick: formatH2, title: 'Heading 2', shortcut: '' },
    { icon: Heading3, onClick: formatH3, title: 'Heading 3', shortcut: '' },
    { icon: List, onClick: formatUnorderedList, title: 'Bullet List', shortcut: '' },
    { icon: ListOrdered, onClick: formatOrderedList, title: 'Numbered List', shortcut: '' },
    { icon: Link, onClick: formatLink, title: 'Insert Link (Ctrl+K)', shortcut: 'Ctrl+K' },
  ];

  const alignmentButtons = [
    { icon: AlignLeft, onClick: formatAlignLeft, title: 'Align Left' },
    { icon: AlignCenter, onClick: formatAlignCenter, title: 'Align Center' },
    { icon: AlignRight, onClick: formatAlignRight, title: 'Align Right' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'k':
          e.preventDefault();
          formatLink();
          break;
        case 'u':
          e.preventDefault();
          formatUnderline();
          break;
      }
    }
  };

  return (
    <div className={`relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        {/* Formatting buttons */}
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.onClick}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            title={button.title}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Alignment buttons */}
        {alignmentButtons.map((button, index) => (
          <button
            key={`align-${index}`}
            type="button"
            onClick={button.onClick}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            title={button.title}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 disabled:opacity-50"
          title="Upload Image"
        >
          {isUploading ? <Upload className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        </button>
        
        {/* Emoji picker button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              if (!showEmojiPicker) {
                setShowLinkModal(false); // Close link modal if open
              }
            }}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 p-3">
              <div className="grid grid-cols-6 gap-1 w-48">
                {EMOJI_LIST.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-lg transition-colors duration-200"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Code block button */}
        <button
          type="button"
          onClick={formatCodeBlock}
          className="px-3 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          title="Code Block"
        >
          {'{}'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[300px] p-4 resize-y outline-none
                   bg-white dark:bg-gray-900 
                   text-gray-900 dark:text-gray-100 
                   placeholder-gray-500 dark:placeholder-gray-400
                   transition-colors duration-200"
        rows={12}
      />

      {/* Helper Text */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>**bold**</span>
          <span>*italic*</span>
          <span>~~strikethrough~~</span>
          <span>`code`</span>
          <span>Ctrl+K for links</span>
          <span>![image](url)</span>
          <span># heading</span>
          <span>- list</span>
          <span>&gt; quote</span>
          <span>😀 emoji</span>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleLinkCancel();
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Insert Link
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-colors duration-200"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (linkUrlError) setLinkUrlError(''); // Clear error when typing
                  }}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 border rounded-md
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-colors duration-200 ${
                             linkUrlError 
                               ? 'border-red-500 dark:border-red-400' 
                               : 'border-gray-300 dark:border-gray-600'
                           }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLinkSubmit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleLinkCancel();
                    }
                  }}
                />
                {linkUrlError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {linkUrlError}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleLinkCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkSubmit}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white 
                         bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                         rounded-md transition-colors duration-200"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 