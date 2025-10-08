'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, Moon, CheckCircle } from 'lucide-react';
import { BreathingAnimation } from '@/components/devotional/breathing-animation';
import { StepIndicator } from '@/components/devotional/step-indicator';
import { AudioPlayer } from '@/components/devotional/audio-player';
import { JournalModal } from '@/components/devotional/journal-modal';
import {
  StepName,
  STEP_DURATIONS,
  STEP_TEXTS,
  trackDevotionalEvent,
  getDailyActionSuggestion,
} from '@/lib/devotional-utils';

interface Devo {
  id: string;
  day: number;
  title: string;
  verseRef: string;
  verseText: string;
  contextLine: string;
  audioUrlPalavra: string | null;
  audioUrlOracao: string | null;
}

interface Preferences {
  ritualMinutes: 5 | 10 | 15;
  hapticsEnabled: boolean;
  voiceGuidance: boolean;
}

export default function DevocionalGuiadoPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};

  // Estado do devocional
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [devo, setDevo] = useState<Devo | null>(null);
  const [currentStep, setCurrentStep] = useState<StepName>('respira');
  const [completedSteps, setCompletedSteps] = useState<StepName[]>([]);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [isEyesClosed, setIsEyesClosed] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journalLoading, setJournalLoading] = useState(false);
  const [hadFallback, setHadFallback] = useState(false);
  const [actionText, setActionText] = useState('');

  const sessionStartTime = useRef(Date.now());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  // Carregar preferências e conteúdo
  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  const loadData = async () => {
    try {
      const [prefsRes, devoRes] = await Promise.all([
        fetch('/api/devotional/preferences'),
        fetch('/api/devotional/content'),
      ]);

      if (prefsRes.ok) {
        const prefsData = await prefsRes.json();
        setPreferences(prefsData);
      }

      if (devoRes.ok) {
        const devoData = await devoRes.json();
        setDevo(devoData);
      }
    } catch (error) {
      console.error('Error loading devotional data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer de fallback para cada etapa
  useEffect(() => {
    if (!preferences || loading) return;

    const stepDuration = STEP_DURATIONS[preferences.ritualMinutes][currentStep];
    const fallbackTimeout = setTimeout(() => {
      handleStepComplete();
      setHadFallback(true);
      trackDevotionalEvent('fallback_triggered', { step: currentStep });
    }, stepDuration * 1000);

    return () => clearTimeout(fallbackTimeout);
  }, [currentStep, preferences, loading]);

  const handleStepComplete = () => {
    setCompletedSteps((prev) => [...prev, currentStep]);

    const steps: StepName[] = ['respira', 'palavra', 'oracao', 'acao'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      // Próxima etapa
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      setStepStartTime(Date.now());
      trackDevotionalEvent('step_finish', {
        step: currentStep,
        via: 'timer',
      });
      trackDevotionalEvent('step_start', { step: nextStep });
    } else {
      // Finalizar devocional
      trackDevotionalEvent('devotional_complete', {
        total_duration: Math.floor((Date.now() - sessionStartTime.current) / 1000),
        steps_done: completedSteps.length + 1,
      });
      handleCompleteDevotional();
    }
  };

  const handleCompleteDevotional = async () => {
    if (!devo) return;

    const durationSec = Math.floor((Date.now() - sessionStartTime.current) / 1000);

    try {
      await fetch('/api/devotional/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devoDay: devo.day,
          durationSec,
          completedSteps: [...completedSteps, currentStep],
          eyesClosedMode: isEyesClosed,
          hadFallback,
        }),
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }

    setShowJournal(true);
  };

  const handleJournalSubmit = async (data: {
    gratitude: string;
    insight: string;
    answered: boolean;
  }) => {
    setJournalLoading(true);
    try {
      await fetch('/api/devotional/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      trackDevotionalEvent('journal_saved', {
        has_gratitude: !!data.gratitude,
        has_insight: !!data.insight,
        answered: data.answered,
      });

      router.push('/home?devotional=completed');
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Erro ao salvar diário. Tente novamente.');
    } finally {
      setJournalLoading(false);
    }
  };

  // Renderizar conteúdo por etapa
  const renderStepContent = () => {
    if (!preferences) return null;

    switch (currentStep) {
      case 'respira':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {STEP_TEXTS.respira.title}
              </h2>
              <p className="text-muted-foreground">
                {STEP_TEXTS.respira.instruction}
              </p>
            </div>
            <BreathingAnimation
              isActive={true}
              hapticsEnabled={preferences.hapticsEnabled}
              totalDuration={STEP_DURATIONS[preferences.ritualMinutes].respira}
            />
          </div>
        );

      case 'palavra':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {STEP_TEXTS.palavra.title}
              </h2>
              <p className="text-lg text-primary font-semibold mb-4">
                Hoje: {devo?.verseRef || ''}
              </p>
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border-l-4 border-primary">
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-4">
                "{devo?.verseText || ''}"
              </p>
              <p className="text-sm text-muted-foreground italic">
                {devo?.contextLine || ''}
              </p>
            </div>

            {devo?.audioUrlPalavra && (
              <AudioPlayer
                audioUrl={devo.audioUrlPalavra}
                onEnded={handleStepComplete}
                autoPlay={false}
              />
            )}

            {/* Botão para avançar manualmente */}
            <button
              onClick={handleStepComplete}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Próximo: Oração
            </button>
          </div>
        );

      case 'oracao':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {STEP_TEXTS.oracao.title}
              </h2>
              <p className="text-muted-foreground">
                {STEP_TEXTS.oracao.instruction}
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl space-y-3">
              <p className="text-sm font-semibold text-foreground mb-2">
                Sugestões:
              </p>
              {STEP_TEXTS.oracao.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-foreground">{suggestion}</p>
                </div>
              ))}
            </div>

            {devo?.audioUrlOracao && (
              <AudioPlayer
                audioUrl={devo.audioUrlOracao}
                onEnded={handleStepComplete}
                autoPlay={false}
              />
            )}

            {/* Botão para avançar manualmente */}
            <button
              onClick={handleStepComplete}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Próximo: Ação
            </button>
          </div>
        );

      case 'acao':
        const dailySuggestion = devo ? getDailyActionSuggestion(devo.day) : '';
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {STEP_TEXTS.acao.title}
              </h2>
              <p className="text-muted-foreground">
                {STEP_TEXTS.acao.instruction}
              </p>
            </div>

            {/* Sugestão do dia */}
            {dailySuggestion && (
              <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-2xl border-l-4 border-primary">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  💡 Sugestão do Dia
                </p>
                <p className="text-base text-foreground font-medium">
                  {dailySuggestion}
                </p>
              </div>
            )}

            <div className="bg-card p-6 rounded-2xl">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Meu passo de hoje:
              </label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder={dailySuggestion || "Ex: Orar 5 minutos pela manhã..."}
                className="w-full p-4 rounded-xl border-2 border-border focus:border-primary focus:outline-none resize-none bg-background text-foreground min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use a sugestão acima ou crie seu próprio compromisso para hoje.
              </p>
            </div>

            <button
              onClick={handleStepComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Concluir Devocional
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isEyesClosed ? 'bg-black' : 'bg-background'} transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => router.push('/home')}
            className={`flex items-center gap-2 transition-colors ${
              isEyesClosed
                ? 'text-white/70 hover:text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEyesClosed(!isEyesClosed)}
              className={`p-2 rounded-full transition-colors ${
                isEyesClosed
                  ? 'bg-white/10 text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Modo Olhos Fechados"
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Título do Plano */}
        {!isEyesClosed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {devo?.title || 'Devocional Guiado'}
            </h1>
            <p className="text-muted-foreground">
              Dia {devo?.day || 1} • {preferences?.ritualMinutes || 10} minutos
            </p>
          </motion.div>
        )}

        {/* Step Indicator */}
        {!isEyesClosed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <StepIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </motion.div>
        )}

        {/* Conteúdo da Etapa */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`${
            isEyesClosed ? 'bg-black' : 'bg-card'
          } rounded-3xl shadow-xl p-6 md:p-8`}
        >
          {renderStepContent()}
        </motion.div>
      </div>

      {/* Journal Modal */}
      <JournalModal
        isOpen={showJournal}
        onClose={() => router.push('/home')}
        onSubmit={handleJournalSubmit}
        loading={journalLoading}
      />
    </div>
  );
}
