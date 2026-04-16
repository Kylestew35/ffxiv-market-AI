// frontend/src/app/components/ServerSelector.tsx

"use client";

type Props = {
  world: string;
  onChange: (world: string) => void;
};

const WORLDS = [
  "Balmung",
  "Brynhildr",
  "Coeurl",
  "Diabolos",
  "Goblin",
  "Malboro",
  "Mateus",
  "Zalera",
];

export function ServerSelector({ world, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {WORLDS.map((w) => {
        const selected = world === w;
        return (
          <button
            key={w}
            onClick={() => onChange(w)}
            className={`px-4 py-1.5 rounded-full border text-sm tracking-wide transition
              ${
                selected
                  ? "border-amber-400 bg-gradient-to-r from-sky-600 to-indigo-700 shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                  : "border-slate-600 bg-slate-900/70 hover:border-sky-400 hover:bg-slate-800/80"
              }`}
          >
            {w}
          </button>
        );
      })}
    </div>
  );
}
