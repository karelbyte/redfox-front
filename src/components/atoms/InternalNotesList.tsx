"use client";

import { useState, useEffect } from 'react';
import { internalNotesService, InternalNote } from '@/services/internal-notes.service';
import { Btn } from '@/components/atoms';
import { TrashIcon } from '@heroicons/react/24/outline';

interface InternalNotesListProps {
  entityType: string;
  entityId: string;
  onNotesLoaded?: (notes: InternalNote[]) => void;
}

export default function InternalNotesList({
  entityType,
  entityId,
  onNotesLoaded,
}: InternalNotesListProps) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [entityType, entityId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await internalNotesService.findByEntity(entityType, entityId);
      setNotes(response || []);
      onNotesLoaded?.(response || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await internalNotesService.remove(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No hay notas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-4 rounded-lg border-l-4 bg-white"
          style={{ borderLeftColor: note.color || '#3B82F6' }}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-900">{note.content}</p>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {note.user?.name || 'Usuario'} • {formatDate(note.created_at)}
                </p>
              </div>
            </div>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteNote(note.id)}
              leftIcon={<TrashIcon className="w-4 h-4" />}
              title="Eliminar nota"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
