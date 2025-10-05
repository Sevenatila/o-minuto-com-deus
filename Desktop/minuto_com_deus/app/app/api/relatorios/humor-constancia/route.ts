
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Análise de Correlação: Humor vs. Constância (Streak)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar todas as entradas de diário
    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { sessionDate: 'asc' },
    });

    if (journals.length === 0) {
      return NextResponse.json({
        error: 'Nenhum dado disponível para análise',
        message: 'Continue registrando seus devocionais para gerar análises preditivas.',
      }, { status: 404 });
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    });

    // Agrupar journals por data e calcular streak aproximado para cada entrada
    const dataPoints: Array<{
      date: string;
      humor: number;
      streak: number;
      duracaoMinutos: number;
    }> = [];
    
    for (let i = 0; i < journals.length; i++) {
      const journal = journals[i];
      
      // Calcular streak aproximado baseado em atividade anterior
      let streakAproximado = 1;
      if (i > 0) {
        let consecutiveDays = 1;
        for (let j = i - 1; j >= 0; j--) {
          const diffDays = Math.floor(
            (journal.sessionDate.getTime() - journals[j].sessionDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (diffDays === consecutiveDays) {
            streakAproximado++;
            consecutiveDays++;
          } else {
            break;
          }
        }
      }

      dataPoints.push({
        date: journal.sessionDate.toISOString().split('T')[0],
        humor: journal.humor,
        streak: streakAproximado,
        duracaoMinutos: journal.duracaoMinutos,
      });
    }

    // Calcular correlação entre humor e streak
    const calculateCorrelation = (data: { humor: number; streak: number }[]) => {
      if (data.length < 2) return 0;

      const n = data.length;
      const sumX = data.reduce((sum, d) => sum + d.streak, 0);
      const sumY = data.reduce((sum, d) => sum + d.humor, 0);
      const sumXY = data.reduce((sum, d) => sum + d.streak * d.humor, 0);
      const sumX2 = data.reduce((sum, d) => sum + d.streak * d.streak, 0);
      const sumY2 = data.reduce((sum, d) => sum + d.humor * d.humor, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt(
        (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
      );

      return denominator === 0 ? 0 : numerator / denominator;
    };

    const correlacao = calculateCorrelation(dataPoints);

    // Interpretar correlação
    let interpretacao = '';
    let forca = '';
    
    if (Math.abs(correlacao) < 0.3) {
      forca = 'fraca';
      interpretacao = 'Há pouca relação entre sua constância e seu humor. Continue explorando outros fatores que podem influenciar seu bem-estar espiritual.';
    } else if (Math.abs(correlacao) < 0.7) {
      forca = 'moderada';
      if (correlacao > 0) {
        interpretacao = 'Há uma relação moderada positiva: quando você mantém sua constância de leitura, seu humor tende a melhorar. Continue mantendo a consistência!';
      } else {
        interpretacao = 'Há uma relação moderada inversa detectada. Isso pode indicar que períodos de menor humor coincidem com maior busca espiritual.';
      }
    } else {
      forca = 'forte';
      if (correlacao > 0) {
        interpretacao = 'Excelente! Há uma forte correlação positiva: sua constância na leitura está diretamente relacionada com a melhoria do seu humor. Continue assim!';
      } else {
        interpretacao = 'Há uma forte relação inversa. Considere conversar com um mentor espiritual sobre os padrões observados.';
      }
    }

    // Média de humor por faixa de streak
    const streakRanges = [
      { label: '1-3 dias', min: 1, max: 3 },
      { label: '4-7 dias', min: 4, max: 7 },
      { label: '8-14 dias', min: 8, max: 14 },
      { label: '15-30 dias', min: 15, max: 30 },
      { label: '30+ dias', min: 31, max: 999 },
    ];

    const humorPorFaixaStreak = streakRanges.map((range) => {
      const pontos = dataPoints.filter(
        (d) => d.streak >= range.min && d.streak <= range.max
      );
      const mediaHumor = pontos.length > 0
        ? pontos.reduce((sum, p) => sum + p.humor, 0) / pontos.length
        : 0;
      
      return {
        label: range.label,
        mediaHumor: parseFloat(mediaHumor.toFixed(2)),
        count: pontos.length,
      };
    }).filter(r => r.count > 0);

    return NextResponse.json({
      correlacao: parseFloat(correlacao.toFixed(3)),
      forca,
      interpretacao,
      dataPoints: dataPoints.slice(-30), // Últimos 30 pontos
      humorPorFaixaStreak,
      currentStreak: user?.currentStreak || 0,
      totalDataPoints: dataPoints.length,
    });
  } catch (error) {
    console.error('Erro na análise de correlação:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar correlação' },
      { status: 500 }
    );
  }
}
