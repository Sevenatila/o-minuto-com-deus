
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') ?? 'all';

    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const metrics = await prisma.chapterMetric.findMany({
      where: {
        userId: session.user.id,
        ...(startDate ? { lastAccessedAt: { gte: startDate } } : {}),
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    const totalChapters = metrics?.length ?? 0;
    const totalAccess = metrics?.reduce((sum, m) => sum + (m?.accessCount ?? 0), 0) ?? 0;

    const highlightsCount = await prisma.highlight.count({
      where: { userId: session.user.id },
    });

    const notesCount = await prisma.note.count({
      where: { userId: session.user.id },
    });

    const favoritesCount = await prisma.favorite.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      totalChapters,
      totalAccess,
      highlightsCount,
      notesCount,
      favoritesCount,
      recentChapters: metrics?.slice(0, 10) ?? [],
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { book, chapter } = body ?? {};

    if (!book || !chapter) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const existingMetric = await prisma.chapterMetric.findUnique({
      where: {
        userId_book_chapter: {
          userId: session.user.id,
          book,
          chapter: parseInt(chapter),
        },
      },
    });

    if (existingMetric) {
      const updated = await prisma.chapterMetric.update({
        where: { id: existingMetric.id },
        data: {
          accessCount: (existingMetric?.accessCount ?? 0) + 1,
          lastAccessedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.chapterMetric.create({
        data: {
          userId: session.user.id,
          book,
          chapter: parseInt(chapter),
          accessCount: 1,
          lastAccessedAt: new Date(),
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error recording metric:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar métrica' },
      { status: 500 }
    );
  }
}
