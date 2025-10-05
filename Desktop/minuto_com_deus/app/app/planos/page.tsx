
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  Clock,
  MessageSquare,
  Zap,
  Shield,
  Users,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SubscriptionStatus {
  isProMember: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
}

export default function PlanosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptionStatus();
    }
  }, [status]);

  useEffect(() => {
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');

    if (success) {
      toast.success('🎉 Pagamento confirmado! Bem-vindo ao Plano Pro!', { duration: 5000 });
      // Remover query params da URL
      window.history.replaceState({}, '', '/planos');
      fetchSubscriptionStatus();
    }

    if (canceled) {
      toast.error('Pagamento cancelado. Você pode tentar novamente quando quiser.');
      window.history.replaceState({}, '', '/planos');
    }
  }, [searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/subscription-status');
      if (res.ok) {
        const data = await res.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Erro ao buscar status da assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('STRIPE_PRICE_ID')) {
          toast.error(
            'Sistema de pagamentos em configuração. Entre em contato com o suporte.',
            { duration: 6000 }
          );
        } else {
          throw new Error(data.error || 'Erro ao criar sessão de checkout');
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const freePlanFeatures = [
    { icon: BookOpen, text: 'Leitura completa da Bíblia' },
    { icon: Sparkles, text: '5 perguntas mensais ao Assistente IA' },
    { icon: Clock, text: 'Devocionais guiados de 10 minutos' },
    { icon: Users, text: 'Planos de leitura com amigos' },
  ];

  const proPlanFeatures = [
    { icon: BookOpen, text: 'Leitura completa da Bíblia' },
    { icon: MessageSquare, text: 'Perguntas ilimitadas ao Assistente IA', highlight: true },
    { icon: Clock, text: 'Devocionais de 10 e 15 minutos', highlight: true },
    { icon: Zap, text: 'Biblioteca Pro de devocionais', highlight: true },
    { icon: Users, text: 'Planos de leitura com amigos' },
    { icon: Shield, text: 'Sem anúncios', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha seu <span className="text-primary">Plano</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente ou desbloqueie recursos exclusivos com o Plano Pro
          </p>
        </motion.div>

        {/* Status Atual */}
        {subscriptionStatus?.isProMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-foreground">Você é um Membro Pro!</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Aproveite todos os recursos exclusivos do Plano Pro.
              {subscriptionStatus.stripeCurrentPeriodEnd && (
                <span className="block mt-1">
                  Próxima renovação:{' '}
                  {new Date(subscriptionStatus.stripeCurrentPeriodEnd).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </p>
            <Button
              onClick={() => router.push('/configuracoes')}
              variant="outline"
              className="border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50"
            >
              Gerenciar Assinatura
            </Button>
          </motion.div>
        )}

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Plano Gratuito */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-lg border-2 border-border p-6 sm:p-8 flex flex-col"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Plano Gratuito</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {freePlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{feature.text}</span>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              disabled
              variant="outline"
              className="w-full bg-muted text-muted-foreground cursor-not-allowed"
            >
              Plano Atual
            </Button>
          </motion.div>

          {/* Plano Pro */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl shadow-2xl border-4 ${
              subscriptionStatus?.isProMember
                ? 'border-amber-400 dark:border-amber-600'
                : 'border-amber-300 dark:border-amber-700'
            } p-6 sm:p-8 flex flex-col relative`}
          >
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                ✨ Mais Popular
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-bold text-foreground">Plano Pro</h2>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">R$ 14,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {proPlanFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <feature.icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        feature.highlight
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={
                        feature.highlight ? 'text-foreground font-semibold' : 'text-foreground'
                      }
                    >
                      {feature.text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleSubscribe}
              disabled={subscriptionStatus?.isProMember || checkoutLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processando...
                </>
              ) : subscriptionStatus?.isProMember ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Assinatura Ativa
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Assinar Agora
                </>
              )}
            </Button>

            {!subscriptionStatus?.isProMember && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Cancele quando quiser. Sem compromisso.
              </p>
            )}
          </motion.div>
        </div>

        {/* Aviso de Configuração */}
        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mt-8 p-6 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Sistema de Pagamentos em Configuração</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema de pagamentos está sendo configurado. Se você deseja assinar o Plano Pro, 
                  entre em contato com o suporte.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ ou Benefícios Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-12 text-center"
        >
          <h3 className="text-xl font-semibold text-foreground mb-4">Por que assinar o Plano Pro?</h3>
          <p className="text-muted-foreground mb-6">
            O Plano Pro foi criado para aprofundar sua jornada espiritual com recursos exclusivos que 
            potencializam seu tempo com Deus. Invista em seu crescimento espiritual por menos de R$ 0,50 
            por dia.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 bg-card rounded-xl border border-border">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-foreground mb-1">IA Ilimitada</h4>
              <p className="text-sm text-muted-foreground">
                Faça quantas perguntas quiser ao assistente teológico
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Mais Tempo</h4>
              <p className="text-sm text-muted-foreground">
                Devocionais estendidos de 15 minutos para maior imersão
              </p>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Biblioteca Pro</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a devocionais exclusivos e conteúdos premium
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
