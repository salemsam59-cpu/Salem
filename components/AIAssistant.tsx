
import React, { useState, useRef, useEffect } from 'react';
import { Transaction, ChatMessage } from '../types';
import { getGeminiResponse } from '../services/geminiService';

interface AIAssistantProps {
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'أهلاً بك! أنا مساعد المنارة الذكي. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'basic' | 'think' | 'search'>('basic');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `سجل المبيعات والمشتريات الحالي: ${JSON.stringify(transactions)}. المستخدم يسأل: ${input}`;
    const response = await getGeminiResponse(context, mode);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="bg-indigo-600 dark:bg-indigo-700 p-3 md:p-4 text-white flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7 7 0 1 1 13 4v.07A1 1 0 0 1 15 5v14a1 1 0 0 1-2 0z"/></svg>
          </div>
          <div>
            <h3 className="font-black text-xs">مساعد المنارة الذكي</h3>
            <p className="text-[8px] text-indigo-100 uppercase font-bold tracking-widest">Gemini Neural Engine</p>
          </div>
        </div>
        <div className="flex bg-indigo-700/50 dark:bg-indigo-800/50 p-0.5 rounded-xl border border-indigo-500/20">
          {['basic', 'think', 'search'].map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
            >
              {m === 'basic' ? 'سريع' : m === 'think' ? 'تحليل عميق' : 'بحث ذكي'}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/30 transition-colors">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end animate-in slide-in-from-right-2 duration-300'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-colors ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
            }`}>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">المصادر الخارجية:</p>
                  {msg.groundingUrls.map((url, idx) => (
                    <a key={idx} href={url.uri} target="_blank" rel="noreferrer" className="block text-[10px] text-indigo-600 dark:text-indigo-400 truncate hover:underline flex items-center gap-1.5 font-bold">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      {url.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">جاري المعالجة..</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex gap-3 max-w-3xl mx-auto items-center">
          <div className="flex-1 relative">
             <input 
               type="text"
               className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100 transition-all pr-12"
               placeholder="كيف يمكنني مساعدتك في إدارة المنارة؟"
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyPress={e => e.key === 'Enter' && handleSend()}
             />
             <div className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             </div>
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
