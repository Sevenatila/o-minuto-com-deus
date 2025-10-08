
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Languages, BookOpen, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OriginalMeaningData {
  originalWord: string;
  language: string;
  transliteration: string;
  definition: string;
}

interface SignificadoOriginalModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  book?: string;
  chapter?: number;
  verseNumber?: number;
  context?: string;
}

export function SignificadoOriginalModal({
  isOpen,
  onClose,
  word,
  book,
  chapter,
  verseNumber,
  context,
}: SignificadoOriginalModalProps) {
  const [loading, setLoading] = useState(false);
  const [meaningData, setMeaningData] = useState<OriginalMeaningData | null>(null);

  const fetchMeaning = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/significado-original', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          book,
          chapter,
          verseNumber,
          context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMeaningData({
          originalWord: data.originalWord,
          language: data.language,
          transliteration: data.transliteration,
          definition: data.definition,
        });
      } else {
        throw new Error('Erro ao buscar significado');
      }
    } catch (error) {
      console.error('Erro ao buscar significado original:', error);
      toast.error('Erro ao buscar significado original');
    } finally {
      setLoading(false);
    }
  };

  // Buscar significado quando modal abre
  useEffect(() => {
    if (isOpen && !meaningData && !loading) {
      fetchMeaning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Languages className="h-6 w-6 text-blue-600" />
              Significado Original
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Analisando o significado original...</p>
          </div>
        ) : meaningData ? (
          <div className="space-y-6">
            {/* Palavra */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Palavra em Português:</p>
              <p className="text-3xl font-bold text-gray-900 mb-4">{word}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {meaningData.language === 'grego' ? '🏛️ Grego Koiné:' : '✡️ Hebraico Bíblico:'}
                  </p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {meaningData.originalWord}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Transliteração:</p>
                  <p className="text-xl font-medium text-gray-800">
                    {meaningData.transliteration}
                  </p>
                </div>
              </div>
            </div>

            {/* Contexto Bíblico */}
            {(book || context) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Contexto Bíblico</h3>
                </div>
                {book && (
                  <p className="text-gray-700">
                    📖 {book} {chapter && `${chapter}`}{verseNumber && `:${verseNumber}`}
                  </p>
                )}
                {context && (
                  <p className="text-gray-600 mt-2 italic">&quot;{context}&quot;</p>
                )}
              </div>
            )}

            {/* Definição */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Significado e Uso Bíblico:
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {meaningData.definition}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum significado encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
