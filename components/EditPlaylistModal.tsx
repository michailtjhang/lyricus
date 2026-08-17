"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Save, Trash2, ArrowUp, ArrowDown, Loader2, Plus, Search, Music } from "lucide-react";
import type { PlaylistWithSongs, PlaylistSongItem, SongCard } from "@/types/song";
import { getAuthHeaders } from "@/lib/auth";

interface EditPlaylistModalProps {
  playlist: PlaylistWithSongs;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditPlaylistModal({
  playlist,
  isOpen,
  onClose,
  onSaved,
}: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [eventDate, setEventDate] = useState(playlist.eventDate || "");
  const [items, setItems] = useState<PlaylistSongItem[]>(playlist.playlistSongs || []);

  // Song search state to add new songs inside modal
  const [searchQuery, setSearchQuery] = useState("");
  const [availableSongs, setAvailableSongs] = useState<SongCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(playlist.name);
    setDescription(playlist.description || "");
    setEventDate(playlist.eventDate || "");
    setItems(playlist.playlistSongs || []);
  }, [playlist]);

  // Fetch available songs when search box is opened
  useEffect(() => {
    if (!showAddSection) return;
    setSearching(true);
    fetch(`/api/songs?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSongs(data.songs || []);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  }, [showAddSection, searchQuery]);

  if (!isOpen) return null;

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setItems(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setItems(next);
  };

  const handleRemoveSong = (songId: string) => {
    setItems((prev) => prev.filter((it) => it.songId !== songId));
  };

  const handleAddSongToSetlist = (song: SongCard) => {
    if (items.some((it) => it.songId === song.id)) return;
    const newItem: PlaylistSongItem = {
      id: Date.now().toString(),
      playlistId: playlist.id,
      songId: song.id,
      orderIndex: items.length,
      song: {
        ...song,
        lyricSections: [],
      },
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama playlist wajib diisi");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name,
          description,
          eventDate,
          songIds: items.map((it) => it.songId),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui playlist");
      }

      setSaving(false);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui playlist");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-base">Edit Playlist & List Lagu</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Playlist Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Playlist <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ibadah AbbaYouth"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Tanggal Ibadah
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi Playlist
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Setlist ibadah..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Song List Reordering & Managing */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                List Lagu dalam Playlist ({items.length}):
              </label>
              <button
                type="button"
                onClick={() => setShowAddSection(!showAddSection)}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="h-3 w-3" />
                {showAddSection ? "Tutup Cari Lagu" : "Tambah Lagu Baru Ke Playlist"}
              </button>
            </div>

            {/* Sub-panel: Add new songs search inside modal */}
            {showAddSection && (
              <div className="p-3 mb-3 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2 animate-in fade-in">
                <p className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" /> Cari lagu untuk ditambahkan ke setlist:
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik judul lagu..."
                    className="w-full rounded-lg border border-white/10 bg-slate-900 py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                {searching ? (
                  <div className="py-2 text-center text-slate-500 text-xs flex items-center justify-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" /> Mencari...
                  </div>
                ) : availableSongs.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {availableSongs.map((s) => {
                      const alreadyIn = items.some((it) => it.songId === s.id);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/5 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-white">{s.title}</span>
                            <span className="text-slate-400 ml-1.5">({s.artist})</span>
                          </div>
                          <button
                            type="button"
                            disabled={alreadyIn}
                            onClick={() => handleAddSongToSetlist(s)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              alreadyIn
                                ? "bg-slate-800 text-slate-500"
                                : "bg-indigo-600 text-white hover:bg-indigo-500"
                            }`}
                          >
                            {alreadyIn ? "Sudah Ada" : "+ Tambah"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 text-center py-2">Tidak ada lagu yang cocok.</p>
                )}
              </div>
            )}

            {/* List of current setlist songs */}
            {items.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.06] bg-slate-950/70"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-indigo-400 shrink-0 w-5">
                        {idx + 1}.
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{it.song.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{it.song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20"
                        title="Geser Ke Atas"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20"
                        title="Geser Ke Bawah"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSong(it.songId)}
                        className="p-1 rounded text-rose-400 hover:bg-rose-500/10 ml-1"
                        title="Hapus dari Playlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada lagu di playlist ini.</p>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
