
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Sparkles, Zap, Heart, BookOpen, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PlanosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isProMember, setIsProMember] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    if (success === 'true') {
      toast.success('✅ Pagamento realizado com sucesso! Bem-vindo ao Plano Pro!');
      // Limpar parâmetros da URL
      router.replace('/planos');
    }

    if (canceled === 'true') {
      toast.error('❌ Pagamento cancelado. Tente novamente quando quiser.');
      router.replace('/planos');
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function checkSubscription() {
      if (session?.user) {
        try {
          const res = await fetch('/api/subscription-status');
          if (res.ok) {
            const data = await res.json();
            setIsProMember(data.isProMember);
            setSubscriptionEnd(data.stripeCurrentPeriodEnd);
          }
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
        }
      }
    }
    checkSubscription();
  }, [session]);

  const handleSubscribe = async () => {
    if (!session?.user) {
      toast.error('Faça login para assinar o plano Pro');
      router.push('/login');
      return;
    }

    if (isProMember) {
      toast.success('Você já possui uma assinatura ativa!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error('Erro ao criar checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const freePlanFeatures = [
    'Leitura completa da Bíblia (Almeida)',
    'Destaques e anotações pessoais',
    'Versículos favoritos',
    'Histórico de leitura',
    'Devocional "Respira & Ore" (modo padrão 10min)',
    '5 perguntas/mês no Chatbot Teológico',
  ];

  const proPlanFeatures = [
    'Tudo do Plano Gratuito',
    'Chatbot "Fale com a Bíblia" ILIMITADO',
    'Biblioteca Pro: Meditações guiadas exclusivas',
    'Meditações de 15 minutos',
    'Temas especiais: Ansiedade, Finanças, Relacionamentos',
    'Novos áudios mensais',
    'Sem anúncios',
    'Suporte prioritário',
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-amber-500 mr-2" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Escolha seu Plano
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comece grátis e evolua quando quiser. Aproveite todas as ferramentas para uma vida espiritual mais profunda.
          </p>
        </div>

        {/* Status da Assinatura Atual */}
        {isProMember && subscriptionEnd && (
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 rounded-lg flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-amber-700" />
            <p className="text-amber-900 font-medium">
              Você é membro Pro! Sua assinatura renova em{' '}
              {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Plano Gratuito */}
          <Card className="border-2 border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <CardDescription className="text-3xl font-bold text-gray-900">
                R$ 0<span className="text-base font-normal text-gray-500">/mês</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={!isProMember}
              >
                {isProMember ? 'Plano Atual' : 'Seu Plano Atual'}
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Pro */}
          <Card className="border-2 border-amber-400 hover:shadow-xl transition-shadow relative overflow-hidden">
            {/* Badge Popular */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Popular
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Plano Pro</CardTitle>
                <Crown className="h-8 w-8 text-amber-500" />
              </div>
              <CardDescription className="text-3xl font-bold text-gray-900">
                R$ 14,90<span className="text-base font-normal text-gray-500">/mês</span>
              </CardDescription>
              <p className="text-sm text-amber-700 font-medium mt-2">
                ⚡ Cancele quando quiser
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proPlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold"
                onClick={handleSubscribe}
                disabled={loading || isProMember}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : isProMember ? (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Você já é Pro!
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Assinar Agora
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Seção de Benefícios Visuais */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Por que escolher o Plano Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Conteúdo Exclusivo</h3>
              <p className="text-gray-600 text-sm">
                Acesse meditações guiadas premium e áudios especiais toda semana
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Temas Personalizados</h3>
              <p className="text-gray-600 text-sm">
                Meditações focadas em ansiedade, finanças e relacionamentos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sem Compromisso</h3>
              <p className="text-gray-600 text-sm">
                Cancele a qualquer momento, sem taxas ou penalidades
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Como funciona o pagamento?</h3>
              <p className="text-gray-600 text-sm">
                O pagamento é processado de forma segura pelo Stripe. Você será cobrado mensalmente de forma automática.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600 text-sm">
                Sim! Você pode cancelar sua assinatura a qualquer momento nas configurações do seu perfil.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">O que acontece se eu cancelar?</h3>
              <p className="text-gray-600 text-sm">
                Você continuará tendo acesso ao conteúdo Pro até o fim do período pago. Depois, voltará ao plano gratuito.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
