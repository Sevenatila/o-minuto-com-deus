
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  BookOpen, 
  Heart, 
  Calendar, 
  Sparkles, 
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  BarChart3,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Insights {
  user: {
    currentStreak: number;
    longestStreak: number;
    totalDevocionais: number;
    diasNaJornada: number;
  };
  leitura: {
    totalCapitulosLidos: number;
    livrosUnicos: number;
    livroMaisLido: string;
    livroFrequency: Record<string, number>;
  };
  engajamento: {
    highlightsCount: number;
    notesCount: number;
    favoritesCount: number;
    diasComAtividade: number;
  };
  humor: {
    humorMedio: number;
    tempoMedioDevocional: number;
    tendenciaHumor: string;
    totalJournals: number;
  };
  journals: Array<{
    sessionDate: string;
    humor: number;
    duracaoMinutos: number;
  }>;
}

interface CorrelacaoData {
  correlacao: number;
  forca: string;
  interpretacao: string;
  dataPoints: Array<{
    date: string;
    humor: number;
    streak: number;
    duracaoMinutos: number;
  }>;
  humorPorFaixaStreak: Array<{
    label: string;
    mediaHumor: number;
    count: number;
  }>;
  currentStreak: number;
  totalDataPoints: number;
}

interface PlanoSemanal {
  titulo: string;
  descricao: string;
  metaDaSemana: string;
  motivacao: string;
  diasPlano: Array<{
    dia: number;
    diaSemana: string;
    livro: string;
    capitulo: number;
    temaHoje: string;
    motivacao: string;
  }>;
  dicasRealizacao: string[];
}

