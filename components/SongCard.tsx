import Link from "next/link";
import { Hash, ChevronRight, Music } from "lucide-react";
import type { SongCard as SongCardType } from "@/types/song";

const TAG_COLORS: Record<string, string> = {
  Worship: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  Praise: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Hymn: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  Contemporary: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  Indonesian: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  English: "bg-teal-500/15 text-teal-300 border-teal-500/20",
  Bilingual: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Slow: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Upbeat: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Acoustic: "bg-stone-500/15 text-stone-300 border-stone-500/20",
  Easter: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Christmas: "bg-red-500/15 text-red-300 border-red-500/20",
};

export function TagBadge({ name }: { name: string }) {
  const colorClass = TAG_COLORS[name] || "bg-slate-500/15 text-slate-300 border-slate-500/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
      <Hash className="h-2.5 w-2.5" />
      {name}
    </span>
  );
}

export default function SongCard({ song }: { song: SongCardType }) {
  const gradients = [
    "from-indigo-600 to-violet-700",
    "from-sky-600 to-indigo-700",
    "from-violet-600 to-purple-800",
    "from-emerald-600 to-teal-700",
    "from-rose-600 to-pink-700",
    "from-amber-600 to-orange-700",
  ];
  const gradientIndex = song.title.charCodeAt(0) % gradients.length;
  const gradient = gradients[gradientIndex];

  return (
    <Link
      href={`/songs/${song.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-sm p-5 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Music className="h-5 w-5 text-white/90" />
        </div>

        {/* Title & Artist */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-tight truncate group-hover:text-indigo-200 transition-colors">
            {song.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 truncate">{song.artist}</p>
        </div>

        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
      </div>

      {/* Tags */}
      {song.tags && song.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.04]">
          {song.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
        </div>
      )}
    </Link>
  );
}
