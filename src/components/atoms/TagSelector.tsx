'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { tagsService, Tag } from '@/services/tags.service';
import { toastService } from '@/services/toast.service';
import { Input, Btn } from '@/components/atoms';

interface TagSelectorProps {
  entityType: string;
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  className?: string;
}

const COLORS = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
];

export default function TagSelector({
  entityType,
  selectedTags = [],
  onTagsChange,
  className = '',
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadTags();
  }, [entityType]);

  const loadTags = async () => {
    try {
      const data = await tagsService.findByUser(entityType);
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      const newTag = await tagsService.create(
        newTagName,
        entityType,
        selectedColor,
      );
      setTags([...tags, newTag]);
      setNewTagName('');
      toastService.success('Tag created');
    } catch (error) {
      console.error('Error creating tag:', error);
      toastService.error('Error creating tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    const newSelected = isSelected
      ? selectedTags.filter(t => t.id !== tag.id)
      : [...selectedTags, tag];
    onTagsChange?.(newSelected);
  };

  const handleRemoveTag = (tagId: string) => {
    const newSelected = selectedTags.filter(t => t.id !== tagId);
    onTagsChange?.(newSelected);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Tags</label>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <div
            key={tag.id}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${tag.color || COLORS[0]}`}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:opacity-70"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors"
        >
          + Add tag
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 space-y-2">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <div className="flex gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full ${color} border-2 ${
                      selectedColor === color
                        ? 'border-gray-800'
                        : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              <Btn
                size="sm"
                onClick={handleCreateTag}
                disabled={isLoading || !newTagName.trim()}
              >
                Create
              </Btn>
            </div>

            <div className="border-t border-gray-200 pt-2 max-h-48 overflow-y-auto">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleSelectTag(tag)}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedTags.some(t => t.id === tag.id)
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${tag.color || COLORS[0]}`} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
