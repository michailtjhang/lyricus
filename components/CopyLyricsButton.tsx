"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { LyricSection } from "@/types/song";

interface CopyLyricsButtonProps {
  title: string;
  artist: string;
  sections: LyricSection[];
  className?: string;
}

export default function CopyLyricsButton({
  title,
  artist,
  sections,
  className = "",
}: CopyLyricsButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const formattedSections = sections
      .map((sec) => `[${sec.sectionLabel}]\n${sec.content.replace(/\*\*/g, "").replace(/\*/g, "")}`)
      .join("\n\n");

    const fullText = `${title} — ${artist}\n\n${formattedSections}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin lirik:", err);
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
      title="Salin seluruh lirik lagu ke clipboard"
    >
      {copied ? (
        <>
          <Check className="h-4.5 w-4.5 text-white animate-bounce" />
          <span>Lirik Berhasil Disalin!</span>
        </>
      ) : (
        <>
          <Copy className="h-4.5 w-4.5 text-indigo-200" />
          <span>Salin Lirik Lagu</span>
        </>
      )}
    </button>
  );
}
