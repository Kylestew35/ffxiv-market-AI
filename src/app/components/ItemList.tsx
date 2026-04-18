// frontend/src/app/components/ItemList.tsx

"use client";

type Item = {
  id: number;
  name: string;
  icon?: string | null;
};

type Props = {
  items: Item[];
  selectedId: number | null;
  onSelect: (item: Item) => void;
};

export function ItemList({ items, selectedId, onSelect }: Props) {
  return (
    <div className="h-full bg-slate-950/80 border border-sky-800/70 rounded-xl p-3 shadow-[0_0_22px_rgba(15,23,42,0.95)]">
      <div className="text-xs uppercase tracking-[0.25em] text-sky-300/80 mb-2">
        Results
      </div>

      <div className="w-full rounded-md bg-slate-900 text-slate-100 px-3 py-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full flex items-center gap-3 text-left px-3 py-1.5 rounded-lg text-sm transition
              ${
                selectedId === item.id
                  ? "bg-sky-700/70 border border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.7)]"
                  : "bg-slate-900/80 border border-slate-700 hover:border-sky-400 hover:bg-slate-800/90"
              }`}
          >
            {item.icon && (
              <img
                src={item.icon}
                alt=""
                className="w-6 h-6 rounded-sm object-contain"
              />
            )}

            <span>{item.name}</span>
          </button>
        ))}

        {items.length === 0 && (
          <div className="text-xs text-slate-500 mt-2">
            No items yet. Use the search above.
          </div>
        )}
      </div>
    </div>
  );
}
