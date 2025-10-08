
# 🤖 MÓDULO V: CHATBOT TEOLÓGICO RAG & IA - IMPLEMENTADO

**Data de Implementação:** 2 de Outubro de 2025  
**Status:** ✅ Completo e Funcional

---

## 📋 VISÃO GERAL

O Módulo V implementa a camada de IA proprietária do aplicativo "Minuto com Deus", com foco em fornecer assistência teológica avançada, reflexões personalizadas e recursos de estudo bíblico aprofundado.

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1. **Chatbot Teológico RAG - "Fale com a Bíblia"** 🗣️

Um assistente de IA especializado em teologia que:
- ✅ Responde perguntas sobre passagens bíblicas
- ✅ Usa arquitetura RAG (Retrieval-Augmented Generation)
- ✅ Contextualiza respostas baseado no histórico de leitura do usuário
- ✅ Integra dados de Chapter_Requests e Journal Insights
- ✅ Cita versículos relevantes automaticamente
- ✅ Mantém histórico de conversas

**Características Técnicas:**
- **Modelo:** GPT-4.1-mini
- **Streaming:** Respostas em tempo real
- **Context Window:** Últimas 10 mensagens + contexto do usuário
- **Temperatura:** 0.7 (equilíbrio entre criatividade e precisão)

**Regras do Sistema:**
- Responde apenas com base nas Escrituras
- Cita versículos específicos (Livro Capítulo:Versículo)
- Tom respeitoso, acolhedor e pastoral
- Usa versão Almeida da Bíblia em português

### 2. **Reflexões Diárias Personalizadas** ✨

Sistema de geração de reflexões customizadas que:
- ✅ Analisa os temas mais acessados pelo usuário
- ✅ Considera insights do diário espiritual
- ✅ Usa preferências do onboarding
- ✅ Gera reflexões de 200-300 palavras
- ✅ Inclui referências bíblicas relevantes
- ✅ Permite marcar como lida

**Personalização Baseada Em:**
- Capítulos mais lidos (ChapterMetric)
- Insights e gratidões do Journal
- Preferências de onboarding (ansiedade, finanças, etc.)

**Estrutura da Reflexão:**
- **Tema Principal:** Identificado pela IA
- **Conteúdo:** Mensagem inspiradora e prática
- **Referências Bíblicas:** Mínimo 2 passagens relevantes
- **Aplicação Prática:** Como aplicar no dia a dia

### 3. **Significado Original (Grego/Hebraico)** 📖

Ferramenta de estudo de palavras que:
- ✅ Identifica a palavra original (Grego Koiné ou Hebraico Bíblico)
- ✅ Fornece transliteração
- ✅ Explica significado e nuances semânticas
- ✅ Contextualiza uso bíblico
- ✅ Cache de 7 dias para respostas

**Processo:**
1. Identifica idioma original (Antigo Testamento = Hebraico, Novo = Grego)
2. Busca palavra original e transliteração
3. Explica significado contextual
4. Menciona outros usos bíblicos da palavra

---

## 🗄️ SCHEMA DO BANCO DE DADOS

### Tabelas Adicionadas:

#### **ChatConversation**
```prisma
model ChatConversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  ChatMessage[]
}
```

#### **ChatMessage**
```prisma
model ChatMessage {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // 'user' ou 'assistant'
  content        String   @db.Text
  context        Json?    // Passagens bíblicas usadas
  createdAt      DateTime @default(now())
}
```

#### **DailyReflection**
```prisma
model DailyReflection {
  id              String    @id @default(cuid())
  userId          String
  date            DateTime  @default(now())
  theme           String
  content         String    @db.Text
  bibleReferences Json?
  wasRead         Boolean   @default(false)
  readAt          DateTime?
}
```

#### **OriginalMeaning**
```prisma
model OriginalMeaning {
  id              String   @id @default(cuid())
  userId          String
  word            String
  originalWord    String
  language        String   // 'grego' ou 'hebraico'
  transliteration String?
  definition      String   @db.Text
  context         String?  @db.Text
  book            String?
  chapter         Int?
  verseNumber     Int?
  savedAt         DateTime @default(now())
}
```

---

## 🔌 ENDPOINTS DA API

### **Chat Teológico**

#### `POST /api/chat-teologico`
Envia mensagem para o chatbot e recebe resposta streaming.

