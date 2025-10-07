
'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteText: string) => void;
  initialNote?: string;
  verseNumber: number;
}

export function NoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  verseNumber,
}: NoteModalProps) {
  const [noteText, setNoteText] = useState(initialNote ?? '');

  useEffect(() => {
    setNoteText(initialNote ?? '');
  }, [initialNote]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (noteText?.trim()) {
      onSave(noteText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Nota - Versículo {verseNumber}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e?.target?.value ?? '')}
            placeholder="Escreva sua nota aqui..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
