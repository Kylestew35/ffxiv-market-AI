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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const responseData = await res.json();
      console.log("📦 Full Lambda Response:", responseData); // Debugging

      // === CRITICAL FIX: Parse the body string ===
      let parsedBody;
      try {
        parsedBody = typeof responseData.body === "string"
          ? JSON.parse(responseData.body)
          : responseData.body || responseData;
      } catch (e) {
        parsedBody = responseData;
      }

      const aiText = parsedBody.output || 
                     parsedBody.message || 
                     "No response from server.";

      const aiMessage: Message = { 
        role: "assistant", 
        content: aiText 
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "❌ Error connecting to server. Please try again." 
        }
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
            Try asking: "What's Cobalt Ore price?" or "How to get Cobalt Ore?"
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl text-sm ${
              m.role === "user"
                ? "bg-sky-600/90 text-white ml-8"
                : "bg-slate-700 text-slate-100 mr-8"
            }`}
          >
            <span className="block text-xs opacity-70 mb-1">
              {m.role === "user" ? "You" : "AI Assistant"}
            </span>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-2xl text-sm focus:outline-none focus:border-sky-500"
          placeholder="Ask about any item (e.g. Cobalt Ore price)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 rounded-2xl text-sm font-medium transition-colors"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}