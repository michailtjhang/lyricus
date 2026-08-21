"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const SECTION_COLORS: Record<string, string> = {
  INTRO: "bg-slate-700/60 text-slate-300 border-slate-600/40",
  VERSE: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30",
  PRE_CHORUS: "bg-violet-500/20 text-violet-200 border-violet-500/30",
  CHORUS: "bg-sky-500/20 text-sky-200 border-sky-500/30",
  POST_CHORUS: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
  BRIDGE: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  INTERLUDE: "bg-slate-700/60 text-slate-300 border-slate-600/40",
  OUTRO: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  TAG: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  ENDING: "bg-rose-500/20 text-rose-200 border-rose-500/30",
};

interface SongFlowProps {
  flow: string[];
  sections: { sectionLabel: string; sectionType: string }[];
}

export default function SongFlow({ flow, sections }: SongFlowProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getSectionType = (label: string): string => {
    const found = sections.find(
      (s) => s.sectionLabel.toLowerCase() === label.toLowerCase()
    );
    return found?.sectionType || "VERSE";
  };

  return (
    <div className="w-full">
      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
        Alur Lagu
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {flow.map((label, idx) => {
          const sectionType = getSectionType(label);
          const colorClass = SECTION_COLORS[sectionType] || SECTION_COLORS["VERSE"];
          const isActive = activeIndex === idx;

          return (
            <div key={idx} className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveIndex(isActive ? null : idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  isActive
                    ? `${colorClass} ring-2 ring-offset-1 ring-offset-slate-900 ring-current scale-105 shadow-lg`
                    : `${colorClass} hover:scale-105`
                }`}
              >
                {label}
              </button>
              {idx < flow.length - 1 && (
                <ChevronRight className="h-3 w-3 text-slate-700 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
