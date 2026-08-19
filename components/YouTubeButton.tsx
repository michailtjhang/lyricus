"use client";

import { useState } from "react";
import { Play, X, ExternalLink, Minimize2, Maximize2 } from "lucide-react";

interface YouTubeButtonProps {
  youtubeUrl?: string | null;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function getYouTubeEmbedId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function YouTubeButton({
  youtubeUrl,
  title = "Video YouTube",
  className = "",
  compact = false,
}: YouTubeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!youtubeUrl || !youtubeUrl.trim()) return null;

  const embedId = getYouTubeEmbedId(youtubeUrl);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (embedId) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:scale-105 active:scale-95 bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 border border-rose-400/40 ${
          compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        } ${className}`}
        title="Putar Video / Audio YouTube sambil baca lirik"
      >
        <Play className="h-3.5 w-3.5 fill-current text-white" />
        <span>{isOpen ? "Video Aktif" : compact ? "Putar YouTube" : "Tonton YouTube"}</span>
      </button>

      {/* Floating Picture-in-Picture Mini Player (Bottom-Right Docked) */}
      {isOpen && embedId && (
        <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-[calc(100vw-1.5rem)]">
          {isMinimized ? (
            /* Minimized Audio/Video Pill Bar */
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/95 border border-rose-500/40 shadow-2xl backdrop-blur-md">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-600 text-white shadow-inner animate-pulse">
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>

              <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[200px]">
                <span className="text-[10px] uppercase font-bold text-rose-400">Memutar YouTube</span>
                <span className="text-xs font-semibold text-white truncate">{title}</span>
              </div>

              <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Besarkan Player"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Tutup Player"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Floating 16:9 Mini Window */
            <div className="w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 rounded-2xl border border-rose-500/30 bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
              {/* Mini Window Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-slate-950/80">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Play className="h-3.5 w-3.5 text-rose-500 fill-current shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Kecilkan Player"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${embedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Buka di YouTube"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Tutup Player"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Responsive Iframe Video Container */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
