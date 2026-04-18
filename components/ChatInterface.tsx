import React, { useRef, useEffect } from 'react';
import {
  Send,
  User,
  Bot,
  MessageSquarePlus,
  Stethoscope,
  Microscope,
  Leaf,
  Pill,
  Search,
  Sparkles,
  Activity,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

const QUICK_ACTIONS: { label: string; icon: React.ElementType; prompt: string; tone: string }[] = [
  {
    label: 'Western Med',
    icon: Stethoscope,
    prompt: "Please have the Western Medicine advisor elaborate on their recommendations and any clinical red flags.",
    tone: 'hover:border-sky-200 hover:text-sky-700',
  },
  {
    label: 'Functional',
    icon: Microscope,
    prompt: "Please have the Functional Medicine specialist elaborate on root causes and nutrient status.",
    tone: 'hover:border-emerald-200 hover:text-emerald-700',
  },
  {
    label: 'TCM',
    icon: Leaf,
    prompt: "Please have the TCM Practitioner elaborate on the pattern (Qi, Blood, Yin/Yang) and harmonizing actions.",
    tone: 'hover:border-amber-200 hover:text-amber-700',
  },
  {
    label: 'Ayurveda',
    icon: Sparkles,
    prompt: "Please have the Ayurvedic practitioner elaborate on dosha balance, agni, and dinacharya recommendations.",
    tone: 'hover:border-orange-200 hover:text-orange-700',
  },
  {
    label: 'Pharmacist',
    icon: Pill,
    prompt: "Please have the Pharmacist elaborate on supplement-medication interactions and dosing.",
    tone: 'hover:border-indigo-200 hover:text-indigo-700',
  },
  {
    label: 'Lifestyle',
    icon: Activity,
    prompt: "Please have the Lifestyle Coach elaborate on practical micro-habits I can start this week.",
    tone: 'hover:border-rose-200 hover:text-rose-700',
  },
  {
    label: 'Root Cause',
    icon: Search,
    prompt: "Please have the Root Cause Analyst explain the highest-yield diagnostic priorities.",
    tone: 'hover:border-slate-300 hover:text-slate-800',
  },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const value = inputRef.current?.value.trim();
    if (!value || loading) return;
    onSendMessage(value);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 p-4">
        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-800">Council chat</h3>
          <p className="text-xs text-slate-500">Ask follow-ups or request expert elaborations</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-6">
        {messages.length === 0 && (
          <div className="my-10 space-y-2 text-center text-slate-400">
            <p>Start the conversation, or tap a discipline below to dig deeper.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'rounded-tr-none bg-slate-800 text-white'
                  : 'rounded-tl-none border border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-4 border-t border-slate-100 bg-white p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {QUICK_ACTIONS.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.label}
                type="button"
                onClick={() => onSendMessage(qa.prompt)}
                disabled={loading}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all disabled:opacity-50 ${qa.tone}`}
              >
                <Icon className="h-3.5 w-3.5" /> {qa.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <label htmlFor="chat-input" className="sr-only">
            Send a message
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            placeholder="Ask a follow-up question…"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            aria-label="Send message"
            className="absolute right-2 top-2 rounded-lg bg-emerald-600 p-1.5 text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
