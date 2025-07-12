import { useState, useEffect } from 'react';
import Select from 'react-select';
import type { Tag } from '../types';
import apiService from '../services/api';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

interface TagOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

export const TagSelector = ({ 
  selectedTags, 
  onChange, 
  placeholder = "Select tags...",
  className = "" 
}: TagSelectorProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getTags();
        setTags(response.data);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const tagOptions: TagOption[] = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
    description: tag.description,
  }));

  const selectedOptions = tagOptions.filter(option => 
    selectedTags.includes(option.value)
  );

  const handleChange = (selected: readonly TagOption[]) => {
    const tagIds = selected.map(option => option.value);
    onChange(tagIds);
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#3b82f6',
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
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
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#1e40af',
      fontWeight: '500',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#dbeafe',
        color: '#1e3a8a',
      },
    }),
  };

  const formatOptionLabel = (option: TagOption) => (
    <div className="flex items-center">
      {option.color && (
        <div 
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: option.color }}
        />
      )}
      <div>
        <div className="font-medium">{option.label}</div>
        {option.description && (
          <div className="text-sm text-gray-500">{option.description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Select
        isMulti
        options={tagOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isLoading={isLoading}
        styles={customStyles}
        formatOptionLabel={formatOptionLabel}
        noOptionsMessage={() => "No tags found"}
        loadingMessage={() => "Loading tags..."}
        className="text-sm"
      />
    </div>
  );
}; 