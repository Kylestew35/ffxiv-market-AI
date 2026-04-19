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
          world: world,           // Make sure this matches your Lambda
          // dataCenter: "Aether" // Remove if not used in Lambda
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("🔍 Full response from Lambda:", data); // ← Helpful for debugging

      // More robust way to get the AI response
      let aiText = "Sorry, I couldn't get a response.";

      if (data.output) {
        aiText = data.output;
      } else if (data.message) {
        aiText = data.message;
      } else if (typeof data === "string") {
        aiText = data;
      }

      const aiMessage: Message = { role: "assistant", content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Frontend fetch error:", error);
      const errorMsg: Message = {
        role: "assistant",
        content: "Error connecting to server. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950/90 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
        AI Market Assistant
      </div>

      <div className="max-h-80 overflow-y-auto space-y-3 border border-slate-800 rounded-lg p-3 bg-slate-900/80">
        {messages.length === 0 && (
          <div className="text-xs text-slate-500 italic">
            Ask about any item price, crafting, gathering, or market tips.
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`text-sm whitespace-pre-wrap p-2 rounded-lg ${
              m.role === "user"
                ? "bg-slate-800 text-slate-100 ml-8"
                : "bg-slate-700/70 text-slate-200 mr-8"
            }`}
          >
            <span className="text-xs uppercase text-slate-400 block mb-1">
              {m.role === "user" ? "You" : "AI"}
            </span>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-sky-500"
          placeholder="e.g. What's the price of Cobalt Ore?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-sm font-medium transition"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}