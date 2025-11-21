import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { getOrganizationTips } from '../services/geminiService';
import { Item } from '../types';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIAssistantProps {
  items: Item[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ items }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "你好！我是你的家庭收纳顾问。我可以帮你规划空间、建议收纳方案，或者帮你回忆东西放在哪里了。今天想整理什么呢？",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Summarize items for context
    const itemsContext = items.map(i => `${i.name} (${i.category})`).join(", ").slice(0, 500); // Limit context length

    try {
      const responseText = await getOrganizationTips(userMessage.text, itemsContext);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 flex-1 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-[#fffcf9] flex items-center space-x-4">
          <div className="bg-violet-100 p-2.5 rounded-2xl text-violet-600 shadow-sm">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="font-bold text-stone-800 text-lg">AI 收纳顾问</h2>
            <p className="text-xs text-stone-500">Powered by Gemini 2.5</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.sender === 'user' ? 'bg-stone-800 text-white' : 'bg-white border border-stone-100 text-violet-600'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
                </div>
                <div className={`px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-stone-800 text-stone-50 rounded-tr-none' 
                    : 'bg-white text-stone-700 border border-stone-100 rounded-tl-none'
                }`}>
                    <div className="prose prose-sm max-w-none prose-stone">
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex items-start gap-4 max-w-[80%]">
                <div className="w-9 h-9 rounded-full bg-white border border-stone-100 text-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                   <Bot size={18} />
                </div>
                <div className="bg-white border border-stone-100 px-5 py-3.5 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-2.5">
                   <Loader2 size={18} className="animate-spin text-violet-600" />
                   <span className="text-sm text-stone-500 font-medium">正在思考收纳方案...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white border-t border-stone-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：怎样整理乱糟糟的数据线？"
              className="w-full pl-5 pr-14 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder-stone-400 text-stone-700 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;