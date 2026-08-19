"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { LyricSection } from "@/types/song";

interface CopyLyricsButtonProps {
  sections: LyricSection[];
  className?: string;
}

export default function CopyLyricsButton({
  sections,
  className = "",
}: CopyLyricsButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sections || sections.length === 0) return;

    const sorted = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);

    const formattedText = sorted
      .map((sec) => {
        const cleanContent = sec.content
          .replace(/\*\*/g, "")
          .replace(/\*/g, "");
        return `[${sec.sectionLabel}]\n${cleanContent}`;
      })
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin lirik:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 border ${
        copied
          ? "bg-emerald-500 text-white shadow-emerald-500/30 border-emerald-400/40"
          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 border-indigo-400/30 ring-1 ring-indigo-400/30"
      } ${className}`}
      title="Salin lirik lagu ini ke clipboard"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white animate-bounce" />
          <span>Lirik Berhasil Disalin!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-indigo-200" />
          <span>Salin Lirik Lagu</span>
        </>
      )}
    </button>
  );
}

