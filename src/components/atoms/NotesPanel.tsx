'use client';

import { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { internalNotesService, InternalNote } from '@/services/internal-notes.service';
import { toastService } from '@/services/toast.service';
import { Input, Btn } from '@/components/atoms';

interface NotesPanelProps {
  entityType: string;
  entityId: string;
  className?: string;
}

const COLORS = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-100', border: 'border-blue-300' },
  { value: 'green', label: 'Green', bg: 'bg-green-100', border: 'border-green-300' },
  { value: 'red', label: 'Red', bg: 'bg-red-100', border: 'border-red-300' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-100', border: 'border-purple-300' },
];

export default function NotesPanel({
  entityType,
  entityId,
  className = '',
}: NotesPanelProps) {
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [entityType, entityId]);

  const loadNotes = async () => {
    try {
      const data = await internalNotesService.findByEntity(entityType, entityId);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsLoading(true);
    try {
      await internalNotesService.create({
        entityType,
        entityId,
        content: newNote,
        color: selectedColor,
      });
      setNewNote('');
      await loadNotes();
      toastService.success('Note added');
    } catch (error) {
      console.error('Error adding note:', error);
      toastService.error('Error adding note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await internalNotesService.remove(id);
      await loadNotes();
      toastService.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toastService.error('Error deleting note');
    }
  };

  const getColorClass = (color?: string) => {
    const colorObj = COLORS.find(c => c.value === color);
    return colorObj ? colorObj.bg : 'bg-yellow-100';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Internal Notes
        </label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-6 h-6 rounded-full ${color.bg} border-2 ${
                  selectedColor === color.value
                    ? color.border
                    : 'border-transparent'
                }`}
                title={color.label}
              />
            ))}
          </div>
          <Btn
            size="sm"
            onClick={handleAddNote}
            disabled={isLoading || !newNote.trim()}
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add
          </Btn>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.map(note => (
          <div
            key={note.id}
            className={`p-3 rounded-lg border ${getColorClass(note.color)} border-opacity-50`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <p className="text-sm text-gray-800">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {note.user?.name} • {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
