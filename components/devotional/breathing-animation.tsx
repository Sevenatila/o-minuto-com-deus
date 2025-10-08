
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BREATHING_RHYTHM, vibrate, formatTime } from '@/lib/devotional-utils';
import { Clock } from 'lucide-react';

interface BreathingAnimationProps {
  isActive: boolean;
  hapticsEnabled?: boolean;
  totalDuration?: number; // Duração total do passo em segundos
}

export function BreathingAnimation({
  isActive,
  hapticsEnabled = true,
  totalDuration = 90,
}: BreathingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [overallStartTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;

    const phase = BREATHING_RHYTHM[currentPhase];
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = elapsed / phase.duration;

      // Atualizar tempo total decorrido
      const totalElapsedSecs = (Date.now() - overallStartTime) / 1000;
      setTotalElapsed(totalElapsedSecs);

      if (progress >= 1) {
        // Próxima fase
        const nextPhase = (currentPhase + 1) % BREATHING_RHYTHM.length;
        setCurrentPhase(nextPhase);
        setPhaseProgress(0);

        // Haptic feedback na transição para "hold"
        if (hapticsEnabled && BREATHING_RHYTHM[nextPhase].type === 'hold') {
          vibrate(50);
        }
      } else {
        setPhaseProgress(progress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentPhase, isActive, hapticsEnabled, overallStartTime]);

  const phase = BREATHING_RHYTHM[currentPhase];

  // Escala do círculo baseada na fase
  const getScale = () => {
    if (phase.type === 'inhale') {
      return 0.5 + phaseProgress * 0.5; // 0.5 → 1.0
    } else if (phase.type === 'hold') {
      return 1.0;
    } else {
      // exhale
      return 1.0 - phaseProgress * 0.5; // 1.0 → 0.5
    }
  };

  // Calcular progresso total e tempo restante
  const overallProgress = Math.min(totalElapsed / totalDuration, 1);
  const remainingTime = Math.max(totalDuration - totalElapsed, 0);
  const circumference = 2 * Math.PI * 120; // raio = 120px
  const strokeDashoffset = circumference * (1 - overallProgress);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Display de tempo restante - Movido para o topo */}
      <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/30">
        <Clock className="h-5 w-5 text-primary" />
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {formatTime(remainingTime)}
        </span>
      </div>

      {/* Cronômetro e Animação de Respiração */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Círculo de progresso externo (cronômetro) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Fundo do círculo */}
          <circle
            cx="160"
            cy="160"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/30"
          />
          {/* Progresso */}
          <circle
            cx="160"
            cy="160"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-100 ease-linear"
            strokeLinecap="round"
          />
        </svg>

        {/* Círculo de respiração */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Círculo externo (guia) */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />

          {/* Círculo animado */}
          <motion.div
            className="absolute rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
            animate={{
              scale: getScale(),
              opacity: phase.type === 'hold' ? 1 : 0.8,
            }}
            transition={{
              duration: 0.1,
              ease: 'linear',
            }}
            style={{
              width: '200px',
              height: '200px',
            }}
          />

          {/* Pulso externo */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* Texto de instrução */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <p className="text-2xl md:text-3xl font-semibold text-foreground">
          {phase.text}
        </p>
        
        {/* Indicador de ciclos de respiração */}
        <div className="flex gap-2 justify-center">
          {BREATHING_RHYTHM.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-12 rounded-full transition-colors ${
                idx === currentPhase
                  ? 'bg-primary'
                  : idx < currentPhase
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Barra de progresso total */}
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress * 100}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(overallProgress * 100)}% concluído
          </p>
        </div>
      </motion.div>
    </div>
  );
}
