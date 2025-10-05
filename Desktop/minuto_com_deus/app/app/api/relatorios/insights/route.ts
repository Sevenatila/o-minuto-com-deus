
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Obter insights gerais do usuário
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        totalDevocionais: true,
        lastActivityDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar métricas de leitura
    const chapterMetrics = await prisma.chapterMetric.findMany({
      where: { userId },
      orderBy: { lastAccessedAt: 'desc' },
      take: 50,
    });

    // Buscar entradas de diário (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const journals = await prisma.journal.findMany({
      where: {
        userId,
        sessionDate: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    // Buscar destaques, notas e favoritos
    const [highlightsCount, notesCount, favoritesCount] = await Promise.all([
      prisma.highlight.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    // Calcular estatísticas
    const totalCapitulosLidos = chapterMetrics.reduce(
      (sum, metric) => sum + metric.accessCount,
      0
    );

    const livrosUnicos = new Set(chapterMetrics.map((m) => m.book)).size;

    const humorMedio =
      journals.length > 0
        ? journals.reduce((sum, j) => sum + j.humor, 0) / journals.length
        : 0;

    const tempoMedioDevocional =
      journals.length > 0
        ? journals.reduce((sum, j) => sum + j.duracaoMinutos, 0) / journals.length
        : 0;

    // Livro mais lido
    const livroFrequency: Record<string, number> = {};
    chapterMetrics.forEach((metric) => {
      livroFrequency[metric.book] = (livroFrequency[metric.book] || 0) + metric.accessCount;
    });
    const livroMaisLido = Object.keys(livroFrequency).length > 0 
      ? Object.keys(livroFrequency).reduce((a, b) =>
          livroFrequency[a] > livroFrequency[b] ? a : b
        )
      : 'Nenhum';

    // Dias com atividade nos últimos 30 dias
    const diasComAtividade = new Set(
      journals.map((j) => j.sessionDate.toISOString().split('T')[0])
    ).size;

    // Tendência de humor (comparar primeira e última semana)
    const primeiraSemanaMood = journals.slice(-7).reduce((sum, j) => sum + j.humor, 0) / Math.min(journals.length, 7);
    const ultimaSemanaMood = journals.slice(0, 7).reduce((sum, j) => sum + j.humor, 0) / Math.min(journals.length, 7);
    const tendenciaHumor = ultimaSemanaMood > primeiraSemanaMood ? 'crescente' : ultimaSemanaMood < primeiraSemanaMood ? 'decrescente' : 'estável';

    return NextResponse.json({
      user: {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalDevocionais: user.totalDevocionais,
        diasNaJornada: Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      leitura: {
        totalCapitulosLidos,
        livrosUnicos,
        livroMaisLido,
        livroFrequency,
      },
      engajamento: {
        highlightsCount,
        notesCount,
        favoritesCount,
        diasComAtividade,
      },
      humor: {
        humorMedio: parseFloat(humorMedio.toFixed(2)),
        tempoMedioDevocional: parseFloat(tempoMedioDevocional.toFixed(1)),
        tendenciaHumor,
        totalJournals: journals.length,
      },
      journals: journals.map((j) => ({
        sessionDate: j.sessionDate.toISOString().split('T')[0],
        humor: j.humor,
        duracaoMinutos: j.duracaoMinutos,
      })),
      chapterMetrics: chapterMetrics.slice(0, 10).map((m) => ({
        book: m.book,
        chapter: m.chapter,
        accessCount: m.accessCount,
        lastAccessedAt: m.lastAccessedAt,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar insights' },
      { status: 500 }
    );
  }
}
