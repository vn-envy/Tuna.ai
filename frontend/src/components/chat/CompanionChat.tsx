"use client";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "agent";
  text?: string;
  card?: any;
};

export default function CompanionChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "agent", text: "Hi! I'm Tuna 🐟. Where are we heading for your next shoot?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAgentStatus("Thinking...");

    const agentMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: agentMessageId, role: "agent", text: "" }]);

    try {
      const token = localStorage.getItem("tuna_auth_token") || "mock_jwt_token_12345";
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n\\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const dataStr = line.replace('data: ', '');
          if (!dataStr) continue;
          
          try {
            const data = JSON.parse(dataStr);
            
            if (data.type === 'status') {
              setAgentStatus(data.text);
            } else if (data.type === 'text') {
              setAgentStatus(null);
              setMessages(prev => prev.map(msg => 
                msg.id === agentMessageId ? { ...msg, text: (msg.text || "") + data.text } : msg
              ));
            } else if (data.type === 'place_card') {
              setMessages(prev => [
                ...prev, 
                { id: Date.now().toString() + Math.random(), role: "agent", card: data.data }
              ]);
            } else if (data.type === 'done') {
              setIsLoading(false);
              setAgentStatus(null);
            }
          } catch (err) {
            console.error("Error parsing JSON chunk:", err, "Chunk was:", dataStr);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      setAgentStatus(null);
    }
  };

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Chat interface">
      {/* Chat Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#00d4aa] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,212,170,0.4)]">
            🐟
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">Tuna.ai</h2>
            <p className="text-xs text-[#00d4aa]">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === "user" 
                ? "bg-gradient-to-br from-[#00d4aa] to-[#0ea5e9] text-white rounded-br-none" 
                : "bg-white/10 backdrop-blur-md border border-white/10 text-slate-200 rounded-bl-none"
            }`}>
              {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
              
              {/* Place Card Mock */}
              {msg.card && (
                <div className="mt-2 bg-white/5 rounded-xl p-3 border border-white/10 w-full">
                  <div className="h-24 bg-slate-800 rounded-lg mb-3 flex items-center justify-center text-3xl">
                    📸
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm">{msg.card.name}</h3>
                    <span className="text-xs bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-1 rounded-md flex items-center gap-1">
                      🌅 {msg.card.golden_hour}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{msg.card.description}</p>
                  <button className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg transition-colors" aria-label="Add to Itinerary">
                    + Add to Itinerary
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Status Indicator */}
        {agentStatus && (
          <div className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse"></span>
              {agentStatus}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Plan a 3-day trip to..."
            aria-label="Message Tuna"
            className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4aa]/50 transition-colors"
            disabled={isLoading}
          />
          <button 
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00d4aa] flex items-center justify-center text-black hover:bg-[#00e6b8] disabled:opacity-50 transition-colors"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
