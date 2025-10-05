
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const FREE_MONTHLY_LIMIT = 5;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isProMember: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Usuários Pro têm acesso ilimitado
    if (user.isProMember) {
      return NextResponse.json({
        isProMember: true,
        unlimited: true,
        questionsUsed: 0,
        questionsRemaining: -1, // -1 indica ilimitado
        limit: -1,
      });
    }

    // Para usuários gratuitos, verificar uso mensal
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    let usage = await prisma.chatUsage.findUnique({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
    });

    // Se não existir registro para este mês, criar
    if (!usage) {
      usage = await prisma.chatUsage.create({
        data: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
          questionsUsed: 0,
        },
      });
    }

    const questionsRemaining = Math.max(0, FREE_MONTHLY_LIMIT - usage.questionsUsed);

    return NextResponse.json({
      isProMember: false,
      unlimited: false,
      questionsUsed: usage.questionsUsed,
      questionsRemaining,
      limit: FREE_MONTHLY_LIMIT,
      hasReachedLimit: usage.questionsUsed >= FREE_MONTHLY_LIMIT,
    });
  } catch (error) {
    console.error('Erro ao verificar uso do chat:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar limite de uso' },
      { status: 500 }
    );
  }
}

// Incrementar contador de uso (chamado quando usuário envia pergunta)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isProMember: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Usuários Pro não têm limite
    if (user.isProMember) {
      return NextResponse.json({ success: true, isProMember: true });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Buscar ou criar registro de uso
    const usage = await prisma.chatUsage.upsert({
      where: {
        userId_month_year: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {
        questionsUsed: { increment: 1 },
      },
      create: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        questionsUsed: 1,
      },
    });

    // Verificar se excedeu o limite
    if (usage.questionsUsed > FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: 'Limite mensal atingido', limitReached: true },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      questionsUsed: usage.questionsUsed,
      questionsRemaining: FREE_MONTHLY_LIMIT - usage.questionsUsed,
    });
  } catch (error) {
    console.error('Erro ao incrementar uso do chat:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar uso' },
      { status: 500 }
    );
  }
}
