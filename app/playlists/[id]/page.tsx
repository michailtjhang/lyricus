"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Loader2,
  ListMusic,
  Edit3,
  Music,
  Tag as TagIcon,
} from "lucide-react";
import LyricBlock from "@/components/LyricBlock";
import SongFlow from "@/components/SongFlow";
import EditPlaylistModal from "@/components/EditPlaylistModal";
import AuthModal from "@/components/AuthModal";
import CopySetlistButton from "@/components/CopySetlistButton";
import { isClientAuthenticated } from "@/lib/auth";
import type { PlaylistWithSongs, LyricSection } from "@/types/song";


export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [playlist, setPlaylist] = useState<PlaylistWithSongs | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSongIndex, setActiveSongIndex] = useState(0);

  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [stageMode, setStageMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isClientAuthenticated());
  }, []);

  const handleOpenEditPlaylist = () => {
    if (!isClientAuthenticated()) {
      setAuthModalOpen(true);
    } else {
      setEditModalOpen(true);
    }
  };



  const loadPlaylist = () => {
    setLoading(true);
    fetch(`/api/playlists/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data.playlist || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        <span>Memuat setlist ibadah...</span>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <p>Playlist tidak ditemukan</p>
        <Link href="/playlists" className="text-xs text-indigo-400 hover:underline">
          Kembali ke daftar playlist
        </Link>
      </div>
    );
  }

  const songsList = playlist.playlistSongs ? playlist.playlistSongs.map((ps) => ps.song) : [];
  const currentSong = songsList[activeSongIndex];

  const fontSizeClasses = {
    sm: "text-sm leading-6",
    base: "text-base leading-7",
    lg: "text-lg leading-8 font-medium",
    xl: "text-xl sm:text-2xl leading-9 font-semibold",
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${stageMode ? "pb-32" : "pb-20"}`}>
      {/* Top Banner (hidden in stage mode) */}
      {!stageMode && (
        <div className="border-b border-white/[0.06] bg-slate-900/70 backdrop-blur-md sticky top-16 z-30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
            <Link
              href="/playlists"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Playlist
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ListMusic className="h-5 w-5 text-indigo-400" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{playlist.name}</h1>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {playlist.eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Tanggal Ibadah: <span className="text-white font-semibold">{playlist.eventDate}</span>
                    </span>
                  )}
                  <span>• {songsList.length} Lagu</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <CopySetlistButton playlistName={playlist.name} songs={playlist.playlistSongs || []} />

                {authenticated && (
                  <button
                    onClick={handleOpenEditPlaylist}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="h-4 w-4 text-amber-300" />
                    Edit Playlist & Tanggal
                  </button>
                )}

                <button
                  onClick={() => setStageMode(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
                >
                  <Maximize2 className="h-4 w-4 text-indigo-400" />
                  Mode Panggung (Stage View)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Mode Header bar */}
      {stageMode && (
        <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setStageMode(false)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <Minimize2 className="h-4 w-4" /> Keluar Mode Panggung
          </button>

          {/* Font controls */}
          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Teks:</span>
            <button
              onClick={() => setFontSize(fontSize === "xl" ? "lg" : fontSize === "lg" ? "base" : "sm")}
              className="p-1 text-slate-300 hover:text-white"
              title="Kecilkan Teks"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-indigo-400 uppercase">{fontSize}</span>
            <button
              onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : "xl")}
              className="p-1 text-slate-300 hover:text-white"
              title="Besarkan Teks"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Left (Song List Top-to-Bottom) + Right (Lyrics Content) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {songsList.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar: Vertical Setlist Songs (Top to Bottom) */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="sticky top-40 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4 space-y-3 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ListMusic className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Setlist Lagu ({songsList.length})
                    </h3>
                  </div>
                  {authenticated && (
                    <button
                      onClick={handleOpenEditPlaylist}
                      className="text-[11px] text-indigo-400 hover:underline font-semibold"
                    >
                      Edit List
                    </button>
                  )}

                </div>

                {/* Vertical Songs List */}
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {songsList.map((song, idx) => {
                    const isActive = activeSongIndex === idx;

                    return (
                      <button
                        key={song.id}
                        onClick={() => setActiveSongIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                          isActive
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/50"
                            : "bg-slate-950/60 border-white/[0.06] text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">{song.title}</p>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isActive ? "text-indigo-100" : "text-slate-400"
                            }`}
                          >
                            {song.artist}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Right Main Content: Active Song Details & Lyrics */}
            <main className="flex-1 min-w-0">
              {currentSong && (
                <div>
                  {/* Current Song Card */}
                  <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-sm mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-4">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold mb-2">
                          Lagu ke-{activeSongIndex + 1} dari {songsList.length}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">{currentSong.title}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-0.5">{currentSong.artist}</p>
                      </div>
                    </div>

                    {/* Song Flow */}
                    {currentSong.songFlow && currentSong.songFlow.length > 0 && (
                      <SongFlow flow={currentSong.songFlow} sections={currentSong.lyricSections || []} />
                    )}
                  </div>

                  {/* Lyric Blocks Display */}
                  {currentSong.lyricSections && (
                    <div className="max-w-2xl mx-auto space-y-4">
                      {currentSong.lyricSections.map((section: LyricSection) => (
                        <LyricBlock
                          key={section.id}
                          section={section}
                          fontSizeClass={fontSizeClasses[fontSize]}
                        />
                      ))}
                    </div>
                  )}

                  {/* Prev / Next Song Navigation */}
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
                    <button
                      disabled={activeSongIndex === 0}
                      onClick={() => setActiveSongIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Lagu Sebelumnya
                    </button>

                    <button
                      disabled={activeSongIndex === songsList.length - 1}
                      onClick={() => setActiveSongIndex((prev) => Math.min(songsList.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 shadow-md shadow-indigo-600/30"
                    >
                      Lagu Berikutnya <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p>Belum ada lagu di playlist ini.</p>
          </div>
        )}
      </div>

      {/* Mobile Sticky Section Quick Jump Bar */}
      {currentSong && currentSong.lyricSections && currentSong.lyricSections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-3 py-2.5 shadow-2xl">
          <div className="mx-auto max-w-md flex items-center justify-center gap-1.5 overflow-x-auto">
            {currentSong.lyricSections.map((sec: LyricSection) => (
              <a
                key={sec.id}
                href={`#section-${sec.sectionLabel.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-white/10 whitespace-nowrap transition-all"
              >
                {sec.sectionLabel}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        playlist={playlist}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={loadPlaylist}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setEditModalOpen(true)}
        title="Verifikasi Admin untuk Edit Playlist"
      />
    </div>

  );
}
