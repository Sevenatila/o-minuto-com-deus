
# 🚀 Guia Completo de Deploy na Vercel

## ✅ Pré-requisitos
- Seu app está pronto e testado ✅
- Todas as funcionalidades implementadas ✅
- Build compilando sem erros ✅

---

## 📦 PASSO 1: Preparar o Código

### 1.1. Baixar os arquivos do projeto

Você tem 2 opções:

**Opção A: Usar Git (Recomendado)**
```bash
# Se você tem Git instalado localmente:
git clone <url-do-repositorio>
cd minuto_com_deus
```

**Opção B: Download Direto**
- Baixe todos os arquivos da pasta `/home/ubuntu/minuto_com_deus/app`
- Mantenha a estrutura de pastas intacta

---

## 🌐 PASSO 2: Criar Conta na Vercel

### 2.1. Acessar Vercel
- Acesse: https://vercel.com
- Clique em **"Sign Up"** (Criar Conta)

### 2.2. Escolher método de registro
Você pode escolher:
- ✅ **GitHub** (Recomendado - facilita deploys futuros)
- GitLab
- Bitbucket
- Email

### 2.3. Completar o cadastro
- Siga as instruções na tela
- Confirme seu email
- **É 100% GRATUITO para este tipo de projeto**

---

## 🚀 PASSO 3: Fazer Deploy

### 3.1. Opção A: Deploy via Git (Recomendado)

#### a) Criar repositório no GitHub:
1. Acesse: https://github.com/new
2. Nome do repositório: `minuto-com-deus`
3. Deixe **Privado** (se quiser)
4. Clique em **"Create repository"**

#### b) Fazer upload do código:
```bash
# No terminal, dentro da pasta do projeto:
cd /caminho/para/minuto_com_deus/app

# Inicializar git
git init
git add .
git commit -m "Deploy inicial - Minuto com Deus"

# Conectar ao GitHub (use o URL que aparece na tela)
git remote add origin https://github.com/SEU_USUARIO/minuto-com-deus.git
git branch -M main
git push -u origin main
```

#### c) Importar na Vercel:
1. No dashboard da Vercel, clique em **"Add New..."**
2. Clique em **"Project"**
3. Clique em **"Import Git Repository"**
4. Selecione o repositório `minuto-com-deus`
5. Clique em **"Import"**

### 3.2. Opção B: Deploy Manual (Upload)

1. No dashboard da Vercel, clique em **"Add New..."**
2. Clique em **"Project"**
3. Clique na aba **"Deploy"** ou **"Import Project"**
4. Arraste a pasta do projeto ou clique para selecionar
5. A Vercel detecta automaticamente que é Next.js ✅

---

## ⚙️ PASSO 4: Configurar Variáveis de Ambiente

### 4.1. Na tela de deploy, clique em **"Environment Variables"**

### 4.2. Adicionar TODAS as variáveis:

```env
# NextAuth
NEXTAUTH_SECRET=Bng97oc8HN50SF9lewlwg5nNtkZIdcZS
NEXTAUTH_URL=https://SEU_DOMINIO_VERCEL.vercel.app

# Database
DATABASE_URL=postgresql://role_a260f0b25:JRUBdkHyy3Z8Jyx2tV0MzNNUMUOoiMGB@db-a260f0b25.db002.hosteddb.reai.io:5432/a260f0b25?connect_timeout=15

# Abacus AI (para o chat teológico)
ABACUSAI_API_KEY=e074df21dadf4a80b1cf534545ebaae9

# Stripe (chaves de TESTE por enquanto)
STRIPE_SECRET_KEY=sua_chave_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_stripe_publishable
STRIPE_PRICE_ID=seu_price_id
```

⚠️ **IMPORTANTE:**
- Substitua `SEU_DOMINIO_VERCEL` pelo domínio que a Vercel vai gerar
- Você pode atualizar isso depois do primeiro deploy

### 4.3. Clicar em **"Deploy"**

