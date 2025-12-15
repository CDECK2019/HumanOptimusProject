
import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, MessageSquarePlus, Stethoscope, Microscope, Leaf, Pill, Search } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    loading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, loading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = () => {
        if (inputRef.current?.value.trim()) {
            onSendMessage(inputRef.current.value);
            inputRef.current.value = '';
        }
    };

    const handleQuickAction = (prompt: string) => {
        onSendMessage(prompt);
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <MessageSquarePlus size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 font-display">Council Chat</h3>
                    <p className="text-xs text-slate-500">Ask questions or request elaborations</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 my-10 space-y-2">
                        <p>Start the conversation...</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
                            }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-slate-800 text-white rounded-tr-none'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                            }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-4">

                {/* Quick Actions (Dig Deeper) - Horizontal Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                    <button
                        onClick={() => handleQuickAction("Please have the Western Medicine advisor elaborate on their recommendations.")}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-all whitespace-nowrap"
                    >
                        <Stethoscope size={14} /> Western Med
                    </button>
                    <button
                        onClick={() => handleQuickAction("Please have the Functional Medicine expert elaborate on root causes.")}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-all whitespace-nowrap"
                    >
                        <Microscope size={14} /> Functional
                    </button>
                    <button
                        onClick={() => handleQuickAction("Please have the TCM Practitioner elaborate on Qi and Dampness.")}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-xs font-semibold text-slate-600 hover:text-amber-700 transition-all whitespace-nowrap"
                    >
                        <Leaf size={14} /> TCM
                    </button>
                    <button
                        onClick={() => handleQuickAction("Please have the Pharmacist elaborate on interactions.")}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-all whitespace-nowrap"
                    >
                        <Pill size={14} /> Pharmacist
                    </button>
                    <button
                        onClick={() => handleQuickAction("Please have the Root Cause Analyst explain diagnostic priorities.")}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-600 hover:text-rose-700 transition-all whitespace-nowrap"
                    >
                        <Search size={14} /> Root Cause
                    </button>
                </div>

                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask a follow-up question..."
                        disabled={loading}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
