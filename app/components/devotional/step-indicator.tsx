
'use client';

import { motion } from 'framer-motion';
import { Wind, BookOpen, HandHeart, Star, Check } from 'lucide-react';
import { StepName } from '@/lib/devotional-utils';

const STEP_CONFIG = [
  { id: 'respira' as StepName, name: 'Respira', icon: Wind, color: 'blue' },
  { id: 'palavra' as StepName, name: 'Palavra', icon: BookOpen, color: 'purple' },
  { id: 'oracao' as StepName, name: 'Oração', icon: HandHeart, color: 'pink' },
  { id: 'acao' as StepName, name: 'Ação', icon: Star, color: 'yellow' },
];

interface StepIndicatorProps {
  currentStep: StepName;
  completedSteps: StepName[];
}

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-4">
      {STEP_CONFIG.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id);

        return (
          <div key={step.id} className="relative">
            <motion.div
              animate={{
                scale: isActive ? 1.05 : 1,
                transition: { duration: 0.3 },
              }}
              className="flex flex-col items-center"
            >
              {/* Ícone */}
              <div
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-primary shadow-lg shadow-primary/30'
                    : isCompleted
                    ? 'bg-success/20 border-2 border-success'
                    : 'bg-muted border-2 border-border'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 md:h-7 md:w-7 text-success" />
                ) : (
                  <Icon
                    className={`h-6 w-6 md:h-7 md:w-7 ${
                      isActive ? 'text-white' : 'text-muted-foreground'
                    }`}
                  />
                )}

                {/* Pulso animado quando ativo */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary opacity-30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Nome */}
              <h3
                className={`text-xs md:text-sm font-semibold text-center ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.name}
              </h3>
            </motion.div>

            {/* Linha de conexão */}
            {index < STEP_CONFIG.length - 1 && (
              <div className="absolute top-7 md:top-8 left-[calc(50%+1.75rem)] md:left-[calc(50%+2rem)] w-[calc(100%-3.5rem)] md:w-[calc(100%-4rem)] h-0.5 bg-border hidden sm:block">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{
                    width: isCompleted ? '100%' : '0%',
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
