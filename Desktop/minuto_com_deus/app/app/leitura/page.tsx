
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { NoteModal } from '@/components/note-modal';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Highlighter,
  FileText,
} from 'lucide-react';
import { getBooks, getChapter, BibleBook, BibleChapter } from '@/lib/bible-api';

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo', value: 'yellow', bg: 'highlight-yellow', hover: 'hover-highlight-yellow' },
  { name: 'Verde', value: 'green', bg: 'highlight-green', hover: 'hover-highlight-green' },
  { name: 'Azul', value: 'blue', bg: 'highlight-blue', hover: 'hover-highlight-blue' },
  { name: 'Rosa', value: 'pink', bg: 'highlight-pink', hover: 'hover-highlight-pink' },
];

interface Highlight {
  id: string;
  verseNumber: number;
  color: string;
  highlightedText: string;
}

interface Note {
  id: string;
  verseNumber: number;
  noteText: string;
}

interface Favorite {
  id: string;
  verseNumber: number;
}

function LeituraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};

  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await getBooks();
      setBooks(booksData ?? []);

      const bookParam = searchParams?.get('book');
      const chapterParam = searchParams?.get('chapter');

      if (bookParam && chapterParam) {
        setSelectedBook(bookParam);
        setSelectedChapter(parseInt(chapterParam));
      } else if (booksData?.length > 0) {
        setSelectedBook(booksData[0]?.abbrev?.pt ?? 'gn');
        setSelectedChapter(1);
      }
    };

    if (status === 'authenticated') {
      loadBooks();
    }
  }, [status, searchParams]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadChapterData();
    }
  }, [selectedBook, selectedChapter]);

  const loadChapterData = async () => {
    if (!selectedBook) return;

    setLoading(true);
    try {
      const data = await getChapter(selectedBook, selectedChapter);
      setChapterData(data);

      await Promise.all([
        recordMetric(),
        loadHighlights(),
        loadNotes(),
        loadFavorites(),
      ]);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordMetric = async () => {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: selectedBook,
          chapter: selectedChapter,
        }),
      });
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const res = await fetch(
        `/api/highlights?book=${selectedBook}&chapter=${selectedChapter}`
      );
      if (res?.ok) {
        const data = await res.json();
        setHighlights(data ?? []);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await fetch(
        `/api/notes?book=${selectedBook}&chapter=${selectedChapter}`
      );
      if (res?.ok) {
        const data = await res.json();
        setNotes(data ?? []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await fetch(
        `/api/favorites?book=${selectedBook}&chapter=${selectedChapter}`
      );
      if (res?.ok) {
        const data = await res.json();
        setFavorites(data ?? []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleVerseClick = (verseNumber: number) => {
    setSelectedVerse(verseNumber);
    setShowColorPicker(true);
  };

  const handleHighlight = async (color: string) => {
    if (!selectedVerse) return;

    const verse = chapterData?.verses?.find((v) => v?.number === selectedVerse);
    if (!verse) return;

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: selectedBook,
          chapter: selectedChapter,
          verseNumber: selectedVerse,
          highlightedText: verse.text,
          color,
        }),
      });

      if (res?.ok) {
        await loadHighlights();
      }
    } catch (error) {
      console.error('Error adding highlight:', error);
    }

    setShowColorPicker(false);
    setSelectedVerse(null);
  };

  const handleRemoveHighlight = async (highlightId: string) => {
    try {
      const res = await fetch(`/api/highlights?id=${highlightId}`, {
        method: 'DELETE',
      });

      if (res?.ok) {
        await loadHighlights();
      }
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  };

  const handleToggleFavorite = async (verseNumber: number) => {
    const existingFav = favorites?.find((f) => f?.verseNumber === verseNumber);

    try {
      if (existingFav) {
        const res = await fetch(`/api/favorites?id=${existingFav.id}`, {
          method: 'DELETE',
        });
        if (res?.ok) await loadFavorites();
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book: selectedBook,
            chapter: selectedChapter,
            verseNumber,
          }),
        });
        if (res?.ok) await loadFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenNote = (verseNumber: number) => {
    const existingNote = notes?.find((n) => n?.verseNumber === verseNumber);
    setSelectedVerse(verseNumber);
    setEditingNote(existingNote ?? null);
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (noteText: string) => {
    if (!selectedVerse) return;

    try {
      if (editingNote) {
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingNote.id,
            noteText,
          }),
        });
        if (res?.ok) await loadNotes();
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book: selectedBook,
            chapter: selectedChapter,
            verseNumber: selectedVerse,
            noteText,
          }),
        });
        if (res?.ok) await loadNotes();
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }

    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE',
      });
      if (res?.ok) await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    const currentBook = books?.find((b) => b?.abbrev?.pt === selectedBook);
    if (!currentBook) return;

    if (direction === 'next') {
      if (selectedChapter < (currentBook?.chapters ?? 1)) {
        setSelectedChapter(selectedChapter + 1);
      } else {
        const currentIndex = books?.findIndex((b) => b?.abbrev?.pt === selectedBook);
        if (currentIndex !== undefined && currentIndex < (books?.length ?? 0) - 1) {
          const nextBook = books[currentIndex + 1];
          setSelectedBook(nextBook?.abbrev?.pt ?? '');
          setSelectedChapter(1);
        }
      }
    } else {
      if (selectedChapter > 1) {
        setSelectedChapter(selectedChapter - 1);
      } else {
        const currentIndex = books?.findIndex((b) => b?.abbrev?.pt === selectedBook);
        if (currentIndex !== undefined && currentIndex > 0) {
          const prevBook = books[currentIndex - 1];
          setSelectedBook(prevBook?.abbrev?.pt ?? '');
          setSelectedChapter(prevBook?.chapters ?? 1);
        }
      }
    }
  };

  const getVerseHighlight = (verseNumber: number) => {
    return highlights?.find((h) => h?.verseNumber === verseNumber);
  };

  const getVerseNote = (verseNumber: number) => {
    return notes?.find((n) => n?.verseNumber === verseNumber);
  };

  const isVerseFavorited = (verseNumber: number) => {
    return favorites?.some((f) => f?.verseNumber === verseNumber);
  };

  const getHighlightBgClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      yellow: 'highlight-yellow',
      green: 'highlight-green',
      blue: 'highlight-blue',
      pink: 'highlight-pink',
    };
    return colorMap[color] ?? 'bg-muted';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Selectors */}
        <div className="bg-card rounded-xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Livro
              </label>
              <select
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e?.target?.value ?? '');
                  setSelectedChapter(1);
                }}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              >
                {books?.map((book) => (
                  <option key={book?.abbrev?.pt} value={book?.abbrev?.pt ?? ''}>
                    {book?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Capítulo
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(parseInt(e?.target?.value ?? '1'))}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              >
                {Array.from(
                  { length: books?.find((b) => b?.abbrev?.pt === selectedBook)?.chapters ?? 1 },
                  (_, i) => i + 1
                )?.map((num) => (
                  <option key={num} value={num}>
                    Capítulo {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => navigateChapter('prev')}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>

            <span className="text-sm font-medium text-muted-foreground">
              {chapterData?.book?.name} {selectedChapter}
            </span>

            <button
              onClick={() => navigateChapter('next')}
              className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Próximo
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chapter Content */}
        {chapterData && (
          <div className="bg-card rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {chapterData?.book?.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Capítulo {chapterData?.chapter?.number}
              </p>
            </div>

            <div className="space-y-4">
              {chapterData?.verses?.map((verse) => {
                const highlight = getVerseHighlight(verse?.number ?? 0);
                const note = getVerseNote(verse?.number ?? 0);
                const isFavorited = isVerseFavorited(verse?.number ?? 0);

                return (
                  <div
                    key={verse?.number}
                    className={`p-4 rounded-lg transition-all ${
                      highlight ? getHighlightBgClass(highlight.color) : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-sm font-bold text-primary min-w-[2rem]">
                        {verse?.number}
                      </span>
                      <div className="flex-1">
                        <p
                          className="text-foreground leading-relaxed cursor-pointer select-text"
                          onClick={() => handleVerseClick(verse?.number ?? 0)}
                        >
                          {verse?.text}
                        </p>

                        {/* Verse Actions */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleVerseClick(verse?.number ?? 0)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Highlighter className="h-4 w-4" />
                            {highlight ? 'Alterar' : 'Destacar'}
                          </button>

                          <button
                            onClick={() => handleOpenNote(verse?.number ?? 0)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-purple-500 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                            {note ? 'Ver Nota' : 'Anotar'}
                          </button>

                          <button
                            onClick={() => handleToggleFavorite(verse?.number ?? 0)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              isFavorited
                                ? 'text-warning'
                                : 'text-muted-foreground hover:text-warning'
                            }`}
                          >
                            <Star
                              className={`h-4 w-4 ${isFavorited ? 'fill-warning' : ''}`}
                            />
                            {isFavorited ? 'Favoritado' : 'Favoritar'}
                          </button>
                        </div>

                        {/* Show Note */}
                        {note && (
                          <div className="mt-3 p-3 info-box-purple">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-foreground">{note.noteText}</p>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-xs text-destructive hover:text-destructive/80 whitespace-nowrap"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Escolha uma cor
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {HIGHLIGHT_COLORS?.map((color) => (
                  <button
                    key={color?.value}
                    onClick={() => handleHighlight(color?.value ?? '')}
                    className={`${color?.bg} ${color?.hover} p-4 rounded-lg font-medium transition-colors text-foreground`}
                  >
                    {color?.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowColorPicker(false);
                  setSelectedVerse(null);
                }}
                className="w-full mt-4 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Note Modal */}
        <NoteModal
          isOpen={noteModalOpen}
          onClose={() => {
            setNoteModalOpen(false);
            setEditingNote(null);
            setSelectedVerse(null);
          }}
          onSave={handleSaveNote}
          initialNote={editingNote?.noteText}
          verseNumber={selectedVerse ?? 0}
        />
      </main>
    </div>
  );
}

export default function LeituraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <LeituraContent />
    </Suspense>
  );
}
