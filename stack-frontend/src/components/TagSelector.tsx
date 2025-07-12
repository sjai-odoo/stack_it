import { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import type { Tag } from '../types';
import apiService from '../services/api';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

interface TagOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
  isNew?: boolean;
}

export const TagSelector = ({ 
  selectedTags, 
  onChange, 
  placeholder = "Select or create tags...",
  className = "",
  maxTags = 10 // Default max, but can be overridden
}: TagSelectorProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getTags();
        // Ensure we have valid tags with proper structure
        const validTags = response.data.filter(tag => 
          tag && tag.id && tag.name && typeof tag.id === 'string'
        );
        setTags(validTags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        setError('Failed to load tags');
        // Fallback to common programming tags if API fails
        setTags([
          { id: 'javascript', name: 'JavaScript', description: 'Programming language', color: '#f7df1e', questionCount: 0 },
          { id: 'typescript', name: 'TypeScript', description: 'Typed JavaScript', color: '#3178c6', questionCount: 0 },
          { id: 'react', name: 'React', description: 'JavaScript library', color: '#61dafb', questionCount: 0 },
          { id: 'nodejs', name: 'Node.js', description: 'JavaScript runtime', color: '#339933', questionCount: 0 },
          { id: 'python', name: 'Python', description: 'Programming language', color: '#3776ab', questionCount: 0 },
          { id: 'java', name: 'Java', description: 'Programming language', color: '#007396', questionCount: 0 },
          { id: 'html', name: 'HTML', description: 'Markup language', color: '#e34f26', questionCount: 0 },
          { id: 'css', name: 'CSS', description: 'Style sheet language', color: '#1572b6', questionCount: 0 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Create options from database tags
  const databaseTagOptions: TagOption[] = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
    description: tag.description,
    isNew: false,
  }));

  // Create options from selected tags (including custom ones)
  const selectedTagOptions: TagOption[] = selectedTags.map(tagId => {
    // Check if it's a database tag first
    const dbTag = databaseTagOptions.find(option => option.value === tagId);
    if (dbTag) {
      return dbTag;
    }
    
    // If not found in database, it's a custom tag
    return {
      value: tagId,
      label: tagId,
      isNew: true,
    };
  });

  const handleChange = (selected: readonly TagOption[] | null) => {
    // Handle null case (when all selections are cleared)
    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    // Extract tag IDs from selected options
    const tagIds = selected.map(option => option.value);
    
    // Apply max tags limit if specified
    const limitedTagIds = maxTags ? tagIds.slice(0, maxTags) : tagIds;
    
    onChange(limitedTagIds);
  };

  const handleCreateOption = (inputValue: string) => {
    const newTag = inputValue.trim().toLowerCase();
    
    // Validate the new tag
    if (!newTag) return;
    if (newTag.length > 50) {
      alert('Tag name cannot exceed 50 characters');
      return;
    }
    if (!/^[a-z0-9\-+#.]+$/.test(newTag)) {
      alert('Tag name can only contain lowercase letters, numbers, hyphens, plus signs, dots, and hash symbols');
      return;
    }
    
    // Check if tag already exists
    const existingTag = selectedTags.find(tag => tag.toLowerCase() === newTag);
    if (existingTag) {
      alert('This tag is already selected');
      return;
    }
    
    // Add the new tag to selected tags
    const newTagIds = [...selectedTags, newTag];
    const limitedTagIds = maxTags ? newTagIds.slice(0, maxTags) : newTagIds;
    onChange(limitedTagIds);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      backgroundColor: state.isFocused ? '#ffffff' : provided.backgroundColor,
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#3b82f6' 
        : state.isFocused 
        ? '#eff6ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe',
      },
    }),
    multiValue: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.data.isNew ? '#fef3c7' : '#eff6ff',
      border: state.data.isNew ? '1px solid #fcd34d' : '1px solid #bfdbfe',
      borderRadius: '4px',
    }),
    multiValueLabel: (provided: any, state: any) => ({
      ...provided,
      color: state.data.isNew ? '#92400e' : '#1e40af',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any, state: any) => ({
      ...provided,
      color: state.data.isNew ? '#92400e' : '#1e40af',
      '&:hover': {
        backgroundColor: state.data.isNew ? '#fde68a' : '#dbeafe',
        color: state.data.isNew ? '#78350f' : '#1e3a8a',
      },
    }),
  };

  const formatOptionLabel = (option: TagOption) => (
    <div className="flex items-center py-1">
      {option.color && (
        <div 
          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
          style={{ backgroundColor: option.color }}
        />
      )}
      <div className="flex-1">
        <div className="font-medium text-sm flex items-center">
          {option.label}
          {option.isNew && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              New
            </span>
          )}
        </div>
        {option.description && (
          <div className="text-xs text-gray-500 truncate">{option.description}</div>
        )}
      </div>
    </div>
  );

  const formatCreateLabel = (inputValue: string) => (
    <div className="flex items-center">
      <span className="text-gray-600">Create tag: </span>
      <span className="font-medium text-blue-600 ml-1">"{inputValue}"</span>
    </div>
  );

  if (error) {
    return (
      <div className={`${className} text-red-600 text-sm`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <CreatableSelect
        isMulti
        options={databaseTagOptions}
        value={selectedTagOptions}
        onChange={handleChange}
        onCreateOption={handleCreateOption}
        placeholder={placeholder}
        isLoading={isLoading}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        formatCreateLabel={formatCreateLabel}
        noOptionsMessage={() => "No tags found - type to create a new one"}
        loadingMessage={() => "Loading tags..."}
        className="text-sm"
        isSearchable={true}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        blurInputOnSelect={false}
        isClearable={false}
        maxMenuHeight={200}
        createOptionPosition="first"
      />
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>
          {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
          {maxTags && ` (max ${maxTags})`}
        </span>
        <span className="text-gray-400">
          Type to create custom tags • Use lowercase letters, numbers, hyphens, +, #, .
        </span>
      </div>
    </div>
  );
}; 