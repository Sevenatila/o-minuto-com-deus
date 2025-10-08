
'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  User,
  BookOpen,
  Star,
  Highlighter,
  FileText,
  LogOut,
  TrendingUp,
  Calendar,
  Wind,
  Heart,
  Crown,
  CreditCard,
  Palette,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Metric {
  totalChapters: number;
  totalAccess: number;
  highlightsCount: number;
  notesCount: number;
  favoritesCount: number;
}

interface PeriodMetrics {
  today: number;
  week: number;
  month: number;
}

interface Journal {
  id: string;
  sessionDate: string;
  gratidao: string | null;
  insight: string | null;
  humor: number;
  duracaoMinutos: number;
}

interface JournalStats {
  total: number;
  averageHumor: number;
  recentJournals: Journal[];
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [periodMetrics, setPeriodMetrics] = useState<PeriodMetrics>({
    today: 0,
    week: 0,
    month: 0,
  });
  const [journalStats, setJournalStats] = useState<JournalStats>({
    total: 0,
    averageHumor: 0,
    recentJournals: [],
  });
  const [loading, setLoading] = useState(true);
  const [isProMember, setIsProMember] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMetrics();
    }
  }, [status]);

  const fetchMetrics = async () => {
    try {
      const [allMetrics, todayMetrics, weekMetrics, monthMetrics, journals, subscription] = await Promise.all([
        fetch('/api/metrics?period=all'),
        fetch('/api/metrics?period=today'),
        fetch('/api/metrics?period=week'),
        fetch('/api/metrics?period=month'),
        fetch('/api/journals?limit=5'),
        fetch('/api/subscription-status'),
      ]);

      if (allMetrics?.ok) {
        const data = await allMetrics.json();
        setMetrics(data ?? null);
      }

      const todayData = todayMetrics?.ok ? await todayMetrics.json() : null;
      const weekData = weekMetrics?.ok ? await weekMetrics.json() : null;
      const monthData = monthMetrics?.ok ? await monthMetrics.json() : null;

      setPeriodMetrics({
        today: todayData?.totalChapters ?? 0,
        week: weekData?.totalChapters ?? 0,
        month: monthData?.totalChapters ?? 0,
      });

      if (journals?.ok) {
        const journalsData = await journals.json();
        const total = journalsData?.length ?? 0;
        const averageHumor = total > 0
          ? journalsData.reduce((sum: number, j: Journal) => sum + j.humor, 0) / total
          : 0;
        
        setJournalStats({
          total,
          averageHumor: Math.round(averageHumor * 10) / 10,
          recentJournals: journalsData ?? [],
        });
      }

      if (subscription?.ok) {
        const subscriptionData = await subscription.json();
        setIsProMember(subscriptionData.isProMember ?? false);
        setSubscriptionEnd(subscriptionData.stripeCurrentPeriodEnd ?? null);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace('/auth/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {session?.user?.name ?? 'Usuário'}
              </h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Sair da Conta
          </button>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-8"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Aparência
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Escolha o tema que melhor se adapta à sua preferência
              </p>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Assinatura
          </h3>

          {isProMember ? (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Plano Pro</h4>
                      <p className="text-sm text-muted-foreground">Assinatura ativa</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 icon-bg-green text-success rounded-full text-sm font-semibold">
                    Ativo
                  </span>
                </div>
                
                {subscriptionEnd && (
                  <div className="bg-card rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Próxima renovação</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(subscriptionEnd).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Acesso à Biblioteca Pro</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Meditações de 15 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Sem anúncios</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Para gerenciar sua assinatura, acesse o portal do Stripe ou entre em contato com o suporte.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Plano Gratuito
                </h4>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Você está usando o plano gratuito. Assine o Plano Pro para ter acesso a conteúdos exclusivos!
                </p>
              </div>
              
              <button
                onClick={() => router.push('/planos')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-semibold transition-all"
              >
                <Crown className="h-5 w-5" />
                Ver Planos Pro
              </button>
            </div>
          )}
        </motion.div>

        {/* Reading Statistics by Period */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Leituras por Período
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 info-box-blue rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 icon-bg-blue rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">Hoje</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {periodMetrics?.today ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 info-box-green rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 icon-bg-green rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <span className="font-medium text-foreground">Esta Semana</span>
              </div>
              <span className="text-2xl font-bold text-success">
                {periodMetrics?.week ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 info-box-purple rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 icon-bg-purple rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
                <span className="font-medium text-foreground">Este Mês</span>
              </div>
              <span className="text-2xl font-bold text-purple-500 dark:text-purple-400">
                {periodMetrics?.month ?? 0}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Overall Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Estatísticas Gerais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 card-gradient-blue rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-card rounded-lg shadow-sm">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Capítulos</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.totalChapters ?? 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Capítulos únicos lidos ao total
              </p>
            </div>

            <div className="p-6 card-gradient-yellow rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-card rounded-lg shadow-sm">
                  <Star className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Favoritos</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.favoritesCount ?? 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Versículos marcados como favoritos
              </p>
            </div>

            <div className="p-6 card-gradient-green rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-card rounded-lg shadow-sm">
                  <Highlighter className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destaques</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.highlightsCount ?? 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Versículos destacados com cores
              </p>
            </div>

            <div className="p-6 card-gradient-purple rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-card rounded-lg shadow-sm">
                  <FileText className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Anotações</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics?.notesCount ?? 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Notas pessoais em versículos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Respira & Ore Statistics */}
        {journalStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Wind className="h-6 w-6 text-purple-500" />
              Histórico de Devocionais
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 card-gradient-purple rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total de Sessões</p>
                <p className="text-3xl font-bold text-purple-500 dark:text-purple-400">
                  {journalStats.total}
                </p>
              </div>
              
              <div className="p-4 card-gradient-orange rounded-xl">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Humor Médio
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {journalStats.averageHumor}/5
                </p>
              </div>
            </div>

            {journalStats.recentJournals.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Últimas Sessões
                </h4>
                <div className="space-y-3">
                  {journalStats.recentJournals.map((journal) => (
                    <div
                      key={journal.id}
                      className="p-4 list-item-bg rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(journal.sessionDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {journal.duracaoMinutos} min
                          </span>
                          <span className="text-lg">
                            {journal.humor === 5 ? '😄' :
                             journal.humor === 4 ? '🙂' :
                             journal.humor === 3 ? '😐' :
                             journal.humor === 2 ? '😕' : '😔'}
                          </span>
                        </div>
                      </div>
                      {journal.gratidao && (
                        <p className="text-sm text-foreground line-clamp-2">
                          <span className="font-medium">Gratidão:</span> {journal.gratidao}
                        </p>
                      )}
                      {journal.insight && (
                        <p className="text-sm text-foreground line-clamp-2 mt-1">
                          <span className="font-medium">Insight:</span> {journal.insight}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Engagement Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Seu Engajamento
          </h3>
          <p className="text-3xl font-bold mb-2">
            {metrics?.totalAccess ?? 0} acessos
          </p>
          <p className="text-blue-100">
            Continue assim! Sua jornada espiritual está crescendo.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
