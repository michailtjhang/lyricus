import { Suspense } from "react";
import { db } from "@/lib/db";
import { tags } from "@/drizzle/schema";
import SongCard from "@/components/SongCard";
import TagFilter from "@/components/TagFilter";
import type { SongCard as SongCardType, Tag } from "@/types/song";
import { Search, Sparkles, Library } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>;
}

async function getSongs(q?: string, tag?: string, sort?: string): Promise<SongCardType[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  if (sort) params.set("sort", sort);

  const res = await fetch(`${baseUrl}/api/songs?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.songs || [];
}

async function getAllTags(): Promise<Tag[]> {
  const result = await db.select().from(tags).orderBy(tags.category, tags.name);
  return result as Tag[];
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { q, tag, sort } = params;

  const [songsList, allTags] = await Promise.all([
    getSongs(q, tag, sort),
    getAllTags(),
  ]);

  const isFiltered = !!(q || tag);

  return (
    <div className="hero-gradient min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Hero Section */}
        {!isFiltered && (
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Pustaka Lirik Lagu Interaktif
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              <span className="text-white">Temukan </span>
              <span className="gradient-text">Lirik Lagu</span>
              <br />
              <span className="text-white">Favoritmu</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Koleksi lirik worship, praise, dan hymn lengkap dengan nada dasar,
              tempo, dan alur lagu terstruktur.
            </p>
          </div>
        )}

        {/* Filtered Header */}
        {isFiltered && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Search className="h-4 w-4" />
              {q && <span>Hasil pencarian: <span className="text-white font-medium">&ldquo;{q}&rdquo;</span></span>}
              {tag && <span>Filter: <span className="text-white font-medium">#{tag}</span></span>}
            </div>
            <p className="text-slate-600 text-xs">{songsList.length} lagu ditemukan</p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 xl:w-60 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Library className="h-4 w-4 text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-300">Filter</p>
                </div>
                <TagFilter allTags={allTags} />
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Statistik</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Total Lagu</span>
                    <span className="text-xs font-semibold text-indigo-400">{songsList.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Total Tag</span>
                    <span className="text-xs font-semibold text-violet-400">{allTags.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {isFiltered ? `${songsList.length} lagu` : `${songsList.length} lagu tersedia`}
              </p>
              <div className="flex items-center gap-1">
                {[
                  { value: "recent", label: "Terbaru" },
                  { value: "alpha", label: "A–Z" },
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(tag ? { tag } : {}), sort: opt.value }).toString()}`}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      (sort || "recent") === opt.value
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Song Grid */}
            {songsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {songsList.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium mb-1">Lagu tidak ditemukan</p>
                <p className="text-slate-600 text-sm">Coba kata kunci atau filter yang berbeda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