export default function RelatoriosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [correlacao, setCorrelacao] = useState<CorrelacaoData | null>(null);
  const [planoSemanal, setPlanoSemanal] = useState<PlanoSemanal | null>(null);
  const [loadingPlano, setLoadingPlano] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchInsights();
      fetchCorrelacao();
    }
  }, [session]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/relatorios/insights');
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      } else {
        setError('Erro ao carregar insights');
      }
    } catch (err) {
      console.error('Erro ao buscar insights:', err);
      setError('Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrelacao = async () => {
    try {
      const res = await fetch('/api/relatorios/humor-constancia');
      if (res.ok) {
        const data = await res.json();
        setCorrelacao(data);
      }
    } catch (err) {
      console.error('Erro ao buscar correlação:', err);
    }
  };

  const gerarPlanoSemanal = async () => {
    try {
      setLoadingPlano(true);
      const res = await fetch('/api/relatorios/sugestao-semanal');
      if (res.ok) {
        const data = await res.json();
        setPlanoSemanal(data.planoSemanal);
      } else {
        setError('Erro ao gerar plano semanal');
      }
    } catch (err) {
      console.error('Erro ao gerar plano:', err);
      setError('Erro ao gerar plano semanal');
    } finally {
      setLoadingPlano(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seus relatórios...</p>
        </div>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50 to-pink-50">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Preparar dados para gráficos
  const humorChartData = insights?.journals && insights.journals.length > 0 ? {
    labels: insights.journals.map((j) => {
      const date = new Date(j.sessionDate);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }).reverse(),
    datasets: [
      {
        label: 'Humor',
        data: insights.journals.map((j) => j.humor).reverse(),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  const correlacaoChartData = correlacao?.dataPoints && correlacao.dataPoints.length > 0 ? {
    labels: correlacao.dataPoints.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Humor',
        data: correlacao.dataPoints.map((d) => d.humor),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Streak',
        data: correlacao.dataPoints.map((d) => d.streak),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        yAxisID: 'y1',
      },
    ],
  } : null;

  const humorPorStreakData = correlacao?.humorPorFaixaStreak && correlacao.humorPorFaixaStreak.length > 0 ? {
    labels: correlacao.humorPorFaixaStreak.map((f) => f.label),
    datasets: [
      {
        label: 'Humor Médio',
        data: correlacao.humorPorFaixaStreak.map((f) => f.mediaHumor),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  } : null;

  const getTendenciaIcon = (tendencia: string) => {
    if (tendencia === 'crescente') return <ArrowUp className="h-5 w-5 text-green-600" />;
    if (tendencia === 'decrescente') return <ArrowDown className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getHumorEmoji = (humor: number) => {
    if (humor >= 4.5) return '😊';
    if (humor >= 3.5) return '🙂';
    if (humor >= 2.5) return '😐';
    if (humor >= 1.5) return '😔';
    return '😢';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Relatórios Pessoais
          </h1>
          <p className="text-muted-foreground">
            Insights e análises preditivas da sua jornada espiritual
          </p>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-foreground">
                {insights?.user.currentStreak || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Streak Atual</p>
            <p className="text-xs text-gray-500 mt-1">
              Recorde: {insights?.user.longestStreak || 0} dias
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
              <span className="text-3xl font-bold text-foreground">
                {insights?.leitura.totalCapitulosLidos || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Capítulos Lidos</p>
            <p className="text-xs text-gray-500 mt-1">
              {insights?.leitura.livrosUnicos || 0} livros únicos
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-md p-6 border-l-4 border-pink-600">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-pink-600" />
              <span className="text-3xl font-bold text-foreground">
                {insights?.humor.humorMedio || 0} {getHumorEmoji(insights?.humor.humorMedio || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Humor Médio</p>
            <div className="flex items-center gap-1 mt-1">
              {getTendenciaIcon(insights?.humor.tendenciaHumor || '')}
              <span className="text-xs text-gray-500 capitalize">
                {insights?.humor.tendenciaHumor}
              </span>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-orange-600" />
              <span className="text-3xl font-bold text-foreground">
                {insights?.user.diasNaJornada || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Dias na Jornada</p>
            <p className="text-xs text-gray-500 mt-1">
              {insights?.user.totalDevocionais || 0} devocionais
            </p>
          </div>
        </div>

        {/* Gráfico de Humor ao Longo do Tempo */}
        {humorChartData && (
          <div className="bg-card rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Evolução do Humor
            </h2>
            <div className="h-64">
              <Line
                data={humorChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Análise de Correlação: Humor vs. Constância */}
        {correlacao && (
          <div className="bg-card rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              Análise Preditiva: Humor vs. Constância
            </h2>
            
            <div className="mb-6 p-4 info-box-purple rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Correlação: <span className="text-purple-500">{correlacao.correlacao.toFixed(3)}</span> ({correlacao.forca})
                  </h3>
                  <p className="text-foreground">{correlacao.interpretacao}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Baseado em {correlacao.totalDataPoints} pontos de dados
                  </p>
                </div>
              </div>
            </div>

            {correlacaoChartData && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Humor e Streak ao Longo do Tempo</h3>
                <div className="h-64">
                  <Line
                    data={correlacaoChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Humor (1-5)',
                          },
                          min: 0,
                          max: 5,
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: {
                            display: true,
                            text: 'Streak (dias)',
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {humorPorStreakData && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Humor Médio por Faixa de Streak</h3>
                <div className="h-64">
                  <Bar
                    data={humorPorStreakData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engajamento e Livros Mais Lidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warning" />
              Seu Engajamento
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Destaques</span>
                <span className="font-semibold text-foreground">{insights?.engajamento.highlightsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Notas</span>
                <span className="font-semibold text-foreground">{insights?.engajamento.notesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Favoritos</span>
                <span className="font-semibold text-foreground">{insights?.engajamento.favoritesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dias com atividade (30d)</span>
                <span className="font-semibold text-foreground">{insights?.engajamento.diasComAtividade || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tempo médio devocional</span>
                <span className="font-semibold text-foreground">{insights?.humor.tempoMedioDevocional || 0} min</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Seus Livros Favoritos
            </h2>
            {insights?.leitura.livroFrequency && Object.keys(insights.leitura.livroFrequency).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(insights.leitura.livroFrequency)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([livro, count]) => (
                    <div key={livro} className="flex justify-between items-center">
                      <span className="text-foreground">{livro}</span>
                      <span className="text-sm font-semibold text-primary">{count} acessos</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Continue lendo para ver suas estatísticas!
              </p>
            )}
          </div>
        </div>

        {/* Sugestão de Plano Semanal */}
        <div className="bg-card rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-warning" />
              Sugestão de Plano para a Próxima Semana
            </h2>
            <button
              onClick={gerarPlanoSemanal}
              disabled={loadingPlano}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingPlano ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Gerar Plano com IA
                </>
              )}
            </button>
          </div>

          {planoSemanal ? (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-background to-background rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-2">{planoSemanal.titulo}</h3>
                <p className="text-foreground mb-3">{planoSemanal.descricao}</p>
                <div className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Meta da Semana:</p>
                    <p className="text-foreground">{planoSemanal.metaDaSemana}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 info-box-yellow rounded-lg">
                <p className="text-foreground italic">{planoSemanal.motivacao}</p>
              </div>

              <div className="space-y-4">
                {planoSemanal.diasPlano.map((dia) => (
                  <div key={dia.dia} className="p-4 border border-border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Dia {dia.dia} - {dia.diaSemana}
                        </h4>
                        <p className="text-sm text-muted-foreground">{dia.temaHoje}</p>
                      </div>
                      <span className="text-primary font-semibold">
                        {dia.livro} {dia.capitulo}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{dia.motivacao}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 info-box-green rounded-lg">
                <h4 className="font-semibold text-foreground mb-3">Dicas para Realizar o Plano:</h4>
                <ul className="space-y-2">
                  {planoSemanal.dicasRealizacao.map((dica, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span className="text-foreground">{dica}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Clique no botão acima para gerar um plano personalizado com IA baseado na sua jornada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
