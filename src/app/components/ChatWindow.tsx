"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWindow({ world }: { world: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !backend) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${backend}/chat-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          world: world,
          dataCenter: "Aether"
        }),
      });

      const data = await res.json();
      const aiText = data.output ?? "No response.";

      const aiMessage: Message = { role: "assistant", content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
        AI Question Box
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2 border border-slate-800 rounded-lg p-2 bg-slate-900/80">
        {messages.length === 0 && (
          <div className="text-xs text-slate-500">
            Ask anything about prices, strategies, or market behavior. This chat
            does not use your selected item—just general questions.
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`text-sm whitespace-pre-wrap ${
              m.role === "user" ? "text-slate-200" : "text-slate-300"
            }`}
          >
            <span className="text-xs uppercase text-slate-500 mr-1">
              {m.role === "user" ? "You:" : "AI:"}
            </span>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-400"
          placeholder="Ask a question about FFXIV markets..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
