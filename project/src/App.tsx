import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { streamWithGroq } from '@/lib/groq';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limits';
import { models } from '@/lib/models';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ImageGenerator } from '@/components/image-generator';

export default function App() {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    try {
      const { allowed, remaining, resetTime } = await checkRateLimit('message');
      
      if (!allowed) {
        throw new Error(
          `Rate limit reached. You can send ${remaining} more messages after ${
            new Date(resetTime).toLocaleTimeString()
          }`
        );
      }

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      const userMessage = input;
      const newUserMessage = { 
        role: 'user' as const, 
        content: userMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setStreamingContent('');

      await incrementRateLimit('message');

      let fullResponse = '';
      for await (const chunk of streamWithGroq(
        userMessage, 
        selectedModel, 
        null,
        abortControllerRef.current.signal,
        messages
      )) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return;
        }
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: error.message,
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse" />
              <div className="absolute inset-[2px] rounded-xl bg-black flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Blue AI Chat</h1>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6 mb-8">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600/10 text-blue-400 rounded-tr-sm'
                    : 'bg-white/5 rounded-tl-sm'
                }`}
              >
                <MarkdownRenderer content={message.content} />
              </div>
            </div>
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2">
                <MarkdownRenderer content={streamingContent} isStreaming={true} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageGenerator onImageGenerated={(imageUrl) => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `![Generated Image](${imageUrl})`,
              timestamp: new Date()
            }]);
          }} />
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}