Aguarde de 2-5 minutos enquanto a Vercel:
- ✅ Instala as dependências
- ✅ Compila o projeto
- ✅ Otimiza os recursos
- ✅ Publica o site

---

## 🎉 PASSO 5: Primeiro Acesso

### 5.1. Pegar a URL
Após o deploy, você verá algo como:
```
https://minuto-com-deus.vercel.app
```

### 5.2. Atualizar NEXTAUTH_URL
1. Copie a URL completa
2. Na Vercel, vá em **"Settings"** > **"Environment Variables"**
3. Edite a variável `NEXTAUTH_URL`
4. Cole a URL: `https://minuto-com-deus.vercel.app`
5. Clique em **"Redeploy"** para aplicar a mudança

### 5.3. Testar o app
Acesse a URL e teste:
- ✅ Login/Registro
- ✅ Leitura da Bíblia
- ✅ Chat com IA
- ✅ Devocional Ativo
- ⚠️ **NÃO teste pagamentos ainda** (webhook não configurado)

---

## 💳 PASSO 6: Configurar Webhook do Stripe

### 6.1. Pegar a URL do webhook
Sua URL do webhook será:
```
https://SEU_DOMINIO.vercel.app/api/stripe-webhook
```

Exemplo:
```
https://minuto-com-deus.vercel.app/api/stripe-webhook
```

### 6.2. Configurar no Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"** (Adicionar destino)
3. Cole a URL do webhook
4. Em **"Events to send"** (Eventos a enviar), selecione:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
5. Clique em **"Add endpoint"**

### 6.3. Copiar a Signing Secret

Após criar o webhook, você verá:
```
Signing secret: whsec_xxxxxxxxxxxxxx
```

