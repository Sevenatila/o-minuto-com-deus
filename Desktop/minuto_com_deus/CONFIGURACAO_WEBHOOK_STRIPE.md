
# 🔗 Configuração do Webhook do Stripe - Passo a Passo

Este guia mostra EXATAMENTE como configurar o webhook do Stripe após fazer o deploy.

---

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa:
- ✅ App já está no ar (Vercel ou outro)
- ✅ URL definitiva do app (ex: `https://minuto-com-deus.vercel.app`)
- ✅ Conta no Stripe criada

---

## 🌐 PASSO 1: Pegar a URL do Webhook

Sua URL do webhook será sempre:
```
https://SEU_DOMINIO/api/stripe-webhook
```

**Exemplos:**
- URL Vercel: `https://minuto-com-deus.vercel.app/api/stripe-webhook`
- Domínio próprio: `https://minutocomdeus.com.br/api/stripe-webhook`

⚠️ **IMPORTANTE:** Use a URL EXATA do seu deploy!

---

## 🔧 PASSO 2: Acessar o Dashboard do Stripe

### 2.1. Fazer Login
- Acesse: https://dashboard.stripe.com
- Faça login com sua conta

### 2.2. Escolher o Modo

#### Para TESTES:
- No canto superior esquerdo, certifique-se de estar em **"Test mode"**
- Toggle deve mostrar: **"Viewing test data"**

#### Para PRODUÇÃO:
- Alterne para **"Live mode"**
- Toggle deve mostrar: **"Viewing live data"**

⚠️ **Comece sempre em Test mode!**

---

## ➕ PASSO 3: Adicionar o Webhook

### 3.1. Navegar para Webhooks
1. No menu lateral, clique em **"Developers"**
2. Clique em **"Webhooks"**
3. Você verá a lista de webhooks (provavelmente vazia)

### 3.2. Criar Novo Webhook
1. Clique no botão **"Add endpoint"** (ou "+ Add an endpoint")
2. Uma tela de configuração vai abrir

---

## ⚙️ PASSO 4: Configurar o Endpoint

### 4.1. Preencher a URL
Na primeira caixa, **"Endpoint URL"**, cole:
```
https://minuto-com-deus.vercel.app/api/stripe-webhook
```
(Substitua pelo seu domínio real!)

### 4.2. Descrição (Opcional)
No campo **"Description"**, você pode colocar:
```
Webhook para Minuto com Deus - Processar assinaturas
```

### 4.3. Versão da API
Deixe em **"Latest version"** ou **"2025-06-30.basil"**

---

## 📡 PASSO 5: Selecionar Eventos

### 5.1. Clicar em "Select events"
Na seção **"Events to send"**, clique no botão **"Select events"**

### 5.2. Escolher os Eventos Necessários

Você precisa selecionar **4 eventos específicos**:

#### ✅ 1. checkout.session.completed
1. Na busca, digite: `checkout`
2. Expanda **"Checkout"**
3. Marque: ☑️ **"checkout.session.completed"**

#### ✅ 2. customer.subscription.updated
1. Na busca, digite: `subscription`
2. Expanda **"Customer"** > **"Subscription"**
3. Marque: ☑️ **"customer.subscription.updated"**

#### ✅ 3. customer.subscription.deleted
1. Ainda em **"Customer"** > **"Subscription"**
2. Marque: ☑️ **"customer.subscription.deleted"**

#### ✅ 4. invoice.payment_failed
1. Na busca, digite: `invoice`
2. Expanda **"Invoice"**
3. Marque: ☑️ **"invoice.payment_failed"**

### 5.3. Confirmar Seleção
- Clique em **"Add events"** no final da página
- Você deve ver os 4 eventos listados

---

## ✅ PASSO 6: Finalizar Criação

### 6.1. Revisar Configuração
Confira se está tudo certo:
- ✅ URL do endpoint
- ✅ 4 eventos selecionados
- ✅ Versão da API

### 6.2. Criar o Endpoint
Clique no botão **"Add endpoint"** no final da página

---

## 🔐 PASSO 7: Copiar a Signing Secret

### 7.1. Webhook Criado!
Após criar, você será levado para a página de detalhes do webhook.

### 7.2. Localizar a Signing Secret
Na parte superior, você verá:
```
Signing secret
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

[Click to reveal] ou [Reveal]
```

### 7.3. Copiar a Secret
1. Clique em **"Click to reveal"** ou **"Reveal"**
2. Copie a string completa: `whsec_...`
3. Guarde em um lugar seguro (você vai precisar!)

---

## 🔧 PASSO 8: Adicionar na Vercel

### 8.1. Acessar Configurações da Vercel
1. Vá para: https://vercel.com
2. Acesse seu projeto **"minuto-com-deus"**
3. Clique na aba **"Settings"**
4. No menu lateral, clique em **"Environment Variables"**

