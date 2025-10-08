
# ✅ Checklist Pré-Venda - Minuto com Deus

Use este checklist para garantir que está tudo pronto antes de começar a vender.

---

## 🚀 DEPLOY E INFRAESTRUTURA

### Deploy na Vercel:
- [ ] Conta na Vercel criada
- [ ] Código enviado para Git (GitHub/GitLab)
- [ ] Deploy realizado com sucesso
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `NEXTAUTH_URL` atualizada com URL final
- [ ] App acessível e carregando normalmente

### Domínio Próprio:
- [ ] Domínio `minutocomdeus.com.br` configurado na Vercel
- [ ] Registros DNS adicionados no Registro.br
- [ ] Propagação DNS completa (site abre pelo domínio)
- [ ] HTTPS funcionando (cadeado verde no navegador)
- [ ] Redirecionamento `www` para domínio raiz (ou vice-versa)

---

## 💳 STRIPE - PAGAMENTOS

### Modo Teste (Para testar antes de ativar):
- [ ] Webhook configurado no dashboard Stripe (modo test)
- [ ] `STRIPE_WEBHOOK_SECRET` adicionado na Vercel
- [ ] Teste completo realizado:
  - [ ] Abrir página de planos
  - [ ] Clicar em "Assinar Plano Pro"
  - [ ] Completar checkout com cartão teste: `4242 4242 4242 4242`
  - [ ] Verificar se usuário virou Pro
  - [ ] Testar chat sem limite de perguntas