**Request Body:**
```json
{
  "message": "O que significa fé?",
  "conversationId": "optional_conversation_id"
}
```

**Response:** Server-Sent Events (SSE)
```
data: {"type": "content", "content": "Fé, segundo as Escrituras..."}
data: {"type": "metadata", "conversationId": "abc123"}
```

#### `GET /api/chat-teologico`
Retorna lista de conversas do usuário.

**Response:**
```json
[
  {
    "id": "abc123",
    "title": "O que significa fé?",
    "createdAt": "2025-10-02T10:00:00Z",
    "messages": [...]
  }
]
```

#### `GET /api/chat-teologico/conversation/{id}`
Retorna mensagens de uma conversa específica.

#### `DELETE /api/chat-teologico/conversation/{id}`
Deleta uma conversa.

---

### **Reflexões Diárias**

#### `POST /api/reflexao-diaria`
Gera reflexão diária personalizada.

**Response:**
```json
{
  "id": "ref123",
  "date": "2025-10-02T00:00:00Z",
  "theme": "Paz em Meio à Tempestade",
  "content": "Hoje, Deus nos lembra através de...",
  "bibleReferences": [
    {
      "book": "Filipenses",
      "chapter": 4,
      "verses": "6-7"
    }
  ],
  "wasRead": false
}
```

#### `GET /api/reflexao-diaria`
Lista reflexões anteriores do usuário.

#### `PATCH /api/reflexao-diaria`
Marca reflexão como lida.

**Request Body:**
```json
{
  "reflectionId": "ref123"
}
```

---

### **Significado Original**

#### `POST /api/significado-original`
Busca significado original de uma palavra.

**Request Body:**
```json
{
  "word": "fé",
  "book": "Hebreus",
  "chapter": 11,
  "verseNumber": 1,
  "context": "Ora, a fé é o firme fundamento..."
}
```

**Response:**
```json
{
  "originalWord": "πίστις",
  "language": "grego",
  "transliteration": "pistis",
  "definition": "No grego koiné, pistis significa confiança, fidelidade...",
  "savedAt": "2025-10-02T10:00:00Z"
}
```

#### `GET /api/significado-original`
Lista significados salvos pelo usuário.

---

## 🎨 COMPONENTES FRONTEND

### **Páginas:**

1. **`/fale-com-biblia`** - Interface do chatbot
   - Sidebar com histórico de conversas
   - Área de chat com streaming de respostas
   - Exemplos de perguntas para começar
   - UI moderna com gradientes e animações

2. **`/reflexoes-diarias`** - Reflexões personalizadas
   - Card destacado para reflexão de hoje
   - Botão para gerar nova reflexão
   - Histórico de reflexões anteriores
   - Marcação de leitura

### **Componentes:**

1. **`SignificadoOriginalModal`** - Modal para significados
   - Display da palavra original
   - Transliteração
   - Definição detalhada
   - Contexto bíblico

---

## 📊 FLUXOS DE DADOS

### **Sistema RAG do Chatbot:**

```
Pergunta do Usuário
    ↓
Buscar Contexto (RAG):
    - Top 3 capítulos mais lidos
    - Últimos 3 insights do diário
    - Preferências do onboarding
    ↓
Construir Prompt com Contexto
    ↓
LLM API (GPT-4.1-mini)
    ↓
Streaming de Resposta
    ↓
Salvar no Banco de Dados
```

### **Geração de Reflexão Diária:**

```
Solicitar Reflexão
    ↓
Verificar se já existe hoje
    ↓ (Não existe)
Analisar:
    - Top 5 capítulos mais lidos
    - Últimos 5 insights do diário
    - Preferências do usuário
    ↓
Gerar Reflexão Personalizada (LLM)
    ↓
Salvar com tema e referências
    ↓
Retornar para usuário
```

---

## 🔐 SEGURANÇA

- ✅ Autenticação obrigatória (NextAuth)
- ✅ Validação de propriedade de recursos (userId)
- ✅ Rate limiting implícito via API do Abacus.AI
- ✅ Sanitização de inputs
- ✅ Streaming seguro com Server-Sent Events

---

## 🎯 DIFERENCIAIS COMPETITIVOS

### **vs. YouVersion:**
- ✅ Chatbot teológico RAG (YouVersion não tem)
- ✅ Reflexões personalizadas por IA baseadas em leitura real
- ✅ Significados originais on-demand (vs. comentários estáticos)

