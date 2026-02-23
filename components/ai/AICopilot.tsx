// components/ai/AICopilot.tsx
// Floating AI Watch CoPilot widget
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const QUICK_PROMPTS = [
  "What should I watch tonight?",
  "Show me mind-bending sci-fi",
  "I'm feeling nostalgic",
  "Something under 30 mins per episode",
];

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm your AI CoPilot 🎬 Tell me your mood or what you're looking for, and I'll find the perfect show for you.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPulsing(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });
      const data = await res.json();

      let reply = '';
      if (data.success && data.data?.length > 0) {
        const top3 = data.data.slice(0, 3);
        reply = `${data.queryExplanation || "Here's what I found:"}\n\n`;
        top3.forEach((s: any, i: number) => {
          reply += `${i + 1}. **${s.name}** (${s.vote_average?.toFixed(1)}⭐)\n${s.aiExplanation || s.overview?.slice(0, 80) + '...'}\n\n`;
        });
        reply += `Want more details on any of these?`;
      } else {
        reply = "I couldn't find the perfect match right now. Try describing your mood differently — like 'dark psychological thriller' or 'something light and fun'!";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops, I hit a snag! Try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="text-neon-blue">{line.slice(2, -2)}</strong>;
      }
      // Handle inline bold
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-neon-blue">{p}</strong> : p)}
          {'\n'}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-28 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 300 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-neon-red to-neon-blue flex items-center justify-center shadow-lg"
          style={{
            boxShadow: isPulsing 
              ? '0 0 20px rgba(255, 0, 85, 0.6), 0 0 40px rgba(0, 217, 255, 0.3)' 
              : '0 0 15px rgba(255, 0, 85, 0.4)'
          }}
        >
          {isPulsing && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-neon-red"
              animate={{ scale: [1, 1.4, 1.4], opacity: [1, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <span className="text-2xl">
            {isOpen ? '✕' : '🤖'}
          </span>
        </motion.button>

        {/* Tooltip */}
        {!isOpen && isPulsing && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 border border-neon-red/50 rounded-lg px-3 py-1 text-sm text-neon-red font-display"
          >
            AI CoPilot
          </motion.div>
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-48 right-6 z-50 w-80 sm:w-96 h-[480px] flex flex-col glass-card overflow-hidden"
            style={{ border: '1px solid rgba(255, 0, 85, 0.4)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-neon-red/20 bg-black/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-red to-neon-blue flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm">AI Watch CoPilot</div>
                <div className="text-xs text-neon-blue flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online · Groq Powered
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm font-body whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-neon-red/20 border border-neon-red/30 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-200'
                    }`}
                  >
                    {msg.role === 'assistant' ? formatContent(msg.content) : msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-neon-blue rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="whitespace-nowrap text-xs px-3 py-1 rounded-full border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 transition-colors font-body flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Describe your vibe..."
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-red focus:outline-none font-body"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="px-3 py-2 bg-neon-red/20 border border-neon-red/50 rounded-lg text-neon-red hover:bg-neon-red/30 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
