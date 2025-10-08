
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Reflection {
  id: string;
  date: string;
  theme: string;
  content: string;
  bibleReferences: Array<{
    book: string;
    chapter: number;
    verses: string;
  }>;
  wasRead: boolean;
  readAt: string | null;
}

export default function ReflexoesDiariasPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [todayReflection, setTodayReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReflections();
    }
  }, [status]);

  const fetchReflections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reflexao-diaria');
      if (res.ok) {
        const data = await res.json();
        setReflections(data);
        
        // Verificar se já existe reflexão de hoje
        const today = new Date().toISOString().split('T')[0];
        const todayRef = data.find((r: Reflection) => 
          r.date.startsWith(today)
        );
        setTodayReflection(todayRef || null);
      }
    } catch (error) {
      console.error('Erro ao buscar reflexões:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTodayReflection = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/reflexao-diaria', {
        method: 'POST',
      });

      if (res.ok) {
        const reflection = await res.json();
        setTodayReflection(reflection);
        setReflections([reflection, ...reflections]);
        toast.success('Reflexão gerada com sucesso!');
      } else {
        throw new Error('Erro ao gerar reflexão');
      }
    } catch (error) {
      console.error('Erro ao gerar reflexão:', error);
      toast.error('Erro ao gerar reflexão diária');
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (reflectionId: string) => {
    try {
      const res = await fetch('/api/reflexao-diaria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionId }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReflections(reflections.map(r => 
          r.id === reflectionId ? updated : r
        ));
        if (todayReflection?.id === reflectionId) {
          setTodayReflection(updated);
        }
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Reflexões Diárias Personalizadas
          </h1>
          <p className="text-gray-600 text-lg">
            Mensagens inspiradoras baseadas na sua jornada espiritual
          </p>
        </div>

        {/* Reflexão de Hoje */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Reflexão de Hoje</h2>
          </div>

          {!todayReflection ? (
            <div className="text-center py-8">
              <p className="text-blue-100 mb-6">
                Ainda não há uma reflexão personalizada para hoje
              </p>
              <Button
                onClick={generateTodayReflection}
                disabled={generating}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Minha Reflexão
                  </>
                )}
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">
                  🎯 {todayReflection.theme}
                </h3>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-white/95 leading-relaxed whitespace-pre-wrap">
                  {todayReflection.content}
                </p>
              </div>

              {todayReflection.bibleReferences && todayReflection.bibleReferences.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5" />
                    <h4 className="font-semibold">Referências Bíblicas:</h4>
                  </div>
                  <div className="space-y-2">
                    {todayReflection.bibleReferences.map((ref, i) => (
                      <p key={i} className="text-white/90">
                        📖 {ref.book} {ref.chapter}:{ref.verses}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {!todayReflection.wasRead && (
                <Button
                  onClick={() => markAsRead(todayReflection.id)}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Marcar como Lida
                </Button>
              )}
            </motion.div>
          )}
        </Card>

        {/* Reflexões Anteriores */}
        {reflections.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Reflexões Anteriores
            </h2>
            <div className="space-y-4">
              {reflections
                .filter(r => r.id !== todayReflection?.id)
                .map((reflection) => (
                  <Card key={reflection.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {new Date(reflection.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <h3 className="text-xl font-semibold text-foreground">
                          {reflection.theme}
                        </h3>
                      </div>
                      {reflection.wasRead && (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                      {reflection.content}
                    </p>

                    {reflection.bibleReferences && reflection.bibleReferences.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {reflection.bibleReferences.map((ref, i) => (
                          <span
                            key={i}
                            className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                          >
                            {ref.book} {ref.chapter}:{ref.verses}
                          </span>
                        ))}
                      </div>
                    )}

                    {!reflection.wasRead && (
                      <Button
                        onClick={() => markAsRead(reflection.id)}
                        variant="outline"
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Lida
                      </Button>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