### 8.2. Adicionar Nova Variável
1. Clique em **"Add New"** ou **"Add"**
2. Preencha:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxx...` (cole a secret copiada)
3. Selecione em quais ambientes usar:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
4. Clique em **"Save"**

### 8.3. Redeploy
1. Volte para a aba **"Deployments"**
2. Clique no menu **"..."** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar (~2 minutos)

---

## 🧪 PASSO 9: Testar o Webhook

### 9.1. Enviar Evento de Teste (Pelo Dashboard)
1. Volte para o Dashboard do Stripe
2. Vá em **"Developers"** > **"Webhooks"**
3. Clique no webhook que você criou
4. Clique no botão **"Send test webhook"** no canto superior direito
5. Escolha: **"checkout.session.completed"**
6. Clique em **"Send test event"**

### 9.2. Verificar Resposta
Após enviar, você verá:
```
✅ 200 OK - Successful
```

Se viu isso, **FUNCIONOU!** 🎉

### 9.3. Se Deu Erro (4xx ou 5xx)
Possíveis causas:
- ❌ URL do webhook está incorreta
- ❌ Signing secret não foi adicionada ou está errada
- ❌ App não fez redeploy após adicionar a secret

**Solução:**
1. Revise a URL
2. Confirme a secret na Vercel
3. Faça redeploy
4. Tente novamente

---

## 🎯 PASSO 10: Testar Fluxo Completo

### 10.1. Fazer um Checkout de Teste
1. Acesse seu app
2. Vá em **"Planos"**
3. Clique em **"Assinar Plano Pro"**
4. No checkout do Stripe, use:
   - **Cartão:** `4242 4242 4242 4242`
   - **Data:** Qualquer data futura (ex: `12/34`)
   - **CVV:** Qualquer 3 dígitos (ex: `123`)
   - **CEP:** Qualquer CEP (ex: `12345`)
5. Complete o checkout

### 10.2. Verificar no Stripe
1. Volte para o Dashboard do Stripe
2. Vá em **"Developers"** > **"Webhooks"**
3. Clique no seu webhook
4. Você verá um novo evento: **"checkout.session.completed"**
5. Status deve ser: **200**

### 10.3. Verificar no App
1. Recarregue a página do seu app
2. Vá em **"Configurações"**
3. Você deve ver: **"Plano: Pro ✅"**
4. Tente fazer mais de 5 perguntas no chat
5. Deve funcionar sem bloqueio!

---

## 🚀 PASSO 11: Configurar Modo LIVE (Produção)

⚠️ **Só faça isso quando estiver pronto para receber pagamentos REAIS!**

### 11.1. Repetir Todo o Processo em Live Mode
1. No Dashboard do Stripe, alterne para **"Live mode"**
2. Siga todos os passos acima novamente (Passos 3-7)
3. A Signing Secret será **DIFERENTE** em Live mode

### 11.2. Atualizar Variável na Vercel
1. Na Vercel, vá em **"Environment Variables"**
2. Edite `STRIPE_WEBHOOK_SECRET`
3. Substitua pela **nova secret** (do modo Live)
4. Clique em **"Save"**
5. Faça **"Redeploy"**

### 11.3. Testar com Cartão Real
Faça um checkout real e verifique se:
- ✅ Pagamento foi processado
- ✅ Você recebeu o dinheiro na conta Stripe
- ✅ Usuário virou Pro no app
- ✅ Webhook retornou 200

---

## 📊 MONITORAMENTO DE WEBHOOKS

### Ver Histórico de Eventos
1. Dashboard Stripe > **"Developers"** > **"Webhooks"**
2. Clique no seu webhook
3. Você verá todos os eventos enviados
4. Status de cada tentativa (200, 400, 500, etc.)
5. Payload completo de cada evento

### Reenviar Eventos
Se um evento falhar:
1. Clique no evento que falhou
2. Clique em **"Resend"**
3. O Stripe tenta novamente

---

## ❓ TROUBLESHOOTING

### Erro 401 - Unauthorized
- **Causa:** Signing secret incorreta ou não configurada
- **Solução:** Verifique a secret na Vercel e faça redeploy

### Erro 404 - Not Found
- **Causa:** URL do webhook está incorreta
- **Solução:** Verifique se a URL tem `/api/stripe-webhook` no final

### Erro 500 - Internal Server Error
- **Causa:** Erro no código do webhook
- **Solução:** Veja os logs da Vercel em "Deployments" > "Functions"

### Webhook não recebe eventos
- **Causa:** App não está enviando metadados ou webhook não está configurado
- **Solução:** Verifique se o checkout está incluindo `metadata: { userId: ... }`

---

## ✅ CHECKLIST FINAL

Antes de considerar concluído:
- [ ] Webhook criado no Stripe (Test mode)
- [ ] 4 eventos selecionados
- [ ] Signing secret copiada
- [ ] Secret adicionada na Vercel
- [ ] Redeploy realizado
- [ ] Evento de teste enviado com sucesso (200)
- [ ] Checkout de teste completo realizado
- [ ] Usuário virou Pro após checkout
- [ ] Webhook registrou o evento com status 200

**Para produção:**
- [ ] Webhook recriado em Live mode
- [ ] Nova signing secret (Live) na Vercel
- [ ] Teste com cartão real realizado

---

## 🎉 CONCLUSÃO

Se tudo acima está ✅, seu webhook está **100% funcional!**

Agora os pagamentos serão processados automaticamente e os usuários virão Pro sem intervenção manual.

---

**Qualquer dúvida, consulte a documentação oficial do Stripe:**
https://stripe.com/docs/webhooks

---

**Parabéns! Sistema de pagamentos configurado! 💰**
