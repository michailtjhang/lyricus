"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { PlaylistSongItem } from "@/types/song";

interface CopySetlistButtonProps {
  playlistName: string;
  songs: PlaylistSongItem[];
  className?: string;
}

export default function CopySetlistButton({
  playlistName,
  songs,
  className = "",
}: CopySetlistButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const formattedSongs = songs
      .map((ps, idx) => {
        const s = ps.song;
        const sectionsText = (s.lyricSections || [])
          .map((sec) => `  [${sec.sectionLabel}]\n  ${sec.content.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\n/g, "\n  ")}`)
          .join("\n\n");
        return `=== ${idx + 1}. ${s.title} — ${s.artist} ===\n\n${sectionsText}`;
      })
      .join("\n\n----------------------------------------\n\n");

    const fullText = `SETLIST IBADAH: ${playlistName}\nTotal: ${songs.length} Lagu\n\n${formattedSongs}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin setlist:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 ${
        copied
          ? "bg-emerald-500 text-white shadow-emerald-500/30 border border-emerald-400/40"
          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 border border-indigo-400/30"
      } ${className}`}
      title="Salin seluruh lirik setlist playlist ke clipboard"
    >
      {copied ? (
        <>
          <Check className="h-4.5 w-4.5 text-white animate-bounce" />
          <span>Setlist Berhasil Disalin!</span>
        </>
      ) : (
        <>
          <Copy className="h-4.5 w-4.5 text-indigo-200" />
          <span>Salin Seluruh Lirik Setlist</span>
        </>
      )}
    </button>
  );
}
