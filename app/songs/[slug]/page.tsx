export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Music, Clock, Calendar, ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import LyricBlock from "@/components/LyricBlock";
import SongFlow from "@/components/SongFlow";
import SongDetailActions from "@/components/SongDetailActions";
import CopyLyricsButton from "@/components/CopyLyricsButton";
import { TagBadge } from "@/components/SongCard";
import type { SongWithDetails } from "@/types/song";


interface PageProps {
  params: Promise<{ slug: string }>;
}

import { db } from "@/lib/db";
import { songs } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

async function getSong(slug: string): Promise<SongWithDetails | null> {
  try {
    const song = await db.query.songs.findFirst({
      where: eq(songs.slug, slug),
      with: {
        lyricSections: {
          orderBy: (sec, { asc }) => [asc(sec.orderIndex)],
        },
        songTags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!song) return null;

    return {
      ...song,
      tags: song.songTags.map((st) => st.tag),
      lyricSections: song.lyricSections,
    } as any;
  } catch (err) {
    console.error("Error fetching song detail:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) return { title: "Lagu Tidak Ditemukan" };

  return {
    title: `${song.title} — ${song.artist}`,
    description: `Lirik lagu ${song.title} oleh ${song.artist}. Nada dasar: ${song.key || "—"}, Tempo: ${song.tempo ? song.tempo + " BPM" : "—"}.`,
    openGraph: {
      title: `${song.title} — ${song.artist} | Lyricus`,
      description: `Lirik lagu ${song.title} lengkap dengan alur lagu dan metadata.`,
    },
  };
}

const GRADIENT_CLASSES = [
  "from-indigo-600 via-violet-700 to-purple-800",
  "from-sky-600 via-indigo-700 to-violet-800",
  "from-violet-600 via-purple-700 to-fuchsia-800",
  "from-emerald-600 via-teal-700 to-cyan-800",
  "from-rose-600 via-pink-700 to-fuchsia-800",
  "from-amber-600 via-orange-700 to-red-800",
];

export default async function SongDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const song = await getSong(slug);

  if (!song) notFound();

  const gradientIndex = song.title.charCodeAt(0) % GRADIENT_CLASSES.length;
  const gradient = GRADIENT_CLASSES[gradientIndex];

  // Sort lyric sections by order_index
  const sortedSections = [...song.lyricSections].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Banner Header */}
      <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke katalog
          </Link>

          {/* Song info */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Text info */}
            <div className="flex-1">
              {/* Tags */}
              {song.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {song.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-semibold border border-white/20"
                    >
                      <Hash className="h-2.5 w-2.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {song.title}
                </h1>
                <CopyLyricsButton sections={sortedSections} />
              </div>
              <p className="text-white/75 text-lg font-medium mb-6">{song.artist}</p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <SongDetailActions songId={song.id} songSlug={song.slug} songTitle={song.title} />
              </div>
            </div>
          </div>



          {/* Song Flow */}
          {song.songFlow.length > 0 && (
            <div className="mt-8 p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
              <SongFlow flow={song.songFlow} sections={sortedSections} />
            </div>
          )}
        </div>
      </div>

      {/* Lyric Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold px-2">
              Lirik Lagu
            </p>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {sortedSections.map((section) => (
            <LyricBlock key={section.id} section={section} />
          ))}

          {/* End marker */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <p className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold px-2">
              — Fine —
            </p>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  );
}
