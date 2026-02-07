"use client";

import { useState, useEffect } from 'react';
import Drawer from '@/components/Drawer/Drawer';
import { Btn } from '@/components/atoms';
import { internalNotesService, InternalNote } from '@/services/internal-notes.service';
import { TrashIcon } from '@heroicons/react/24/outline';

interface InternalNotesDrawerProps {
  entityType: string;
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
  drawerId?: string;
  onSuccess?: () => void;
}

const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
];

export default function InternalNotesDrawer({
  entityType,
  entityId,
  isOpen,
  onClose,
  drawerId = 'internal-notes-drawer',
  onSuccess,
}: InternalNotesDrawerProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsSaving(true);
      await internalNotesService.create({
        entityType,
        entityId,
        content: newNote,
        color: selectedColor,
      });
      setNewNote('');
      setSelectedColor(COLORS[0]);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      id={drawerId}
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nota"
      onSave={handleAddNote}
      isSaving={isSaving}
      isFormValid={newNote.trim().length > 0}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido
          </label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escribe tu nota..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
