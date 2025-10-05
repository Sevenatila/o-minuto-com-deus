
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { gratitude: string; insight: string; answered: boolean }) => void;
  loading?: boolean;
}

export function JournalModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: JournalModalProps) {
  const [gratitude, setGratitude] = useState('');
  const [insight, setInsight] = useState('');
  const [answered, setAnswered] = useState(false);

  const handleSubmit = () => {
    onSubmit({ gratitude, insight, answered });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      onClick={() => !loading && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Parabéns! 🎉
          </h2>
          <p className="text-muted-foreground">
            Você completou seu devocional. Registre sua experiência:
          </p>
        </div>

        <div className="space-y-5">
          {/* Gratidão */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Pelo que você é grato hoje? (opcional)
            </label>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none resize-none bg-background text-foreground transition-colors"
              rows={3}
              placeholder="Digite aqui..."
            />
          </div>

          {/* Insight */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Que insight você teve? (opcional)
            </label>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none resize-none bg-background text-foreground transition-colors"
              rows={3}
              placeholder="Digite aqui..."
            />
          </div>

          {/* Pedido Respondido */}
          <div>
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary cursor-pointer transition-colors bg-background">
              <input
                type="checkbox"
                checked={answered}
                onChange={(e) => setAnswered(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <span className="text-sm font-medium text-foreground">
                Tive um pedido respondido hoje
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Salvando...
              </span>
            ) : (
              'Salvar e Concluir'
            )}
          </button>

          {/* Skip Button */}
          {!loading && (
            <button
              onClick={onClose}
              className="w-full text-muted-foreground hover:text-foreground py-2 text-sm transition-colors"
            >
              Pular e voltar ao início
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
