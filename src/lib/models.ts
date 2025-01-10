import { Brain, Cpu, Sparkles } from 'lucide-react';

export const models = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most advanced model for complex tasks',
    icon: Brain,
    contextWindow: '32k',
    speed: 'Fast',
    provider: 'AIML API'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    description: 'Balanced performance and efficiency',
    icon: Cpu,
    contextWindow: '32k',
    speed: 'Fast',
    provider: 'Mistral AI'
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'LLaMA3 70B',
    description: 'Fast and efficient model',
    icon: Sparkles,
    contextWindow: '32k',
    speed: 'Fast',
    provider: 'Meta'
  }
] as const;