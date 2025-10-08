
// Utilitários para o Devocional Guiado

export interface StepDuration {
  respira: number;
  palavra: number;
  oracao: number;
  acao: number;
}

export const STEP_DURATIONS: Record<5 | 10 | 15, StepDuration> = {
  5: {
    respira: 60,   // 1 min
    palavra: 90,   // 1.5 min
    oracao: 90,    // 1.5 min
    acao: 60,      // 1 min
  },
  10: {
    respira: 90,   // 1.5 min
    palavra: 180,  // 3 min
    oracao: 180,   // 3 min
    acao: 90,      // 1.5 min
  },
  15: {
    respira: 120,  // 2 min
    palavra: 240,  // 4 min
    oracao: 240,   // 4 min
    acao: 180,     // 3 min
  },
};

export type StepName = 'respira' | 'palavra' | 'oracao' | 'acao';

export interface BreathingPhase {
  type: 'inhale' | 'hold' | 'exhale';
  duration: number;
  text: string;
}

export const BREATHING_RHYTHM: BreathingPhase[] = [
  { type: 'inhale', duration: 4, text: 'Inspire em 4...' },
  { type: 'hold', duration: 4, text: 'Segure 4...' },
  { type: 'exhale', duration: 6, text: 'Solte em 6...' },
];

export const STEP_TEXTS = {
  respira: {
    title: 'Respire',
    description: 'Inspire em 4… segure 4… solte em 6.',
    instruction: 'Concentre-se na sua respiração e acalme sua mente.',
  },
  palavra: {
    title: 'Palavra',
    description: 'Ouça a Palavra de Deus',
    instruction: 'Permita que a mensagem penetre em seu coração.',
  },
  oracao: {
    title: 'Oração',
    description: 'Converse com Deus',
    instruction: 'Diga a Deus, com suas palavras, onde você precisa de direção hoje.',
    suggestions: [
      'Ore por direção hoje.',
      'Agradeça por algo específico.',
    ],
  },
  acao: {
    title: 'Ação',
    description: 'Leve a mensagem com você',
    instruction: 'Escolha 1 passo simples para hoje.',
  },
};

// Sugestões de ações diárias variadas (ciclo de 30 dias)
export const DAILY_ACTION_SUGGESTIONS = [
  'Enviar uma mensagem de encorajamento para alguém',
  'Dedicar 5 minutos de oração pela manhã',
  'Ler um capítulo adicional da Bíblia hoje',
  'Praticar gratidão: escrever 3 coisas pelas quais você é grato',
  'Ajudar alguém sem esperar nada em troca',
  'Compartilhar um versículo bíblico nas redes sociais',
  'Ligar para um amigo ou familiar que você não fala há tempo',
  'Fazer um ato de bondade anônimo',
  'Perdoar alguém que te magoou',
  'Dedicar 10 minutos para meditar em silêncio',
  'Doar algo que você não usa mais',
  'Escrever uma carta de gratidão para Deus',
  'Jejuar de redes sociais por algumas horas',
  'Orar por alguém que você considera um inimigo',
  'Ler um salmo em voz alta',
  'Praticar paciência em uma situação desafiadora',
  'Compartilhar sua fé com alguém próximo',
  'Fazer uma boa ação em segredo',
  'Assistir a um culto ou pregação online',
  'Escrever suas orações em um diário',
  'Agradecer a Deus antes de cada refeição hoje',
  'Memorizar um versículo bíblico',
  'Fazer uma lista de bênçãos recebidas',
  'Ouvir música cristã durante o dia',
  'Refletir sobre como você pode servir melhor aos outros',
  'Pedir perdão a alguém que você magoou',
  'Dedicar tempo para orar por sua família',
  'Praticar humildade em suas ações hoje',
  'Compartilhar uma experiência de fé com alguém',
  'Louvar a Deus mesmo nas dificuldades do dia',
];

export function getDailyActionSuggestion(day: number): string {
  const index = (day - 1) % DAILY_ACTION_SUGGESTIONS.length;
  return DAILY_ACTION_SUGGESTIONS[index];
}

export function getStepDuration(minutes: 5 | 10 | 15, step: StepName): number {
  return STEP_DURATIONS[minutes][step];
}

export function getTotalDuration(minutes: 5 | 10 | 15): number {
  const durations = STEP_DURATIONS[minutes];
  return durations.respira + durations.palavra + durations.oracao + durations.acao;
}

export function vibrate(pattern: number | number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Analytics helper
export function trackDevotionalEvent(
  event: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    console.log('📊 Analytics:', event, properties);
    // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
  }
}
