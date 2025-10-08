
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { BookOpen, Star, TrendingUp, Wind, MessageSquare } from 'lucide-react';
import { getBooks, getRandomChapter } from '@/lib/bible-api';
import { motion } from 'framer-motion';

interface Metric {
  totalChapters: number;
  totalAccess: number;
  highlightsCount: number;
  notesCount: number;
  favoritesCount: number;
}

interface Favorite {
  id: string;
  book: string;
  chapter: number;
  verseNumber: number;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [metricsRes, favoritesRes] = await Promise.all([
        fetch('/api/metrics?period=all'),
        fetch('/api/favorites'),
      ]);

      if (metricsRes?.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData ?? null);
      }

      if (favoritesRes?.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData ?? []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDevotional = async () => {
    try {
      const books = await getBooks();
      const randomSelection = getRandomChapter(books);
      if (randomSelection) {
        router.push(
          `/leitura?book=${randomSelection.book}&chapter=${randomSelection.chapter}`
        );
      }
    } catch (error) {
      console.error('Error starting devotional:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold">
            Bem-vindo, {session?.user?.name ?? 'amigo'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Comece seu devocional diário e fortaleça sua fé
          </p>
        </motion.div>

        {/* Main CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <button
            onClick={handleStartDevotional}
            className="bg-primary text-primary-foreground py-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border border-border"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-semibold">Leitura Devocional</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Capítulo aleatório da Bíblia
            </p>
          </button>

          <button
            onClick={() => router.push('/devocional-ativo')}
            className="bg-card text-foreground py-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border border-primary/20"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Wind className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-semibold">Respira & Ore</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Meditação guiada de 10-15 min
            </p>
          </button>
        </motion.div>

        {/* Chat IA - Módulo Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={() => router.push('/fale-com-biblia')}
            className="w-full bg-card text-foreground py-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group border border-border"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <MessageSquare className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-semibold">Fale com a Bíblia</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Chatbot teológico com IA
            </p>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                {metrics?.totalChapters ?? 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Capítulos Lidos</p>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <span className="text-2xl font-bold">
                {metrics?.favoritesCount ?? 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Favoritos</p>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <span className="text-2xl font-bold">
                {metrics?.highlightsCount ?? 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Destaques</p>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-bold">
                {metrics?.notesCount ?? 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Anotações</p>
          </div>
        </motion.div>

        {/* Recent Favorites */}
        {(favorites?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-lg border border-border"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Favoritos Recentes
            </h2>
            <div className="space-y-3">
              {favorites?.slice(0, 5)?.map((fav) => (
                <button
                  key={fav?.id}
                  onClick={() =>
                    router.push(`/leitura?book=${fav?.book}&chapter=${fav?.chapter}`)
                  }
                  className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium">
                    {fav?.book?.toUpperCase()} {fav?.chapter}:{fav?.verseNumber}
                  </span>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
