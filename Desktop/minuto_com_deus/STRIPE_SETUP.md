
# Configuração do Stripe - Minuto com Deus

Este guia explica como configurar a integração do Stripe para processar assinaturas Pro do aplicativo.

## 1. Criar Conta no Stripe

1. Acesse https://dashboard.stripe.com/register
2. Crie sua conta no Stripe
3. Ative o modo de teste (Test Mode) no dashboard

## 2. Obter as Chaves de API

### 2.1 Chaves de API (Secret e Publishable)

1. No dashboard do Stripe, acesse: **Developers > API keys**
2. Copie as seguintes chaves:
   - **Publishable key** (começa com `pk_test_...`)
   - **Secret key** (começa com `sk_test_...`) - Clique em "Reveal test key"

### 2.2 Criar Produto e Preço

1. No dashboard, acesse: **Products > Add Product**
2. Configure o produto:
   - **Name**: Minuto com Deus Pro
   - **Description**: Assinatura mensal com acesso a meditações guiadas exclusivas
   - **Pricing model**: Standard pricing
   - **Price**: R$ 14.90
   - **Billing period**: Monthly
   - **Currency**: BRL (Real Brasileiro)
3. Clique em **Save product**
4. Na página do produto, copie o **Price ID** (começa com `price_...`)

## 3. Configurar Webhook

### 3.1 Criar Endpoint do Webhook

1. No dashboard, acesse: **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/stripe-webhook`
     - Para desenvolvimento local: Use ngrok ou similar
     - Exemplo: `https://abc123.ngrok.io/api/stripe-webhook`
   - **Description**: Webhook Minuto com Deus
   - **Events to send**: Selecione os seguintes eventos:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
4. Clique em **Add endpoint**
5. Copie o **Signing secret** (começa com `whsec_...`)

## 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```bash
# Stripe - Chaves de API
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
STRIPE_PRICE_ID=price_seu_price_id_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

**⚠️ IMPORTANTE**: Nunca commite o arquivo `.env` com suas chaves reais no Git!

## 5. Testar a Integração

### 5.1 Testar Checkout (Modo Teste)

Use os cartões de teste do Stripe:

**Cartão de Sucesso:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: 12/25)
- CVC: Qualquer 3 dígitos (ex: 123)
- CEP: Qualquer (ex: 12345-678)

**Cartão com Falha de Pagamento:**
- Número: `4000 0000 0000 0341`
- Outros dados: Mesmos acima

### 5.2 Testar Webhook Localmente

Para testar webhooks em ambiente local:

1. Instale o Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# ou
scoop install stripe
```

2. Autentique:
```bash
stripe login
```

3. Encaminhe eventos para seu servidor local:
```bash
stripe listen --forward-to http://localhost:3000/api/stripe-webhook
```

4. O CLI exibirá um webhook signing secret. Use-o temporariamente no `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 6. Fluxo de Pagamento

### Passo a Passo:

1. **Usuário clica em "Assinar Agora"** na página `/planos`
2. Sistema cria uma sessão de checkout via `/api/create-checkout-session`
3. Usuário é redirecionado para o Stripe Checkout
4. Usuário preenche dados do cartão
5. Stripe processa pagamento
6. Stripe envia evento `checkout.session.completed` via webhook
7. Sistema atualiza `isProMember = true` no banco de dados
8. Usuário é redirecionado para `/planos?success=true`

### Eventos do Webhook:

- `checkout.session.completed`: Primeira assinatura confirmada
- `customer.subscription.updated`: Renovação ou mudança de status
- `customer.subscription.deleted`: Cancelamento
- `invoice.payment_failed`: Falha no pagamento recorrente

## 7. Gerenciar Assinaturas

### Portal do Cliente (Billing Portal)

Para permitir que usuários gerenciem suas próprias assinaturas:

1. No dashboard: **Settings > Billing > Customer portal**
2. Ative: **Enable customer portal**
3. Configure as opções permitidas:
   - ✅ Cancel subscriptions
   - ✅ Update payment methods
   - ✅ View invoices

Depois, você pode criar um botão que redireciona para o portal:

```typescript
// Em /api/create-portal-session/route.ts
const session = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${origin}/configuracoes`,
});
```

## 8. Produção (Live Mode)

Quando estiver pronto para produção:

1. Ative o **Live mode** no dashboard do Stripe
2. Obtenha as chaves **LIVE** (começam com `pk_live_` e `sk_live_`)
3. Crie um novo produto com preço em modo LIVE
4. Configure o webhook para a URL de produção
5. Atualize as variáveis de ambiente com as chaves LIVE
6. Faça a verificação da conta no Stripe (dados bancários, documentos, etc.)

## 9. Segurança

✅ **Boas Práticas:**
- Nunca exponha `STRIPE_SECRET_KEY` no frontend
- Sempre valide webhooks usando `STRIPE_WEBHOOK_SECRET`
- Use HTTPS em produção
- Nunca armazene dados de cartão no seu banco
- Log apenas metadados, nunca dados sensíveis

## 10. Recursos Adicionais

- 📚 [Documentação Stripe](https://stripe.com/docs)
- 🧪 [Cartões de Teste](https://stripe.com/docs/testing)
- 🎓 [Stripe University](https://stripe.com/education)
- 💬 [Suporte Stripe](https://support.stripe.com/)

---

**Dúvidas?** Consulte a documentação oficial do Stripe ou entre em contato com o suporte.
