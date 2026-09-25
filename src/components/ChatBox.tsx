import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chess';
import { Send, Bot, User } from 'lucide-react';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isEngineThinking: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isEngineThinking }) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputText('');
  };

  return (
    <div className="bg-[#1a1c20] rounded-xl shadow-xl flex flex-col flex-1 overflow-hidden border border-white/5 min-h-[260px] max-h-[340px]">
      {/* Chat Header */}
      <div className="px-4 py-2.5 bg-[#282a2e]/60 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[#00d2ff]">💬</span>
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
            Conversación en Vivo
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-[#859399]">ONLINE</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2.5 text-xs font-sans">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[92%] ${
                isUser ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                {isUser ? (
                  <>
                    <span className="text-[#bbc9cf] font-medium">Stitch (Tú)</span>
                    <span className="text-[#859399]">{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-[#00d2ff]" />
                    <span className="text-[#00d2ff] font-medium">AI Grandmaster</span>
                    <span className="text-[#859399]">{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`p-2.5 rounded-xl leading-relaxed shadow-sm ${
                  isUser
                    ? 'rounded-tr-none bg-[#00d2ff] text-[#003543] font-medium'
                    : 'rounded-tl-none bg-[#282a2e] text-[#e2e2e8] border border-white/5'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isEngineThinking && (
          <div className="flex items-center gap-2 text-[11px] text-[#859399] font-mono italic p-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
            AI Grandmaster está analizando variantes...
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-2 bg-[#0c0e12] flex items-center gap-2 border-t border-white/5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe un mensaje al Gran Maestro..."
          className="flex-1 bg-[#282a2e] text-white placeholder:text-[#859399] text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00d2ff] border border-white/5"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-lg bg-[#00d2ff] hover:bg-[#7bd0ff] text-[#003543] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
