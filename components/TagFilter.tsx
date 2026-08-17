"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Hash, X } from "lucide-react";
import type { Tag } from "@/types/song";
import { Suspense } from "react";

const TAG_COLORS: Record<string, string> = {
  Worship: "data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:border-sky-400 border-sky-500/30 text-sky-400 hover:bg-sky-500/10",
  Praise: "data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-400 border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
  Hymn: "data-[active=true]:bg-purple-500 data-[active=true]:text-white data-[active=true]:border-purple-400 border-purple-500/30 text-purple-400 hover:bg-purple-500/10",
  Contemporary: "data-[active=true]:bg-indigo-500 data-[active=true]:text-white data-[active=true]:border-indigo-400 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10",
  Indonesian: "data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-400 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
  English: "data-[active=true]:bg-teal-500 data-[active=true]:text-white data-[active=true]:border-teal-400 border-teal-500/30 text-teal-400 hover:bg-teal-500/10",
  Bilingual: "data-[active=true]:bg-cyan-500 data-[active=true]:text-white data-[active=true]:border-cyan-400 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10",
  Slow: "data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:border-blue-400 border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
  Upbeat: "data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:border-orange-400 border-orange-500/30 text-orange-400 hover:bg-orange-500/10",
};

interface TagFilterProps {
  allTags: Tag[];
}

function TagFilterContent({ allTags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === tagName) {
      params.delete("tag");
    } else {
      params.set("tag", tagName);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const categories = [
    { label: "Genre", types: ["GENRE"] },
    { label: "Bahasa", types: ["LANGUAGE"] },
    { label: "Tema", types: ["THEME"] },
  ];

  return (
    <div className="space-y-4">
      {categories.map(({ label, types }) => {
        const categoryTags = allTags.filter((t) => types.includes(t.category));
        if (categoryTags.length === 0) return null;
        return (
          <div key={label}>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag) => {
                const colorClass = TAG_COLORS[tag.name] || "data-[active=true]:bg-slate-500 data-[active=true]:text-white border-slate-500/30 text-slate-400 hover:bg-slate-500/10";
                return (
                  <button
                    key={tag.id}
                    data-active={activeTag === tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-transparent transition-all duration-200 ${colorClass}`}
                  >
                    <Hash className="h-2.5 w-2.5" />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeTag && (
        <button
          onClick={() => handleTagClick(activeTag)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
        >
          <X className="h-3 w-3" />
          Hapus filter
        </button>
      )}
    </div>
  );
}

export default function TagFilter({ allTags }: TagFilterProps) {
  return (
    <Suspense fallback={<div className="h-20 animate-pulse bg-white/5 rounded-xl" />}>
      <TagFilterContent allTags={allTags} />
    </Suspense>
  );
}
