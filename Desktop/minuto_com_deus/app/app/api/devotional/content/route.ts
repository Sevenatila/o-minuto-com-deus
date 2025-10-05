
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    const dayParam = searchParams.get('day');

    // Se day não for especificado, buscar o próximo devocional
    let day = dayParam ? parseInt(dayParam) : null;

    if (!day) {
      // Buscar preferências para saber qual foi o último dia completado
      const preferences = await prisma.devotionalPreference.findUnique({
        where: { userId: user.id },
      });

      day = preferences ? preferences.lastCompletedDay + 1 : 1;
    }

    let devo = await prisma.devo.findUnique({
      where: { day },
    });

    // Se não encontrar, voltar ao dia 1 (ciclo)
    if (!devo) {
      devo = await prisma.devo.findUnique({
        where: { day: 1 },
      });
    }

    // Se ainda não encontrar, retornar devocional padrão (seed necessário)
    if (!devo) {
      return NextResponse.json({
        id: 'default',
        day: 1,
        title: 'Paz no Caos',
        verseRef: 'Filipenses 4:6-7',
        verseText:
          'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.',
        contextLine: 'Entregar a ansiedade em oração.',
        audioUrlPalavra: null,
        audioUrlOracao: null,
        lengthSec: 600,
      });
    }

    return NextResponse.json(devo);
  } catch (error) {
    console.error('Error fetching devotional content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
