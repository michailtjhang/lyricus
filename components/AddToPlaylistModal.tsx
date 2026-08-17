"use client";

import { useState, useEffect } from "react";
import { ListMusic, Plus, Check, X, Loader2 } from "lucide-react";
import type { Playlist } from "@/types/song";

interface AddToPlaylistModalProps {
  songId: string;
  songTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToPlaylistModal({
  songId,
  songTitle,
  isOpen,
  onClose,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("/api/playlists")
      .then((res) => res.json())
      .then((data) => {
        setPlaylists(data.playlists || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (playlistId: string) => {
    setAddingId(playlistId);
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (res.ok) {
        setAddedIds((prev) => [...prev, playlistId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Tambah ke Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Pilih playlist ibadah untuk menambahkan <span className="text-white font-semibold">&ldquo;{songTitle}&rdquo;</span>:
        </p>

        {/* Playlists list */}
        {loading ? (
          <div className="py-8 text-center text-slate-500 flex justify-center items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            <span className="text-xs">Memuat playlist...</span>
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {playlists.map((pl) => {
              const isAdded = addedIds.includes(pl.id);
              const isAdding = addingId === pl.id;

              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-slate-950/60 hover:bg-slate-800/60 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-white">{pl.name}</h4>
                    {pl.eventDate && (
                      <p className="text-[11px] text-slate-500">{pl.eventDate}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleAdd(pl.id)}
                    disabled={isAdded || isAdding}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isAdded
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="h-3 w-3" />
                        Tersimpan
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Tambah
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-6 text-xs text-slate-500">Belum ada playlist.</p>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-300 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
