"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

type PlaceCard = {
  id?: string;
  name: string;
  type?: string;
  rating?: number | string;
  golden_hour: string;
  description: string;
};

type Message = {
  id: string;
  role: "user" | "agent";
  text?: string;
  card?: PlaceCard;
};

type StreamEvent =
  | { type: "status"; text: string }
  | { type: "text"; text: string }
  | { type: "place_card"; data: PlaceCard }
  | { type: "done" };

const DEMO_AUTH_TOKEN = "mock_jwt_token_12345";

function parseServerSentEvents(chunk: string) {
  return chunk
    .split("\n\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.replace(/^data: /, ""));
}

export default function CompanionChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "agent", text: "Hi! I'm Tuna 🐟. Where are we heading for your next shoot?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: trimmedInput };
    const agentMessageId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMessage, { id: agentMessageId, role: "agent", text: "" }]);
    setInput("");
    setIsLoading(true);
    setAgentStatus("Thinking...");

    try {
      const token = localStorage.getItem("tuna_auth_token") || DEMO_AUTH_TOKEN;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!response.ok) {
        let detail = `Chat request failed with status ${response.status}`;
        try {
          const errorBody = await response.json();
          detail = errorBody.detail || detail;
        } catch {
          // Keep the status-based fallback when the upstream error is not JSON.
        }
        throw new Error(detail);
      }
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        for (const dataStr of parseServerSentEvents(decoder.decode(value, { stream: true }))) {
          const data = JSON.parse(dataStr) as StreamEvent;

          if (data.type === "status") {
            setAgentStatus(data.text);
          } else if (data.type === "text") {
            setAgentStatus(null);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessageId ? { ...msg, text: (msg.text || "") + data.text } : msg,
              ),
            );
          } else if (data.type === "place_card") {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "agent", card: data.data },
            ]);
          } else if (data.type === "done") {
            setIsLoading(false);
            setAgentStatus(null);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMessageId
            ? { ...msg, text: error instanceof Error ? error.message : "I couldn't reach Tuna's planning service. Please try again in a moment." }
            : msg,
        ),
      );
      setIsLoading(false);
      setAgentStatus(null);
    }
  };

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Chat interface">
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#00d4aa] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,212,170,0.4)]" aria-hidden="true">
            🐟
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">Tuna.ai</h2>
            <p className="text-xs text-[#00d4aa]">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Conversation history">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <article
              aria-label={msg.role === "user" ? "Your message" : "Tuna response"}
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#00d4aa] to-[#0ea5e9] text-white rounded-br-none"
                  : "bg-white/10 backdrop-blur-md border border-white/10 text-slate-100 rounded-bl-none"
              }`}
            >
              {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

              {msg.card && (
                <div className="mt-2 bg-white/5 rounded-xl p-3 border border-white/10 w-full">
                  <div className="h-24 bg-slate-800 rounded-lg mb-3 flex items-center justify-center text-3xl" aria-hidden="true">
                    📸
                  </div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-white text-sm">{msg.card.name}</h3>
                    <span className="text-xs bg-[#f59e0b]/20 text-[#fbbf24] px-2 py-1 rounded-md flex items-center gap-1">
                      <span aria-hidden="true">🌅</span> {msg.card.golden_hour}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{msg.card.description}</p>
                  <button
                    type="button"
                    className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4aa]"
                    aria-label={`Add ${msg.card.name} to itinerary`}
                  >
                    + Add to Itinerary
                  </button>
                </div>
              )}
            </article>
          </div>
        ))}

        {agentStatus && (
          <div className="flex justify-start" role="status" aria-live="polite">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4aa] motion-safe:animate-pulse" aria-hidden="true"></span>
              {agentStatus}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
        <form onSubmit={handleSubmit} className="relative" aria-label="Send Tuna a message">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Plan a 3-day trip to..."
            aria-label="Message Tuna"
            className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00d4aa]/50 focus-visible:ring-2 focus-visible:ring-[#00d4aa] transition-colors"
            disabled={isLoading}
            maxLength={1000}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#00d4aa] flex items-center justify-center text-black hover:bg-[#00e6b8] disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4aa]"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
