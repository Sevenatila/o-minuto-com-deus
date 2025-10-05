
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// Gerar sugestão de plano semanal personalizado usando IA
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        currentStreak: true,
        longestStreak: true,
        totalDevocionais: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar métricas de leitura (livros mais acessados)
    const chapterMetrics = await prisma.chapterMetric.findMany({
      where: { userId },
      orderBy: { accessCount: 'desc' },
      take: 10,
    });

    // Buscar entradas de diário recentes
    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { sessionDate: 'desc' },
      take: 14,
    });

    // Buscar preferências do onboarding
    const userPreference = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Preparar dados para análise
    const livrosFrequentes = chapterMetrics
      .map((m) => m.book)
      .filter((book, index, self) => self.indexOf(book) === index)
      .slice(0, 5);

    const humorMedio =
      journals.length > 0
        ? journals.reduce((sum, j) => sum + j.humor, 0) / journals.length
        : 3;

    const tempoMedioDevocional =
      journals.length > 0
        ? journals.reduce((sum, j) => sum + j.duracaoMinutos, 0) / journals.length
        : 10;

    // Analisar padrões de queda no streak
    const streakEmRisco = user.currentStreak < 3 && user.longestStreak > 7;

    // Extrair insights dos journals
    const temasRecorrentes: string[] = [];
    journals.forEach((j) => {
      if (j.insight) {
        const palavrasChave = ['ansiedade', 'paz', 'gratidão', 'força', 'fé', 'amor', 'esperança', 'sabedoria', 'paciência', 'perdão'];
        palavrasChave.forEach((palavra) => {
          const insight = j.insight?.toLowerCase() || '';
          if (insight.includes(palavra)) {
            if (!temasRecorrentes.includes(palavra)) {
              temasRecorrentes.push(palavra);
            }
          }
        });
      }
    });

    // Preparar prompt para IA
    const prompt = `Você é um assistente espiritual especializado em criar planos de leitura bíblica personalizados.

Analise o perfil do usuário abaixo e crie um plano de leitura personalizado para a próxima semana (7 dias):

**Perfil do Usuário:**
- Nome: ${user.name || 'Usuário'}
- Streak atual: ${user.currentStreak} dias
- Streak mais longo: ${user.longestStreak} dias
- Total de devocionais: ${user.totalDevocionais}
- Humor médio (escala 1-5): ${humorMedio.toFixed(1)}
- Tempo médio devocional: ${tempoMedioDevocional.toFixed(0)} minutos
- Livros mais lidos: ${livrosFrequentes.join(', ') || 'Nenhum ainda'}
- Temas recorrentes nos journals: ${temasRecorrentes.join(', ') || 'Nenhum identificado'}
- Streak em risco: ${streakEmRisco ? 'Sim' : 'Não'}
- Preferências do onboarding: ${userPreference?.preferenciaOnboarding ? JSON.stringify(userPreference.preferenciaOnboarding) : 'Não definidas'}

**Diretrizes para o plano:**
1. Sugira 7 capítulos da Bíblia, um para cada dia da semana
2. Considere o padrão de leitura e temas de interesse do usuário
3. Varie entre Antigo e Novo Testamento
4. Se o streak está em risco, sugira capítulos curtos e motivadores
5. Se o humor médio está baixo (< 3), foque em textos de conforto e esperança
6. Se o humor está alto (> 4), sugira textos de crescimento e desafio espiritual
7. Inclua uma breve motivação para cada dia (1-2 frases)
8. Adicione uma "meta da semana" que sintetize o objetivo espiritual

**Formato de resposta (JSON):**
{
  "titulo": "Título do plano (motivador e pessoal)",
  "descricao": "Descrição geral do plano (2-3 frases)",
  "metaDaSemana": "Meta espiritual principal desta semana",
  "motivacao": "Mensagem motivacional personalizada (3-4 frases)",
  "diasPlano": [
    {
      "dia": 1,
      "diaSemana": "Segunda-feira",
      "livro": "Nome do livro",
      "capitulo": número,
      "temaHoje": "Tema principal",
      "motivacao": "Motivação específica do dia"
    },
    ...
  ],
  "dicasRealizacao": [
    "Dica 1 para manter a constância",
    "Dica 2 baseada no perfil do usuário",
    "Dica 3 prática"
  ]
}

Responda APENAS com o JSON, sem texto adicional.`;

    // Chamar API do Abacus.AI
    const client = new OpenAI({
      baseURL: 'https://llm-router.abacus.ai/v1',
      apiKey: process.env.ABACUSAI_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente espiritual especializado em criar planos de leitura bíblica personalizados. Responda sempre em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON da resposta
    let planoSemanal;
    try {
      // Limpar possível markdown
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      planoSemanal = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da IA:', parseError);
      console.error('Resposta recebida:', responseText);
      
      // Fallback: plano genérico
      planoSemanal = {
        titulo: 'Seu Plano Personalizado da Semana',
        descricao: 'Um plano de leitura criado especialmente para você, com base no seu perfil e jornada espiritual.',
        metaDaSemana: 'Fortalecer minha conexão com Deus através da leitura consistente',
        motivacao: 'Continue sua jornada espiritual! Cada dia é uma nova oportunidade de crescimento.',
        diasPlano: [
          { dia: 1, diaSemana: 'Segunda-feira', livro: 'Salmos', capitulo: 23, temaHoje: 'Confiança', motivacao: 'Comece a semana confiando no cuidado de Deus' },
          { dia: 2, diaSemana: 'Terça-feira', livro: 'Provérbios', capitulo: 3, temaHoje: 'Sabedoria', motivacao: 'Busque sabedoria em cada decisão' },
          { dia: 3, diaSemana: 'Quarta-feira', livro: 'João', capitulo: 15, temaHoje: 'Permanecer', motivacao: 'Permaneça conectado à fonte da vida' },
          { dia: 4, diaSemana: 'Quinta-feira', livro: 'Filipenses', capitulo: 4, temaHoje: 'Alegria', motivacao: 'Alegre-se sempre no Senhor' },
          { dia: 5, diaSemana: 'Sexta-feira', livro: 'Isaías', capitulo: 40, temaHoje: 'Renovação', motivacao: 'Renove suas forças nEle' },
          { dia: 6, diaSemana: 'Sábado', livro: 'Romanos', capitulo: 8, temaHoje: 'Vitória', motivacao: 'Nada pode nos separar do amor de Deus' },
          { dia: 7, diaSemana: 'Domingo', livro: '1 Coríntios', capitulo: 13, temaHoje: 'Amor', motivacao: 'Reflita sobre o maior de todos: o amor' },
        ],
        dicasRealizacao: [
          'Reserve o mesmo horário todos os dias para sua leitura',
          'Use o recurso de Diário Reflexivo para registrar seus insights',
          'Compartilhe suas descobertas com amigos no app',
        ],
      };
    }

    // Retornar plano com metadados
    return NextResponse.json({
      planoSemanal,
      perfilUsuario: {
        currentStreak: user.currentStreak,
        humorMedio: parseFloat(humorMedio.toFixed(1)),
        tempoMedioDevocional: parseFloat(tempoMedioDevocional.toFixed(0)),
        livrosFrequentes,
        streakEmRisco,
      },
      geradoEm: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao gerar sugestão semanal:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar sugestão semanal' },
      { status: 500 }
    );
  }
}