### Modo Live (Para receber pagamentos REAIS):
- [ ] Conta Stripe ativada e aprovada
- [ ] Dados bancários adicionados
- [ ] Documentos enviados e aprovados
- [ ] Produto/Plano criado em modo Live
- [ ] Price ID de produção copiado
- [ ] Chaves LIVE configuradas na Vercel:
  - [ ] `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
  - [ ] `STRIPE_PRICE_ID` (price_...)
- [ ] Webhook recriado em modo Live
- [ ] Nova `STRIPE_WEBHOOK_SECRET` (Live) configurada
- [ ] Redeploy realizado após mudanças
- [ ] Teste com cartão REAL realizado
- [ ] Confirmação de recebimento na conta bancária

---

## 📝 QUESTÕES LEGAIS (OBRIGATÓRIO!)

### Termos de Uso:
- [ ] Página `/termos` criada
- [ ] Link nos rodapés e formulários de cadastro
- [ ] Inclui:
  - [ ] Identificação da empresa/pessoa responsável
  - [ ] Descrição dos serviços oferecidos
  - [ ] Regras de uso do aplicativo
  - [ ] Política de cancelamento e reembolso
  - [ ] Limitação de responsabilidade
  - [ ] Contato para suporte

### Política de Privacidade:
- [ ] Página `/privacidade` criada
- [ ] Link nos rodapés e formulários de cadastro
- [ ] Conforme LGPD (Lei Geral de Proteção de Dados)
- [ ] Inclui:
  - [ ] Quais dados são coletados
  - [ ] Como os dados são usados
  - [ ] Com quem os dados são compartilhados
  - [ ] Como os dados são protegidos
  - [ ] Direitos do usuário
  - [ ] Como exercer esses direitos
  - [ ] Cookies e rastreamento

### Informações da Empresa:
- [ ] CNPJ ou CPF informado nos termos
- [ ] Endereço completo
- [ ] Email de contato
- [ ] Telefone (opcional, mas recomendado)

---

## 📧 COMUNICAÇÃO COM CLIENTES

### Emails Transacionais:
- [ ] Serviço configurado (Resend, SendGrid, etc.)
- [ ] Email de boas-vindas após cadastro
- [ ] Email de confirmação de pagamento
- [ ] Email de renovação de assinatura
- [ ] Email de falha no pagamento
- [ ] Email de cancelamento confirmado

### Suporte ao Cliente:
- [ ] Email de suporte definido (ex: suporte@minutocomdeus.com.br)
- [ ] Configurado para receber emails
- [ ] Processo de resposta definido
- [ ] SLA de resposta definido (ex: 24-48h)
- [ ] Sistema de tickets (opcional, mas recomendado)

---

## 🧪 TESTES FINAIS

### Funcionalidades Principais:
- [ ] Cadastro de novo usuário
- [ ] Login com usuário existente
- [ ] Recuperação de senha
- [ ] Leitura bíblica diária
- [ ] Chat com IA (5 perguntas grátis)
- [ ] Bloqueio após 5 perguntas
- [ ] Upgrade para Pro
- [ ] Chat ilimitado para Pro
- [ ] Devocional Ativo com áudio
- [ ] Sistema de amigos
- [ ] Planos com amigos
- [ ] Relatórios e insights
- [ ] Dark mode

### Testes em Diferentes Dispositivos:
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS - Safari)
- [ ] Mobile (Android - Chrome)
- [ ] Tablet (iPad, Android)

### Performance:
- [ ] Tempo de carregamento < 3 segundos
- [ ] Imagens otimizadas
- [ ] Sem erros no console do navegador
- [ ] Sem warnings críticos

---

## 📊 MONITORAMENTO (Recomendado)

### Analytics:
- [ ] Google Analytics configurado
- [ ] Events tracking configurado (cliques, conversões, etc.)
- [ ] Goals definidos (assinaturas, cadastros, etc.)

### Monitoramento de Erros:
- [ ] Sentry ou similar configurado (opcional)
- [ ] Alertas de erro configurados
- [ ] Dashboard de monitoramento

### Uptime Monitoring:
- [ ] Serviço como UptimeRobot configurado (opcional)
- [ ] Alertas de downtime
- [ ] Status page (opcional)

---

## 💰 SISTEMA DE PAGAMENTOS

### Fluxo de Assinatura:
- [ ] Usuário consegue ver os planos
- [ ] Usuário consegue clicar em "Assinar"
- [ ] Checkout do Stripe abre corretamente
- [ ] Pagamento é processado
- [ ] Usuário é atualizado para Pro automaticamente
- [ ] Acesso liberado imediatamente

### Gestão de Assinaturas:
- [ ] Usuário consegue ver status da assinatura
- [ ] Usuário consegue cancelar assinatura
- [ ] Portal de billing do Stripe funcionando
- [ ] Usuário consegue atualizar dados de pagamento
- [ ] Usuário recebe acesso até o fim do período pago

### Renovações:
- [ ] Renovação automática funcionando
- [ ] Email enviado antes da renovação
- [ ] Email enviado após renovação bem-sucedida
- [ ] Retry automático em caso de falha (configurar no Stripe)

### Cancelamentos:
- [ ] Usuário consegue cancelar pelo app
- [ ] Webhook processa cancelamento
- [ ] Acesso mantido até fim do período pago
- [ ] Downgrade para plano gratuito após expiração

---

## 🔒 SEGURANÇA

### Básicos:
- [ ] HTTPS funcionando
- [ ] Senhas hashadas (bcrypt)
- [ ] NextAuth configurado corretamente
- [ ] Variáveis de ambiente não expostas
- [ ] Secrets do Stripe não no código
- [ ] Database em servidor seguro

### Avançado (Opcional):
- [ ] Rate limiting em APIs críticas
- [ ] Proteção contra SQL injection
- [ ] Proteção contra XSS
- [ ] Headers de segurança configurados
- [ ] CSP (Content Security Policy)

---

## 📱 MOBILE E PWA

### Responsividade:
- [ ] Layout responsivo em todas as páginas
- [ ] Botões e textos legíveis em mobile
- [ ] Menu de navegação funcional em mobile
- [ ] Formulários funcionais em touch screens

### PWA (Opcional, mas presente):
- [ ] Manifest configurado
- [ ] Ícones PWA presentes
- [ ] App instalável em dispositivos
- [ ] Funciona offline (básico)

---

## 🎨 UX/UI

### Experiência do Usuário:
- [ ] Navegação intuitiva
- [ ] Feedback visual em ações (loading, sucesso, erro)
- [ ] Mensagens de erro claras
- [ ] Onboarding para novos usuários
- [ ] Help text onde necessário

### Design:
- [ ] Cores consistentes
- [ ] Tipografia legível
- [ ] Espaçamentos adequados
- [ ] Imagens de alta qualidade
- [ ] Dark mode funcional

---

## 📢 MARKETING (Preparação)

### Presença Online:
- [ ] Landing page clara sobre o que é o app
- [ ] Screenshots/vídeos do app
- [ ] Depoimentos (se tiver)
- [ ] FAQ básico
- [ ] Blog ou conteúdo educativo (opcional)

### Redes Sociais:
- [ ] Instagram criado
- [ ] Facebook criado (opcional)
- [ ] YouTube (opcional, para tutoriais)
- [ ] Links para redes sociais no app

### SEO Básico:
- [ ] Meta tags configuradas
- [ ] Open Graph tags (para compartilhamento)
- [ ] Sitemap.xml (opcional)
- [ ] robots.txt (opcional)

---

## 🎯 ANTES DE DIVULGAR

### Teste Beta (Recomendado):
- [ ] Convidar 5-10 usuários para testar
- [ ] Coletar feedback
- [ ] Corrigir bugs críticos
- [ ] Ajustar UX baseado no feedback

### Soft Launch:
- [ ] Divulgar para círculo próximo primeiro
- [ ] Monitorar erros e performance
- [ ] Estar preparado para responder dúvidas
- [ ] Ter plano B se algo der errado

### Hard Launch:
- [ ] Tudo do checklist acima está ✅
- [ ] Sistema de pagamento 100% testado
- [ ] Suporte pronto para atender
- [ ] Capacidade de escalar (Vercel faz isso automaticamente)

---

## 🚨 PLANO DE CONTINGÊNCIA

### Se algo der errado:
- [ ] Backup do banco de dados disponível
- [ ] Forma de reverter deploy rapidamente
- [ ] Contato de emergência configurado
- [ ] Processo de refund definido
- [ ] Comunicação com usuários preparada

---

## ✅ CONCLUSÃO

**Quando TUDO acima estiver checado, você está pronto para vender! 🎉**

**Recomendação:** Não pule os itens legais (Termos e Privacidade). São obrigatórios por lei!

---

**Boa sorte com o lançamento! 🚀**
