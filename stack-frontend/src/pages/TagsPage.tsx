import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Tag as TagIcon, TrendingUp, Hash, Filter, Grid, List } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Tag } from '../types';
import apiService from '../services/api';

export const TagsPage = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'newest'>('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    filterAndSortTags();
  }, [tags, searchQuery, sortBy, selectedCategory]);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTags();
      setTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setError('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTags = () => {
    let filtered = [...tags];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      // This would be based on actual categories if implemented
      // For now, we'll simulate categories based on tag names
      filtered = filtered.filter(tag => {
        switch (selectedCategory) {
          case 'programming':
            return ['javascript', 'python', 'java', 'react', 'node.js', 'typescript'].includes(tag.name.toLowerCase());
          case 'web':
            return ['html', 'css', 'react', 'vue', 'angular', 'frontend'].includes(tag.name.toLowerCase());
          case 'database':
            return ['mysql', 'postgresql', 'mongodb', 'sql', 'database'].includes(tag.name.toLowerCase());
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          return b.questionCount - a.questionCount;
        case 'newest':
          return a.name.localeCompare(b.name); // Fallback to name since we don't have createdAt
        default:
          return 0;
      }
    });

    setFilteredTags(filtered);
  };

  const getTagColor = (tag: Tag) => {
    if (tag.color) return tag.color;
    
    // Generate consistent color based on tag name
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    ];
    
    const hash = tag.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const categories = [
    { id: 'all', name: 'All Tags', count: tags.length },
    { id: 'programming', name: 'Programming', count: tags.filter(t => ['javascript', 'python', 'java', 'react', 'node.js', 'typescript'].includes(t.name.toLowerCase())).length },
    { id: 'web', name: 'Web Development', count: tags.filter(t => ['html', 'css', 'react', 'vue', 'angular', 'frontend'].includes(t.name.toLowerCase())).length },
    { id: 'database', name: 'Database', count: tags.filter(t => ['mysql', 'postgresql', 'mongodb', 'sql', 'database'].includes(t.name.toLowerCase())).length },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="lg" text="Loading tags..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load tags</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There was an error loading the tags. Please try again.
          </p>
          <button
            onClick={() => fetchTags()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Tags
          <TagIcon className="inline-block w-8 h-8 ml-2 text-primary-500" />
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore topics and find questions by tags
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TagIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {tags.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Total Tags</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {tags.reduce((acc, tag) => acc + tag.questionCount, 0)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Questions Tagged</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Hash className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {Math.round(tags.reduce((acc, tag) => acc + tag.questionCount, 0) / tags.length) || 0}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Avg Questions per Tag</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'popularity' | 'newest')}
                className="input"
              >
                <option value="popularity">Popularity</option>
                <option value="name">Name</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTags.map((tag, index) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.name}`}
              className="card-interactive p-6 animate-fade-in-up hover:scale-105"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getTagColor(tag)}`}>
                  <TagIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {tag.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {tag.description || 'No description available'}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    <span>{tag.questionCount} questions</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTags.map((tag, index) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.name}`}
              className="card-interactive p-6 animate-fade-in-up flex items-center justify-between hover:scale-[1.02]"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${getTagColor(tag)}`}>
                  <TagIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {tag.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tag.description || 'No description available'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {tag.questionCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  questions
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTags.length === 0 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="text-gray-400 dark:text-gray-500 text-8xl mb-6">🏷️</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            No tags found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {searchQuery 
              ? `No tags match your search "${searchQuery}". Try a different search term.`
              : 'No tags available in this category. Check back later!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-primary"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 