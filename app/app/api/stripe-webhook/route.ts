
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('❌ Webhook: Assinatura ausente');
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET não configurado');
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('❌ Erro ao validar webhook:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log('✅ Webhook recebido:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('❌ userId não encontrado no metadata da sessão');
    return;
  }

  // Buscar assinatura para obter detalhes
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriodEnd = (subscription as any).current_period_end;

  await prisma.user.update({
    where: { id: userId },
    data: {
      isProMember: true,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    },
  });

  console.log(`✅ Usuário ${userId} ativado como Pro`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user) {
    console.error('❌ Usuário não encontrado para customer:', customerId);
    return;
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const currentPeriodEnd = (subscription as any).current_period_end;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isProMember: isActive,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    },
  });

  console.log(`✅ Assinatura atualizada para usuário ${user.id}. Status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user) {
    console.error('❌ Usuário não encontrado para customer:', customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isProMember: false,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });

  console.log(`✅ Assinatura cancelada para usuário ${user.id}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error('❌ Usuário não encontrado para customer:', customerId);
    return;
  }

  console.log(`⚠️ Falha no pagamento para usuário ${user.id} (${user.email})`);
  // Aqui você pode enviar um email notificando o usuário sobre a falha no pagamento
}
