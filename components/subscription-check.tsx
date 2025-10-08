
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionCheck({ children, fallback }: SubscriptionCheckProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProMember, setIsProMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/subscription-status');
        if (res.ok) {
          const data = await res.json();
          setIsProMember(data.isProMember);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setIsProMember(false);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  if (!isProMember) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 p-4 rounded-full">
                <Crown className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Conteúdo Exclusivo Pro</CardTitle>
            <CardDescription className="text-base">
              Este conteúdo está disponível apenas para membros Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Acesse meditações guiadas exclusivas e conteúdos premium
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Crown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Temas especiais sobre ansiedade, finanças e relacionamentos
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => router.push('/planos')}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                A partir de R$ 14,90/mês • Cancele quando quiser
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export function useSubscription() {
  const { data: session } = useSession();
  const [isProMember, setIsProMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/subscription-status');
        if (res.ok) {
          const data = await res.json();
          setIsProMember(data.isProMember);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [session]);

  return { isProMember, loading };
}
