// frontend/src/app/page.tsx

"use client";

import { useState } from "react";
import { ServerSelector } from "./components/ServerSelector";
import { ItemSearch } from "./components/ItemSearch";
import { ItemList } from "./components/ItemList";
import { ItemDetail } from "./components/ItemDetail";
import { ChatWindow } from "./components/ChatWindow";

type Item = { id: number; name: string };

export default function Page() {
  const [world, setWorld] = useState("Balmung");
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);

  return (
    <main className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      <header className="space-y-3">
        <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
          Eorzean Market Intelligence
        </div>
          <h1 className="text-xl font-bold text-slate-500">
           FFXIV Market AI
          </h1>


        <p className="text-sm text-slate-300 max-w-2xl">
          Choose your world, search an item, and view raw market data and
          options. Use the AI question box separately for general market
          questions—no session, no saved context.
        </p>
      </header>

      <section className="space-y-3">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Select your world
        </div>
        <ServerSelector world={world} onChange={setWorld} />
      </section>

      <section>
        <ItemSearch
          onResults={(res) => {
            setItems(res);
            setSelected(null);
          }}
        />
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-1">
          <ItemList
            items={items}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        </div>
        <div className="md:col-span-2">
          <ItemDetail world={world} itemId={selected?.id ?? null} />
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-3">
          <ChatWindow world={world} />
        </div>
      </section>
    </main>
  );
}