### **vs. Bible Gateway:**
- ✅ Interação conversacional com IA
- ✅ Personalização baseada em histórico do usuário
- ✅ Integração nativa com devocional e diário

---

## 📱 INTEGRAÇÃO COM OUTROS MÓDULOS

### **Módulo I (Leitura):**
- Usa `ChapterMetric` para contexto do RAG
- Pode ser acessado durante leitura (futuro: botão inline)

### **Módulo II (Respira & Ore):**
- Reflexões podem ser usadas no devocional
- Insights do Journal alimentam a IA

### **Módulo III (Monetização):**
- Features de IA podem ser limitadas para usuários Free
- Pro Members: reflexões ilimitadas, histórico completo

### **Módulo IV (Social):**
- Futuro: compartilhar reflexões com amigos
- Futuro: chatbot em contexto de planos compartilhados

---

## 🚀 NAVEGAÇÃO ATUALIZADA

### **Navbar:**
- ✅ **Chat IA** → `/fale-com-biblia`
- ✅ **Reflexões** → `/reflexoes-diarias`

### **Home Page:**
- ✅ CTA "Fale com a Bíblia" (gradiente indigo-purple)
- ✅ CTA "Reflexões Diárias" (gradiente amber-orange)

---

## 💡 CASOS DE USO

### **Chatbot:**
1. **Estudo Bíblico:** "Explique a parábola do filho pródigo"
2. **Dúvidas Teológicas:** "Qual a diferença entre graça e misericórdia?"
3. **Aplicação Prática:** "Como lidar com ansiedade segundo a Bíblia?"
4. **Interpretação:** "O que Paulo quis dizer em Romanos 8:28?"

### **Reflexões Diárias:**
1. Usuário acessa pela manhã
2. Sistema detecta temas frequentes (ex: Salmos)
3. Gera reflexão sobre paz e confiança em Deus
4. Usuário lê e marca como lida
5. Reflexão fica salva no histórico

### **Significado Original:**
1. Durante leitura, usuário encontra palavra "fé"
2. Clica para ver significado original
3. Sistema busca "pistis" (grego) com contexto
4. Mostra definição detalhada e usos bíblicos
5. Significado fica salvo para consulta futura

---

## 📈 MÉTRICAS IMPLEMENTADAS

- ✅ Número de conversas criadas
- ✅ Mensagens enviadas ao chatbot
- ✅ Reflexões geradas por usuário
- ✅ Taxa de leitura de reflexões
- ✅ Palavras pesquisadas (significado original)

---

## 🔄 FUTURAS MELHORIAS (Pós-MVP)

1. **Chatbot Multimodal:**
   - Anexar imagens de versículos
   - Upload de fotos para interpretação

2. **Reflexões em Áudio:**
   - TTS para ouvir reflexões
   - Integração com "Respira & Ore"

3. **Estudo em Grupo:**
   - Chat compartilhado com amigos
   - Reflexões colaborativas

4. **Análise Semântica:**
   - Grafos de conceitos bíblicos
   - Conexões entre temas

5. **Memória de Longo Prazo:**
   - Chatbot lembra conversas antigas
   - Perfil teológico do usuário

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Database schema atualizado
- [x] API routes implementadas
- [x] Chatbot com streaming funcional
- [x] Sistema RAG integrado
- [x] Reflexões diárias personalizadas
- [x] Significado original com cache
- [x] Frontend do chatbot
- [x] Frontend de reflexões
- [x] Modal de significado original
- [x] Integração com navbar
- [x] CTAs na home page
- [x] Testes de funcionalidade
- [x] Documentação completa

---

## 🎉 CONCLUSÃO

O **Módulo V** transforma o "Minuto com Deus" em um aplicativo único no mercado, combinando:
- ✅ Tecnologia de ponta (RAG + LLM)
- ✅ Personalização profunda
- ✅ Experiência conversacional
- ✅ Estudo bíblico avançado

**Diferencial chave:** A IA não substitui o estudo da Bíblia, mas **potencializa** a jornada espiritual do usuário através de insights personalizados e contextualizados.

---

**Próximo Passo:** Implementar Módulo VI (Analytics e Dashboard Admin) ou preparar para deploy e testes beta.

---

**Implementado por:** DeepAgent  
**Versão do App:** 1.5.0  
**Última Atualização:** 2 de Outubro de 2025
