
/**
 * API para buscar usuários (para Planos com Amigos)
 * Sistema de amizade individual foi removido
 */

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
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // Busca usuários por nome ou email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: user.id }, // Não retorna o próprio usuário
          },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        currentStreak: true,
      },
      take: 20,
    });

    // Retorna usuários simples (sem status de amizade)
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
