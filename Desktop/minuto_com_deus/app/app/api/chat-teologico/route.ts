
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// API para Chatbot Teológico RAG
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar ou criar conversa
    let conversation: any;
    if (conversationId) {
      conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' as const },
            take: 10, // Últimas 10 mensagens para contexto
          },
        },
      });
    } else {
      conversation = await prisma.chatConversation.create({
        data: {
          userId: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
        include: { messages: true },
      });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    // Buscar contexto bíblico relevante baseado nas leituras do usuário
    const topChapters = await prisma.chapterMetric.findMany({
      where: { userId: user.id },
      orderBy: { accessCount: 'desc' as const },
      take: 3,
    });

    // Buscar insights do diário do usuário
    const recentJournals = await prisma.journal.findMany({
      where: { userId: user.id },
      orderBy: { sessionDate: 'desc' as const },
      take: 3,
      select: {
        insight: true,
        gratidao: true,
      },
    });

    // Construir contexto RAG
    const bibleContext = topChapters.length > 0
      ? `O usuário tem lido frequentemente: ${topChapters.map((c: any) => `${c.book} capítulo ${c.chapter}`).join(', ')}.`
      : '';

    const journalContext = recentJournals.length > 0
      ? `Insights recentes do diário do usuário: ${recentJournals.map((j: any) => j.insight || j.gratidao).filter(Boolean).join(' | ')}`
      : '';

    // Construir histórico de mensagens
    const messageHistory = conversation.messages?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // Preparar prompt do sistema
    const systemPrompt = `Você é um Assistente Teológico Especialista em Bíblia Sagrada. Seu papel é ajudar o usuário a entender melhor as Escrituras, sempre baseando suas respostas EXCLUSIVAMENTE no conteúdo bíblico e em comentários teológicos de domínio público.

REGRAS IMPORTANTES:
1. Responda APENAS com base nas Sagradas Escrituras
2. Cite sempre os versículos relevantes (Livro Capítulo:Versículo)
3. Mantenha um tom respeitoso, acolhedor e pastoral
4. Se a pergunta não for relacionada à Bíblia, gentilmente redirecione para temas bíblicos
5. Use a versão Almeida da Bíblia em português
6. Seja claro, objetivo e encorajador

CONTEXTO DO USUÁRIO:
${bibleContext}
${journalContext}

Use esse contexto para personalizar suas respostas quando relevante.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory,
      { role: 'user', content: message },
    ];

    // Salvar mensagem do usuário
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Chamar API do LLM com streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        stream: true,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao chamar API LLM');
    }

    // Buffer para acumular a resposta completa
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        try {
          if (!reader) {
            throw new Error('Response body reader not available');
          }

          let partialRead = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Salvar resposta completa no banco
                  await prisma.chatMessage.create({
                    data: {
                      conversationId: conversation.id,
                      role: 'assistant',
                      content: fullResponse,
                      context: {
                        topChapters: topChapters.map((c: any) => ({ book: c.book, chapter: c.chapter })),
                      },
                    },
                  });
                  
                  // Enviar metadados finais
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'metadata', 
                    conversationId: conversation.id 
                  })}\n\n`));
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'content', 
                      content 
                    })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Erro no chatbot teológico:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

// Buscar histórico de conversas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' as const },
      take: 20,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' as const },
          take: 1, // Apenas primeira mensagem para preview
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error('Erro ao buscar conversas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar conversas' },
      { status: 500 }
    );
  }
}
