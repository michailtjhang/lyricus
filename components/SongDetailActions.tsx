"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import AuthModal from "@/components/AuthModal";
import { isClientAuthenticated, getAuthHeaders } from "@/lib/auth";

interface SongDetailActionsProps {
  songId: string;
  songSlug: string;
  songTitle: string;
}

export default function SongDetailActions({
  songId,
  songSlug,
  songTitle,
}: SongDetailActionsProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"delete" | "edit" | "playlist" | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setAuthenticated(isClientAuthenticated());
  }, []);

  // If not authenticated as Admin, hide all admin action buttons for clean visitor reading UI
  if (!authenticated) return null;

  const executeDeleteSong = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/songs/${songSlug}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        router.push("/");
        router.refresh();
      } else {
        alert("Gagal menghapus lagu.");
        setDeleting(false);
      }
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const handleActionClick = (action: "delete" | "edit" | "playlist") => {
    if (isClientAuthenticated()) {
      if (action === "delete") {
        setDeleteModalOpen(true);
      } else if (action === "edit") {
        router.push(`/songs/${songSlug}/edit`);
      } else if (action === "playlist") {
        setPlaylistModalOpen(true);
      }
    } else {
      setPendingAction(action);
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthenticated(true);
    setAuthModalOpen(false);

    if (pendingAction === "delete") {
      setDeleteModalOpen(true);
    } else if (pendingAction === "edit") {
      router.push(`/songs/${songSlug}/edit`);
    } else if (pendingAction === "playlist") {
      setPlaylistModalOpen(true);
    }
    setPendingAction(null);
  };

  const getAuthModalTitle = () => {
    if (pendingAction === "delete") return "Verifikasi Admin untuk Hapus Lagu";
    if (pendingAction === "edit") return "Verifikasi Admin untuk Edit Lagu";
    return "Verifikasi Admin untuk Tambah ke Playlist";
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleActionClick("playlist")}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 text-indigo-300" />
          Tambah ke Playlist
        </button>

        <button
          onClick={() => handleActionClick("edit")}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Edit3 className="h-4 w-4 text-amber-300" />
          Edit Lagu
        </button>

        <button
          onClick={() => handleActionClick("delete")}
          disabled={deleting}
          className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-rose-300" />
          ) : (
            <Trash2 className="h-4 w-4 text-rose-400" />
          )}
          Hapus Lagu
        </button>
      </div>

      <AddToPlaylistModal
        songId={songId}
        songTitle={songTitle}
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
        title={getAuthModalTitle()}
      />

      {/* Custom Sleek Delete Confirmation Modal UI */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Danger Warning Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1.5">Konfirmasi Hapus Lagu</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apakah Anda yakin ingin menghapus lagu{" "}
                <span className="font-semibold text-rose-300">&ldquo;{songTitle}&rdquo;</span>{" "}
                dari pustaka? Tindakan ini <span className="text-rose-400 font-semibold">tidak dapat dibatalkan</span>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={executeDeleteSong}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Hapus Lagu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
