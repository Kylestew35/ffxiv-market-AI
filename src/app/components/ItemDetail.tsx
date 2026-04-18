// frontend/src/app/components/ItemDetail.tsx

"use client";

import { useEffect, useState } from "react";

type Recommendation = {
  item: { id: number; name: string };
  currentWorld: string;
  marketSummary: {
    minNQ: number | null;
    minHQ: number | null;
    numListings: number;
  };
  worldSummaries?: {
    [world: string]: {
      minNQ: number | null;
      minHQ: number | null;
      numListings: number;
    };
  };
  options: {
    id: string;
    label: string;
    world?: string;
    minNQ?: number | null;
    minHQ?: number | null;
    reason: string;
  }[];
  aiInsight?: string;
};

type Props = {
  world: string;
  itemId: number | null;
};

export function ItemDetail({ world, itemId }: Props) {
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!world || !itemId || !backend) {
      setData(null);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${backend}/market?world=${encodeURIComponent(
            world,
          )}&itemId=${itemId}`,
        );
        const json = await res.json();

        if (json.error) {
          console.error("Market error:", json.error);
          setData({
            item: { id: itemId, name: "Unknown item" },
            currentWorld: world,
            marketSummary: {
              minNQ: null,
              minHQ: null,
              numListings: 0,
            },
            worldSummaries: {},
            options: [],
            aiInsight:
              "There was a problem loading market data for this item. Please try another item or ask the AI below.",
          });
        } else {
          setData(json);
        }
      } catch (e) {
        console.error("Market fetch failed:", e);
        setData({
          item: { id: itemId, name: "Unknown item" },
          currentWorld: world,
          marketSummary: {
            minNQ: null,
            minHQ: null,
            numListings: 0,
          },
          worldSummaries: {},
          options: [],
          aiInsight:
            "There was a problem loading market data for this item. Please try another item or ask the AI below.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [world, itemId, backend]);

  if (!itemId) {
    return (
      <div className="h-full bg-slate-950/90 border border-slate-700 rounded-xl p-5 flex items-center justify-center text-slate-400 text-sm">
        Select an item from the list to view market data.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-slate-950/90 border border-slate-700 rounded-xl p-5 flex items-center justify-center text-sm">
        Loading market data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full bg-slate-950/90 border border-slate-700 rounded-xl p-5 flex items-center justify-center text-sm">
        No data available for this item.
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950/90 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">
            Item Insight
          </div>
          <h2 className="text-2xl font-semibold text-slate-100">
            {data.item.name}
          </h2>
          <div className="text-xs text-slate-400 mt-1">
            World: <span className="text-slate-200">{data.currentWorld}</span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          Listings:{" "}
          <span className="text-slate-200">
            {data.marketSummary.numListings}
          </span>
          <br />
          Min NQ:{" "}
          <span className="text-emerald-300">
            {data.marketSummary.minNQ ?? "—"}
          </span>{" "}
          gil
          <br />
          Min HQ:{" "}
          <span className="text-amber-300">
            {data.marketSummary.minHQ ?? "—"}
          </span>{" "}
          gil
        </div>
      </div>

      {data.aiInsight && (
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 leading-relaxed">
          {data.aiInsight.split("\n").map((line, idx) =>
            line.trim() ? (
              <p key={idx} className="mb-2 last:mb-0">
                {line}
              </p>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
