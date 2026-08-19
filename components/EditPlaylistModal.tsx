import { useState, useEffect } from "react";
import { X, Calendar, Save, Trash2, ArrowUp, ArrowDown, Loader2, Plus, Search, Music, Tag, Heading, Link2 } from "lucide-react";
import type { PlaylistWithSongs, PlaylistSongItem, SongCard } from "@/types/song";
import { getAuthHeaders } from "@/lib/auth";

interface EditPlaylistModalProps {
  playlist: PlaylistWithSongs;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const PRESET_HEADERS = [
  "Pujian",
  "Penyembahan",
  "Medley Praise",
  "Medley Worship",
  "Perjamuan Kudus",
  "Altar Call",
  "Persembahan",
  "Respon",
  "Penutup",
];

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
  const [showAddSong, setShowAddSong] = useState(false);
  const [showAddHeader, setShowAddHeader] = useState(false);
  const [customHeaderInput, setCustomHeaderInput] = useState("");

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
    if (!showAddSong) return;
    setSearching(true);
    fetch(`/api/songs?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSongs(data.songs || []);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  }, [showAddSong, searchQuery]);

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

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSongToSetlist = (song: SongCard) => {
    if (items.some((it) => it.songId === song.id)) return;
    const newItem: PlaylistSongItem = {
      id: "ps-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      playlistId: playlist.id,
      songId: song.id,
      headerLabel: null,
      orderIndex: items.length,
      song: {
        ...song,
        lyricSections: [],
      },
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddHeaderItem = (headerText: string) => {
    const label = headerText.trim();
    if (!label) return;
    const newItem: PlaylistSongItem = {
      id: "hdr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      playlistId: playlist.id,
      songId: null,
      headerLabel: label,
      orderIndex: items.length,
      song: null,
    };
    setItems((prev) => [...prev, newItem]);
    setCustomHeaderInput("");
  };

  const handleUpdateHeaderLabel = (index: number, newLabel: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], headerLabel: newLabel };
      return next;
    });
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
          items: items.map((it) => ({
            songId: it.songId || null,
            headerLabel: it.headerLabel || null,
            isMedley: Boolean(it.isMedley),
          })),
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
          <h3 className="font-bold text-white text-base">Edit Playlist & Setlist Lagu</h3>
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

          {/* Item Management Section */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                Susunan Setlist ({items.length} item):
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHeader(!showAddHeader);
                    if (showAddSong) setShowAddSong(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Heading className="h-3 w-3" />
                  + Header / Pembatas
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddSong(!showAddSong);
                    if (showAddHeader) setShowAddHeader(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  + Tambah Lagu
                </button>
              </div>
            </div>

            {/* Sub-panel 1: Add Header / Pembatas */}
            {showAddHeader && (
              <div className="p-3 mb-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5 animate-in fade-in">
                <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                  <Heading className="h-3.5 w-3.5" /> Tambah Pembatas / Section Header:
                </p>

                {/* Preset badges */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_HEADERS.map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => handleAddHeaderItem(ph)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-semibold transition-all"
                    >
                      + {ph}
                    </button>
                  ))}
                </div>

                {/* Custom header input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customHeaderInput}
                    onChange={(e) => setCustomHeaderInput(e.target.value)}
                    placeholder="Atau ketik nama header custom (misal: Sesi Doa)..."
                    className="flex-1 rounded-lg border border-white/10 bg-slate-900 py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHeaderItem(customHeaderInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddHeaderItem(customHeaderInput)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    Tambah Header
                  </button>
                </div>
              </div>
            )}

            {/* Sub-panel 2: Add new songs search inside modal */}
            {showAddSong && (
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

            {/* List of current setlist items (headers & songs) */}
            {items.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {items.map((it, idx) => {
                  const isHeader = Boolean(it.headerLabel || !it.song);

                  return (
                    <div
                      key={it.id || idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isHeader
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-slate-950/70 border-white/[0.06]"
                      }`}
                    >
                      {/* Left info / inline edit */}
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                        <span className="text-xs font-bold text-slate-400 shrink-0 w-5">
                          {idx + 1}.
                        </span>

                        {isHeader ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                              HEADER
                            </span>
                            <input
                              type="text"
                              value={it.headerLabel || ""}
                              onChange={(e) => handleUpdateHeaderLabel(idx, e.target.value)}
                              placeholder="Nama Pembatas (misal: Perjamuan Kudus)..."
                              className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-amber-200 font-bold outline-none focus:border-amber-300"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{it.song?.title || "Lagu"}</p>
                              <p className="text-[10px] text-slate-400 truncate">{it.song?.artist}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setItems((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], isMedley: !next[idx].isMedley };
                                  return next;
                                });
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all shrink-0 ml-2 ${
                                it.isMedley
                                  ? "bg-indigo-500/30 text-indigo-200 border-indigo-400/50 shadow-sm shadow-indigo-500/20"
                                  : "bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10"
                              }`}
                              title="Tandai lagu ini di-Medley (langsung menyambung) dengan lagu berikutnya"
                            >
                              <Link2 className="h-3 w-3" />
                              {it.isMedley ? "Medley ON" : "+ Medley"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right reordering / action buttons */}
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
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10 ml-1"
                          title="Hapus dari Setlist"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Belum ada item / lagu di playlist ini.</p>
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
