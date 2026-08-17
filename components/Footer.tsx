import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-slate-950 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-7 w-7 overflow-hidden rounded-lg ring-1 ring-indigo-500/30 group-hover:ring-indigo-400/60 transition-all">
              <Image src="/logo.png" alt="Lyricus Logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Lyri<span className="text-indigo-400">cus</span>
              </p>
              <p className="text-[10px] text-slate-500 -mt-0.5">Lyric Library Platform</p>
            </div>
          </Link>

          {/* Center links */}
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Beranda</Link>
            <Link href="/?tag=Worship" className="hover:text-slate-300 transition-colors">Worship</Link>
            <Link href="/?tag=Praise" className="hover:text-slate-300 transition-colors">Praise</Link>
            <Link href="/?tag=Hymn" className="hover:text-slate-300 transition-colors">Hymn</Link>
          </div>

          {/* Right */}
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            Dibuat dengan <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> untuk para penyembah
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-[11px] text-slate-700">
            © {new Date().getFullYear()} Lyricus — Platform Lirik Lagu Interaktif
          </p>
        </div>
      </div>
    </footer>
  );
}