1. Copie essa secret
2. Vá na Vercel: **"Settings"** > **"Environment Variables"**
3. Adicione uma nova variável:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxxx` (cole a secret)
4. Clique em **"Save"**
5. Clique em **"Redeploy"** para aplicar

---

## 🌐 PASSO 7: Adicionar Domínio Próprio (minutocomdeus.com.br)

### 7.1. Na Vercel

1. No projeto, vá em **"Settings"** > **"Domains"**
2. Digite: `minutocomdeus.com.br`
3. Clique em **"Add"**
4. A Vercel vai mostrar os registros DNS necessários

### 7.2. No Registro.br

1. Acesse: https://registro.br
2. Faça login com sua conta
3. Vá em **"Meus domínios"**
4. Clique em `minutocomdeus.com.br`
5. Vá em **"Editar Zona DNS"**

### 7.3. Adicionar Registros DNS

A Vercel vai pedir para adicionar registros como:

**Para o domínio raiz (minutocomdeus.com.br):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Para www (www.minutocomdeus.com.br):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 7.4. Aguardar Propagação

- Tempo: 5 minutos a 48 horas
- Geralmente: 15-30 minutos
- A Vercel mostra status de verificação

### 7.5. Configurar SSL (Automático)

A Vercel configura HTTPS automaticamente ✅
Aguarde a verificação do domínio.

---

## 🔒 PASSO 8: Ativar Modo LIVE do Stripe (Produção Real)

⚠️ **IMPORTANTE:** Só faça isso quando estiver 100% pronto para receber pagamentos REAIS!

### 8.1. Ativar Conta Stripe

1. Acesse: https://dashboard.stripe.com
2. Clique em **"Activate Account"**
3. Preencha todos os dados solicitados:
   - Informações da empresa/pessoa
   - Documentos (CPF/CNPJ)
   - Conta bancária para recebimentos
4. Aguarde aprovação (pode levar 1-2 dias)

### 8.2. Pegar Chaves LIVE

1. Alterne para **"Live mode"** no dashboard
2. Vá em **"Developers"** > **"API keys"**
3. Copie as chaves LIVE:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)

### 8.3. Pegar Price ID de Produção

1. Vá em **"Products"** no dashboard (modo Live)
2. Crie seu produto/plano (se ainda não criou)
3. Copie o **Price ID** (algo como `price_xxxxxxxxxxxxx`)

### 8.4. Atualizar Variáveis na Vercel

Na Vercel, vá em **"Settings"** > **"Environment Variables"** e atualize:

```env
# Substituir as chaves de teste pelas LIVE:
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
```

### 8.5. Recriar Webhook em Modo Live

1. Vá em https://dashboard.stripe.com/webhooks (modo Live)
2. Adicione o endpoint novamente (mesmo processo do Passo 6)
3. Copie a nova Signing Secret (será diferente!)
4. Atualize `STRIPE_WEBHOOK_SECRET` na Vercel

### 8.6. Redeploy Final

Clique em **"Redeploy"** na Vercel para aplicar todas as mudanças.

---

## ✅ CHECKLIST FINAL

Antes de divulgar seu app, confirme:

### Funcionalidades:
- [ ] Login e registro funcionando
- [ ] Leitura bíblica carregando
- [ ] Chat com IA respondendo
- [ ] Devocional Ativo tocando áudio
- [ ] Sistema de amigos funcionando
- [ ] Relatórios gerando dados
- [ ] Dark mode alternando

### Pagamentos (Modo Teste):
- [ ] Página de planos abrindo
- [ ] Checkout do Stripe abrindo
- [ ] Pagamento com cartão de teste funcionando
- [ ] Usuário virando Pro após pagamento
- [ ] Limite de perguntas removido para Pro

### Pagamentos (Modo Live):
- [ ] Conta Stripe ativada e aprovada
- [ ] Chaves LIVE configuradas
- [ ] Webhook LIVE configurado
- [ ] Teste com cartão REAL realizado
- [ ] Recebimento na conta bancária confirmado

### Domínio:
- [ ] Domínio próprio configurado
- [ ] HTTPS funcionando (cadeado verde)
- [ ] Redirecionamento www funcionando

### Performance:
- [ ] App carregando rápido (< 3s)
- [ ] Imagens otimizadas
- [ ] Sem erros no console do navegador

### Legal:
- [ ] Termos de Uso adicionados (próxima etapa)
- [ ] Política de Privacidade adicionada (próxima etapa)
- [ ] Email de suporte configurado

---

## 📞 SUPORTE

### Se algo der errado:

**Build falhando na Vercel:**
- Verifique se todas as variáveis de ambiente foram adicionadas
- Confira se não tem erro de digitação nas variáveis
- Veja os logs completos na aba "Deployments"

**Webhook não funcionando:**
- Confirme que a URL está correta
- Verifique se a Signing Secret foi copiada corretamente
- Teste enviando evento de teste pelo dashboard do Stripe

**Domínio não resolvendo:**
- Aguarde até 48h pela propagação DNS
- Confirme que os registros DNS foram salvos no Registro.br
- Use https://dnschecker.org para verificar propagação

**Pagamentos não processando:**
- Verifique se o webhook está recebendo eventos (veja logs no Stripe)
- Confirme que o STRIPE_WEBHOOK_SECRET está correto
- Teste o fluxo completo em modo de teste primeiro

---

## 🎉 PRONTO!

Seu app **Minuto com Deus** está no ar! 🚀

**URL Temporária:** https://minuto-com-deus.vercel.app
**URL Final:** https://minutocomdeus.com.br (após configurar DNS)

---

## 📋 PRÓXIMOS PASSOS (Para vender de verdade)

Agora que o app está no ar, você precisa:

1. ✅ **Adicionar Termos de Uso** (OBRIGATÓRIO)
2. ✅ **Adicionar Política de Privacidade** (OBRIGATÓRIO)
3. ✅ **Configurar Emails Transacionais** (muito recomendado)
4. ✅ **Adicionar Analytics** (Google Analytics, etc.)
5. ✅ **Ativar Modo Live do Stripe** (quando estiver pronto para vender)

---

**Qualquer dúvida, estou aqui para ajudar! 😊**
