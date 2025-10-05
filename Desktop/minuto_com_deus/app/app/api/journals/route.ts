
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateUserStreak } from '@/lib/streak';

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
    const { gratidao, insight, humor, duracaoMinutos } = body;

    // Validate
    if (humor < 1 || humor > 5) {
      return NextResponse.json({ error: 'Humor must be between 1 and 5' }, { status: 400 });
    }

    if (![5, 10, 15].includes(duracaoMinutos)) {
      return NextResponse.json({ error: 'Duração inválida' }, { status: 400 });
    }

    const journal = await prisma.journal.create({
      data: {
        userId: user.id,
        gratidao,
        insight,
        humor,
        duracaoMinutos,
        sessionDate: new Date(),
      },
    });

    // ✅ MÓDULO IV: Atualiza o streak após completar o fluxo "Respira & Ore"
    const streakData = await updateUserStreak(user.id);

    return NextResponse.json({
      journal,
      streak: streakData,
    });
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const journals = await prisma.journal.findMany({
      where: { userId: user.id },
      orderBy: { sessionDate: 'desc' },
      take: limit,
    });

    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
