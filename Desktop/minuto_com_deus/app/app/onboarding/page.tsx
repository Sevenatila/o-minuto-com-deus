
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Heart, DollarSign, Users, Briefcase, Home, Target, Check } from 'lucide-react';

const topics = [
  { id: 'familia', label: 'Família', icon: Home },
  { id: 'trabalho', label: 'Trabalho', icon: Briefcase },
  { id: 'relacionamentos', label: 'Relacionamentos', icon: Users },
  { id: 'saude', label: 'Saúde', icon: Heart },
  { id: 'proposito', label: 'Propósito de vida', icon: Target },
  { id: 'paz', label: 'Paz interior', icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [ansiedadeNivel, setAnsiedadeNivel] = useState('');
  const [financasPreocupacao, setFinancasPreocupacao] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async () => {
    if (!ansiedadeNivel || !financasPreocupacao) {
      alert('Por favor, responda todas as perguntas.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ansiedadeNivel,
          financasPreocupacao,
          outrosTopicos: selectedTopics,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        router.push('/home');
      } else {
        alert('Erro ao salvar preferências. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Erro ao salvar preferências. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12"
      >
        <div className="text-center mb-8">
          <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bem-vindo ao Minuto com Deus!
          </h1>
          <p className="text-lg text-gray-600">
            Vamos personalizar sua experiência
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'w-12 bg-blue-600' : 'w-8 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-lg font-semibold text-foreground mb-4">
                Como você se sente em relação à ansiedade?
              </label>
              <div className="space-y-3">
                {[
                  { value: 'nunca', label: 'Nunca sinto' },
                  { value: 'as-vezes', label: 'Às vezes' },
                  { value: 'frequentemente', label: 'Frequentemente' },
                  { value: 'sempre', label: 'Sempre' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnsiedadeNivel(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      ansiedadeNivel === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {ansiedadeNivel === option.value && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => ansiedadeNivel && setStep(2)}
              disabled={!ansiedadeNivel}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Finanças são uma preocupação para você?
              </label>
              <div className="space-y-3">
                {[
                  { value: 'sim', label: 'Sim' },
                  { value: 'as-vezes', label: 'Às vezes' },
                  { value: 'nao', label: 'Não' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFinancasPreocupacao(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      financasPreocupacao === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {financasPreocupacao === option.value && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => financasPreocupacao && setStep(3)}
                disabled={!financasPreocupacao}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-lg font-semibold text-foreground mb-4">
                Quais tópicos te interessam?
              </label>
              <p className="text-sm text-gray-600 mb-4">Selecione todos que se aplicam</p>
              <div className="grid grid-cols-2 gap-3">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicToggle(topic.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`h-8 w-8 mx-auto mb-2 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        }`}
                      >
                        {topic.label}
                      </span>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-600 mx-auto mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Começar Jornada'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
