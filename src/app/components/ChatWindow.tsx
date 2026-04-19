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
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${backend}/chat-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentInput,
          world: world,
        }),
      });

      const rawData = await res.json();
      console.log("📦 Full response from backend:", rawData);   // ← Debug

      // === IMPORTANT: Parse the body string ===
      let parsed;
      if (rawData.body && typeof rawData.body === "string") {
        parsed = JSON.parse(rawData.body);
      } else {
        parsed = rawData;
      }

      const aiText = parsed.output || 
                     parsed.message || 
                     "No response received.";

      const aiMessage: Message = { role: "assistant", content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Failed to get response from server." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
        AI Market Assistant
      </div>

      <div className="flex-1 max-h-96 overflow-y-auto space-y-4 border border-slate-800 rounded-lg p-4 bg-slate-900/80">
        {messages.length === 0 && (
          <div className="text-slate-500 text-sm italic">
            Ask anything like "Cobalt Ore price" or "How to get Cobalt Ore?"
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-sky-600 text-white ml-8"
                : "bg-slate-700 text-slate-100 mr-8"
            }`}
          >
            <span className="block text-xs opacity-70 mb-1">
              {m.role === "user" ? "You" : "AI"}
            </span>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-2xl focus:outline-none focus:border-sky-500"
          placeholder="Ask about any item..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 rounded-2xl font-medium"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}