
/**
 * Módulo IV - Sistema de Streak (Gamificação)
 * Calcula e atualiza o streak de consistência do usuário
 */

import { prisma } from '@/lib/db';

/**
 * Verifica se duas datas são do mesmo dia
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica se duas datas são dias consecutivos
 */
function isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffMs = currentDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / oneDayMs);
  return diffDays === 1;
}

/**
 * Atualiza o streak do usuário após completar uma sessão devocional
 * Esta função deve ser chamada APENAS quando o usuário completa o fluxo "Respira & Ore"
 */
export async function updateUserStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza para início do dia

  // Busca o usuário atual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
      totalDevocionais: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let newStreak = 1;
  let newLongestStreak = user.longestStreak;
  let isNewRecord = false;

  // Se já fez atividade hoje, não atualiza o streak
  if (user.lastActivityDate && isSameDay(user.lastActivityDate, today)) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      isNewRecord: false,
    };
  }

  // Verifica se é dia consecutivo
  if (user.lastActivityDate) {
    if (isConsecutiveDay(user.lastActivityDate, today)) {
      // Mantém e incrementa o streak
      newStreak = user.currentStreak + 1;
    } else {
      // Quebrou o streak, reinicia
      newStreak = 1;
    }
  }

  // Atualiza o recorde se necessário
  if (newStreak > newLongestStreak) {
    newLongestStreak = newStreak;
    isNewRecord = true;
  }

  // Atualiza no banco de dados
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      totalDevocionais: user.totalDevocionais + 1,
    },
  });

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    isNewRecord,
  };
}

/**
 * Busca informações do streak do usuário
 */
export async function getUserStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
      totalDevocionais: true,
    },
  });

  if (!user) {
    return null;
  }

  // Verifica se o streak ainda está ativo (último acesso foi ontem ou hoje)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let isActive = true;
  if (user.lastActivityDate) {
    const lastActivity = new Date(user.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const diffMs = today.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    // Se passou mais de 1 dia, o streak está quebrado
    if (diffDays > 1) {
      isActive = false;
    }
  }

  return {
    ...user,
    isActive,
  };
}
