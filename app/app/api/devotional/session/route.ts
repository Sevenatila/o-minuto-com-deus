
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      devoDay,
      durationSec,
      completedSteps,
      eyesClosedMode,
      hadFallback,
    } = body;

    // Validações
    if (!devoDay || !durationSec || !completedSteps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Salvar sessão
    const devotionalSession = await prisma.devotionalSession.create({
      data: {
        userId: user.id,
        devoDay,
        durationSec,
        completedSteps,
        eyesClosedMode: eyesClosedMode || false,
        hadFallback: hadFallback || false,
      },
    });

    // Atualizar preferências (último dia completado)
    const completedAllSteps = completedSteps.length === 4;
    if (completedAllSteps) {
      await prisma.devotionalPreference.upsert({
        where: { userId: user.id },
        update: {
          lastCompletedDay: devoDay,
        },
        create: {
          userId: user.id,
          lastCompletedDay: devoDay,
        },
      });

      // Atualizar streak do usuário (se completou Respira + Palavra)
      const hasRespiraAndPalavra =
        completedSteps.includes('respira') && completedSteps.includes('palavra');
      
      if (hasRespiraAndPalavra) {
        // Incrementar peaceDays
        await prisma.devotionalPreference.update({
          where: { userId: user.id },
          data: {
            peaceDays: { increment: 1 },
          },
        });

        // Atualizar streak geral do app
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = user.lastActivityDate
          ? new Date(user.lastActivityDate)
          : null;

        if (lastActivity) {
          lastActivity.setHours(0, 0, 0, 0);
        }

        const daysSinceLastActivity = lastActivity
          ? Math.floor(
              (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 1;

        let newStreak = user.currentStreak;

        if (daysSinceLastActivity === 0) {
          // Já fez hoje, manter streak
        } else if (daysSinceLastActivity === 1) {
          // Dia consecutivo
          newStreak += 1;
        } else {
          // Quebrou streak
          newStreak = 1;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            lastActivityDate: new Date(),
            totalDevocionais: { increment: 1 },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      devotionalSession,
    });
  } catch (error) {
    console.error('Error saving devotional session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
