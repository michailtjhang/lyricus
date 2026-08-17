"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, ListMusic, X, Lock, LogOut } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { isClientAuthenticated, removeClientAuth } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setAuthenticated(isClientAuthenticated());
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    removeClientAuth();
    setAuthenticated(false);
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-indigo-500/30 group-hover:ring-indigo-400/60 transition-all">
                <Image src="/logo.png" alt="Lyricus Logo" fill className="object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                Lyri<span className="text-indigo-400">cus</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari lagu, artis, atau lirik..."
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-8 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); router.push("/"); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Navigation Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/playlists"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-indigo-500/20 hover:border-indigo-500/40 text-slate-300 hover:text-white border border-white/[0.06] text-xs font-semibold transition-all"
              >
                <ListMusic className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Playlist Ibadah</span>
              </Link>

              {authenticated && (
                <Link
                  href="/songs/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Tambah Lagu</span>
                </Link>
              )}


              {/* Admin Auth Status / Logout */}
              {authenticated ? (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Logout Admin"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Login Admin"
                >
                  <Lock className="h-3.5 w-3.5 text-indigo-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthenticated(true)}
        title="Login Admin Lyricus"
      />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 h-16" />
    }>
      <NavbarContent />
    </Suspense>
  );
}
