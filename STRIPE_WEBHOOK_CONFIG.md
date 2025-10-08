
# 🔔 Guia de Configuração do Webhook do Stripe

## 📋 O que o Webhook Precisa Ouvir?

Seu webhook está configurado para ouvir os seguintes eventos:

### ✅ Eventos Essenciais (Obrigatórios):

1. **`checkout.session.completed`** 
   - Quando: Após o usuário completar o pagamento
   - Função: Ativa a conta Pro do usuário
   - Atualiza: `isProMember`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`

2. **`customer.subscription.updated`**
   - Quando: Quando a assinatura é renovada, modificada ou tem mudança de status
   - Função: Mantém o status Pro sincronizado
   - Atualiza: Status da assinatura, data de renovação

3. **`customer.subscription.deleted`**
   - Quando: Quando o usuário cancela a assinatura
   - Função: Remove o status Pro do usuário
   - Atualiza: `isProMember = false`, limpa dados da assinatura

4. **`invoice.payment_failed`**
   - Quando: Quando o pagamento de renovação falha
   - Função: Notifica sobre falha no pagamento (para você implementar envio de email)

---

## 🔧 Como Configurar o Webhook no Stripe (Dashboard)

### Passo 1: Acessar o Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Faça login na sua conta Stripe

### Passo 2: Criar Novo Endpoint de Webhook

1. Clique em **"Add endpoint"** (Adicionar endpoint)
2. No campo **"Endpoint URL"**, você tem 2 opções:

   **OPÇÃO A - Para Testes Locais (Recomendado para começar):**
   ```
   Use o Stripe CLI (veja seção abaixo)
   ```

   **OPÇÃO B - Para Produção/Deploy:**
   ```
   https://seu-dominio.com/api/stripe-webhook
   ```
   (Substitua `seu-dominio.com` pelo domínio do seu app quando fizer deploy)

### Passo 3: Selecionar Eventos

Na seção **"Select events to listen to"**:

1. Marque os seguintes eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`

2. Ou use "Select all..." e depois filtre por esses 4 eventos

### Passo 4: Copiar a Webhook Secret

1. Após criar o endpoint, o Stripe irá gerar uma **Signing secret**
2. Ela terá o formato: `whsec_...`
3. **COPIE ESSA SECRET** e adicione ao seu arquivo `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_sua_secret_aqui
```

---

## 🧪 Como Testar Localmente (RECOMENDADO)

Para testar o webhook localmente ANTES do deploy, use o **Stripe CLI**:

### 1. Instalar o Stripe CLI

**MacOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
Baixe de: https://github.com/stripe/stripe-cli/releases/latest

### 2. Fazer Login no Stripe CLI

```bash
stripe login
```

Isso abrirá o navegador para você autorizar.

### 3. Iniciar o Servidor Local

Em um terminal, rode:
```bash
cd /home/ubuntu/minuto_com_deus/app
yarn dev
```

### 4. Configurar o Webhook Local (em outro terminal)

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Esse comando irá:
- ✅ Criar um webhook temporário
- ✅ Mostrar uma **webhook secret** (copie ela)
- ✅ Encaminhar todos os eventos do Stripe para seu localhost

**IMPORTANTE:** Copie a secret que aparece (formato: `whsec_...`) e atualize seu `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_secret_do_cli_aqui
```

### 5. Testar Eventos

Abra OUTRO terminal e rode:

```bash
# Testar checkout completo
stripe trigger checkout.session.completed

# Testar renovação de assinatura
stripe trigger customer.subscription.updated

# Testar cancelamento
stripe trigger customer.subscription.deleted

# Testar falha de pagamento
stripe trigger invoice.payment_failed
```

### 6. Observar os Logs

No terminal onde você rodou `stripe listen`, você verá:
```
✅ checkout.session.completed -> POST http://localhost:3000/api/stripe-webhook [200]
```

E no terminal do `yarn dev`, verá os logs do seu código:
```
✅ Webhook recebido: checkout.session.completed
✅ Usuário xyz ativado como Pro
```

---

## 🚀 Testar o Fluxo Completo (Checkout Real)

### 1. Iniciar o App

```bash
cd /home/ubuntu/minuto_com_deus/app
yarn dev
```

### 2. Configurar Webhook Local

Em outro terminal:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### 3. Acessar o App

1. Abra: http://localhost:3000
2. Faça login
3. Vá para: http://localhost:3000/planos
4. Clique em "Assinar Plano Pro"
5. Use o cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura (ex: 12/25)
   - CVC: Qualquer 3 dígitos (ex: 123)
   - CEP: Qualquer (ex: 12345)

### 4. Verificar o Resultado

Após o pagamento:
- ✅ Você será redirecionado de volta ao app
- ✅ O webhook receberá o evento `checkout.session.completed`
- ✅ O usuário será atualizado como Pro no banco de dados
- ✅ Você verá nos logs: "✅ Usuário xyz ativado como Pro"

---

## ✅ Checklist de Configuração

- [x] Chaves do Stripe configuradas no `.env`:
  - [x] STRIPE_SECRET_KEY
  - [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - [x] STRIPE_PRICE_ID
- [ ] STRIPE_WEBHOOK_SECRET configurado no `.env`
- [ ] Stripe CLI instalado (para testes locais)
- [ ] Webhook local configurado com `stripe listen`
- [ ] Teste realizado com cartão `4242 4242 4242 4242`
- [ ] Logs verificados no terminal
- [ ] Banco de dados verificado (usuário virou Pro?)

---

## 🐛 Problemas Comuns

### 1. Erro: "Webhook signature verification failed"

**Causa:** A STRIPE_WEBHOOK_SECRET está incorreta ou não está configurada.

**Solução:**
- Para testes locais: Use a secret que aparece quando você roda `stripe listen`
- Para produção: Use a secret do dashboard do Stripe (https://dashboard.stripe.com/test/webhooks)

### 2. Evento recebido mas usuário não vira Pro

**Possíveis causas:**
- userId não está sendo passado no metadata do checkout
- Erro no banco de dados

**Como verificar:**
- Olhe os logs do webhook no terminal
- Procure por: "❌ userId não encontrado no metadata da sessão"

### 3. Webhook não recebe nada

**Causas:**
- Stripe CLI não está rodando (`stripe listen`)
- URL do webhook está errada
- Firewall bloqueando a conexão

---

## 📚 Links Úteis

- Dashboard do Stripe: https://dashboard.stripe.com/test/webhooks
- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Webhook Events: https://stripe.com/docs/api/events/types
- Cartões de Teste: https://stripe.com/docs/testing

---

## 🎯 Próximos Passos para Produção

Quando você fizer o deploy do app:

1. **Criar webhook no dashboard do Stripe**
   - URL: `https://seu-dominio.com/api/stripe-webhook`
   - Eventos: os mesmos 4 eventos

2. **Atualizar variáveis de ambiente**
   - Use as chaves LIVE do Stripe (não test)
   - Use a webhook secret do dashboard
   - Configure no seu serviço de hosting (Vercel, Railway, etc.)

3. **Testar no ambiente de produção**
   - Faça um checkout real
   - Verifique se o webhook é chamado
   - Confirme que o usuário vira Pro

---

## 🔒 Segurança

- ✅ Webhook está validando assinatura
- ✅ Usa HTTPS em produção
- ✅ Não expõe segredos no client-side
- ✅ Verifica se userId existe antes de atualizar

---

**Dúvidas?** Teste primeiro localmente com o Stripe CLI antes de ir para produção!
