export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ListMusic, Calendar, ChevronRight, Plus, Sparkles, Music } from "lucide-react";
import type { PlaylistWithSongs } from "@/types/song";

import { db } from "@/lib/db";

function getPlaylistPriority(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes("natal")) return 3;
  if (lower.includes("worship")) return 2;
  if (lower.includes("ibadah")) return 1;
  return 4;
}

async function getPlaylists(): Promise<PlaylistWithSongs[]> {
  try {
    const list = await db.query.playlists.findMany({
      with: {
        playlistSongs: {
          with: {
            song: {
              with: {
                songTags: {
                  with: {
                    tag: true,
                  },
                },
              },
            },
          },
          orderBy: (ps, { asc }) => [asc(ps.orderIndex)],
        },
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    const formatted = list
      .map((p) => ({
        ...p,
        playlistSongs: p.playlistSongs.map((ps) => ({
          ...ps,
          song: {
            ...ps.song,
            tags: ps.song.songTags.map((st) => st.tag),
          },
        })),
      }))
      .sort((a, b) => {
        const priorityDiff = getPlaylistPriority(a.name) - getPlaylistPriority(b.name);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return formatted as any[];
  } catch (err) {
    console.error("Error fetching playlists:", err);
    return [];
  }
}

export default async function PlaylistsPage() {
  const playlists = await getPlaylists();

  return (
    <div className="hero-gradient min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-white/[0.06] pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Setlist Ibadah
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Playlist Ibadah AbbaYouth</h1>
            <p className="text-sm text-slate-400 mt-1">
              Daftar urutan lagu untuk pelayanan worship team, singer, dan pelayan musik.
            </p>
          </div>
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((pl) => {
            const songCount = pl.playlistSongs ? pl.playlistSongs.length : 0;

            return (
              <Link
                key={pl.id}
                href={`/playlists/${pl.slug || pl.id}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-sm hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                      <ListMusic className="h-5 w-5" />
                    </div>
                    {pl.eventDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-300">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        {pl.eventDate}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors mb-1">
                    {pl.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {pl.description || "Setlist ibadah AbbaYouth"}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Music className="h-3.5 w-3.5 text-indigo-400" />
                    {songCount} Lagu
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Buka Setlist
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
