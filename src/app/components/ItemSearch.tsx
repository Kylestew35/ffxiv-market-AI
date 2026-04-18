// frontend/src/app/components/ItemSearch.tsx

"use client";

import { useState } from "react";

type Props = {
  onResults: (items: { id: number; name: string }[]) => void;
};

export function ItemSearch({ onResults }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !backend) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${backend}/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      onResults(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex gap-3 items-center bg-slate-900/70 border border-sky-700/60 rounded-xl px-4 py-3 shadow-[0_0_18px_rgba(15,23,42,0.9)]"
    >
      <div className="flex flex-col flex-1">
        <label className="text-xs uppercase tracking-[0.2em] text-sky-300/80 mb-1">
          Marketboard Search
        </label>
        <input
          className="w-full rounded-md bg-slate-900 text-slate-100 placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search item (e.g. spruce)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="from-sky-500 to-indigo-600 border border-sky-300 text-sm font-semibold tracking-wide shadow-[0_0_16px_rgba(56,189,248,0.7)] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Scanning..." : "Search"}
      </button>
    </form>
  );
}
