'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { bookmarksService } from '@/services/bookmarks.service';
import { toastService } from '@/services/toast.service';

interface BookmarkButtonProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  className?: string;
}

export default function BookmarkButton({
  entityType,
  entityId,
  entityName,
  className = '',
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBookmark();
  }, [entityType, entityId]);

  const checkBookmark = async () => {
    try {
      const bookmarked = await bookmarksService.isBookmarked(
        entityType,
        entityId,
      );
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await bookmarksService.remove(entityType, entityId);
        setIsBookmarked(false);
        toastService.success('Removed from bookmarks');
      } else {
        await bookmarksService.create(entityType, entityId, entityName);
        setIsBookmarked(true);
        toastService.success('Added to bookmarks');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toastService.error('Error updating bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 ${className}`}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <StarIconSolid className="w-5 h-5" />
      ) : (
        <StarIcon className="w-5 h-5" />
      )}
    </button>
  );
}
