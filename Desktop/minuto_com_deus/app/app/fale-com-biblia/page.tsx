
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, MessageSquare, Sparkles, BookOpen, Plus, Trash2, Crown, Lock, AlertCircle, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface UsageLimit {
  isProMember: boolean;
  unlimited: boolean;
  questionsUsed: number;
  questionsRemaining: number;
  limit: number;
  hasReachedLimit?: boolean;
}

export default function FaleComBibliaPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usageLimit, setUsageLimit] = useState<UsageLimit | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
      checkUsageLimit();
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkUsageLimit = async () => {
    try {
      const res = await fetch('/api/chat-usage');
      if (res.ok) {
        const data = await res.json();
        setUsageLimit(data);
      }
    } catch (error) {
      console.error('Erro ao verificar limite de uso:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat-teologico');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat-teologico/conversation/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentConversationId(data.id);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Deseja realmente excluir esta conversa?')) return;

    try {
      const res = await fetch(`/api/chat-teologico/conversation/${conversationId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setConversations(conversations.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          startNewConversation();
        }
        toast.success('Conversa excluída');
      }
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
      toast.error('Erro ao excluir conversa');
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setStreamingContent('');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    // Verificar limite de uso para usuários gratuitos
    if (usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0) {
      toast.error('Você atingiu o limite mensal de perguntas gratuitas');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Adicionar mensagem do usuário
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    try {
      // Incrementar contador de uso (apenas para usuários gratuitos)
      if (usageLimit && !usageLimit.isProMember) {
        const usageRes = await fetch('/api/chat-usage', { method: 'POST' });
        if (usageRes.ok) {
          const updatedUsage = await usageRes.json();
          setUsageLimit({
            ...usageLimit,
            questionsUsed: updatedUsage.questionsUsed || usageLimit.questionsUsed + 1,
            questionsRemaining: updatedUsage.questionsRemaining || usageLimit.questionsRemaining - 1,
          });
        }
      }

      const res = await fetch('/api/chat-teologico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversationId,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Response body reader not available');
      }

      const decoder = new TextDecoder();
      let assistantMessage = '';
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
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content') {
                assistantMessage += parsed.content;
                setStreamingContent(assistantMessage);
              } else if (parsed.type === 'metadata') {
                // Atualizar conversationId se for nova conversa
                if (!currentConversationId && parsed.conversationId) {
                  setCurrentConversationId(parsed.conversationId);
                  fetchConversations();
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Adicionar mensagem do assistente
      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      setStreamingContent('');
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex gap-2 sm:gap-6 h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
          {/* Sidebar de Conversas - Desktop */}
          <div className={`hidden md:block ${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
            <div className="bg-card rounded-2xl shadow-lg p-4 h-full flex flex-col">
              <Button
                onClick={startNewConversation}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mb-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conversa
              </Button>

              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      currentConversationId === conv.id ? 'sidebar-item-active' : 'sidebar-item'
                    }`}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {conv.title || 'Sem título'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar de Conversas - Mobile (Overlay) */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden fixed inset-0 bg-black/50 z-40"
                />
                
                {/* Sidebar */}
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="md:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card shadow-2xl z-50 flex flex-col"
                >
                  {/* Header da Sidebar Mobile */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="p-4">
                    <Button
                      onClick={() => {
                        startNewConversation();
                        setSidebarOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conversa
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                          currentConversationId === conv.id ? 'sidebar-item-active' : 'sidebar-item'
                        }`}
                        onClick={() => {
                          loadConversation(conv.id);
                          setSidebarOpen(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {conv.title || 'Sem título'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(conv.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Área de Chat */}
          <div className="flex-1 bg-card rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Botões Menu Mobile */}
                  <div className="flex items-center gap-1 md:hidden">
                    <button
                      onClick={() => router.push('/home')}
                      className="p-2 hover:bg-card/20 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Voltar ao início"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 hover:bg-card/20 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="bg-card/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold truncate">Fale com a Bíblia</h1>
                    <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">Assistente Teológico com IA</p>
                  </div>
                </div>
                
                {/* Indicador de Limite */}
                {usageLimit && !usageLimit.isProMember && (
                  <div className="bg-card/20 px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex-shrink-0">
                    <p className="text-xs text-blue-100 hidden sm:block">Perguntas restantes</p>
                    <p className="text-sm sm:text-lg font-bold">
                      {usageLimit.questionsRemaining}/{usageLimit.limit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Banner de Limite Atingido */}
            {usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0 && (
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3 max-w-4xl mx-auto">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">
                      Limite Mensal Atingido
                    </h3>
                    <p className="text-amber-50 text-xs sm:text-sm mb-2 sm:mb-3">
                      Você usou suas {usageLimit.limit} perguntas gratuitas deste mês. 
                      Assine o Plano Pro para perguntas ilimitadas!
                    </p>
                    <Button
                      onClick={() => router.push('/planos')}
                      className="bg-card text-amber-600 hover:bg-amber-50 font-semibold text-xs sm:text-sm"
                      size="sm"
                    >
                      <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Ver Planos Pro
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Banner Informativo (quando está perto do limite) */}
            {usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining > 0 && usageLimit.questionsRemaining <= 2 && (
              <div className="banner-info p-2 sm:p-3">
                <div className="flex items-center gap-2 justify-center text-center">
                  <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-foreground">
                    <span className="hidden sm:inline">Você tem apenas </span>
                    <strong>{usageLimit.questionsRemaining}</strong> pergunta
                    {usageLimit.questionsRemaining > 1 ? 's' : ''} restante
                    {usageLimit.questionsRemaining > 1 ? 's' : ''}<span className="hidden sm:inline"> este mês</span>.{' '}
                    <button
                      onClick={() => router.push('/planos')}
                      className="underline font-semibold hover:text-blue-900 whitespace-nowrap"
                    >
                      Assine o Pro
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
              {messages.length === 0 && !streamingContent && (
                <div className="text-center py-6 sm:py-12 px-2">
                  <div className="bg-gradient-to-br from-background to-background w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    Como posso ajudá-lo hoje?
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                    Faça perguntas sobre a Bíblia, busque orientação espiritual ou explore as Escrituras
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                    {[
                      'O que significa "Fé" na Bíblia?',
                      'Explique a parábola do filho pródigo',
                      'Como lidar com ansiedade segundo as Escrituras?',
                      'Qual o significado de Salmos 23?',
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(example)}
                        className="text-left p-3 sm:p-4 example-box rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-primary mb-1 sm:mb-2" />
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl bg-muted text-foreground">
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{streamingContent}</p>
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-2 sm:p-4 bg-muted/30">
              <div className="flex gap-2 sm:gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0
                      ? 'Limite atingido'
                      : 'Digite sua pergunta...'
                  }
                  className="flex-1 min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] resize-none text-sm sm:text-base"
                  disabled={loading || (usageLimit !== null && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0)}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    loading || 
                    !input.trim() || 
                    (usageLimit !== null && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0)
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-6 self-end"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0 ? (
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
              {usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining > 0 ? (
                <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                  ✨ Pressione Enter para enviar, Shift+Enter para nova linha
                </p>
              ) : usageLimit && !usageLimit.isProMember && usageLimit.questionsRemaining <= 0 ? (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  🔒 <span className="hidden sm:inline">Limite mensal atingido.</span> Assine o <span className="hidden sm:inline">Plano </span>Pro<span className="hidden sm:inline"> para perguntas ilimitadas</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                  ✨ Pressione Enter para enviar, Shift+Enter para nova linha
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
