"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Sparkles } from "lucide-react";
import WysiwygEditor, { EditableSection } from "@/components/WysiwygEditor";
import AuthModal from "@/components/AuthModal";
import { isClientAuthenticated, getAuthHeaders } from "@/lib/auth";

const AVAILABLE_TAGS = [
  { name: "Worship", category: "GENRE" },
  { name: "Praise", category: "GENRE" },
  { name: "Hymn", category: "GENRE" },
  { name: "Contemporary", category: "GENRE" },
  { name: "Indonesian", category: "LANGUAGE" },
  { name: "English", category: "LANGUAGE" },
  { name: "Bilingual", category: "LANGUAGE" },
  { name: "Slow", category: "THEME" },
  { name: "Upbeat", category: "THEME" },
  { name: "Acoustic", category: "THEME" },
  { name: "Easter", category: "THEME" },
  { name: "Christmas", category: "THEME" },
];

export default function NewSongPage() {
  const router = useRouter();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isClientAuthenticated()) {
      setAuthModalOpen(true);
    }
  }, []);

  // Form states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Worship", "Indonesian"]);
  const [songFlowInput, setSongFlowInput] = useState("Verse 1, Pre-Chorus, Chorus, Bridge, Chorus");
  const [sections, setSections] = useState<EditableSection[]>([
    { id: "1", sectionType: "VERSE", sectionLabel: "Verse 1", content: "" },
    { id: "2", sectionType: "CHORUS", sectionLabel: "Chorus", content: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddSection = () => {
    const newId = Date.now().toString();
    const count = sections.length + 1;
    setSections((prev) => [
      ...prev,
      {
        id: newId,
        sectionType: "VERSE",
        sectionLabel: `Verse ${count}`,
        content: "",
      },
    ]);
  };

  const handleUpdateSection = (index: number, updated: EditableSection) => {
    setSections((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleDeleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setError("Judul lagu dan Artis wajib diisi");
      return;
    }

    setSaving(true);
    setError("");

    const flowArray = songFlowInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({

          title,
          artist,
          songFlow: flowArray,
          sections,
          tagNames: selectedTags,
        }),

      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan lagu");
      }

      router.push(`/songs/${data.song.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan lagu");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> WYSIWYG Editor
          </div>
          <h1 className="text-3xl font-bold text-white">Tambah Lagu Baru</h1>
          <p className="text-sm text-slate-400 mt-1">
            Isi metadata lagu dan format lirik terstruktur dengan editor bold/italic.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Metadata Section */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-white/[0.06] pb-3">
              1. Informasi & Metadata Lagu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Judul Lagu <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Mengenal-Mu"
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Artis / Band / Worship Team <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Contoh: JPCC Worship"
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>


            {/* Song Flow Input */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alur Lagu (Urutan Menyanyi dipisah koma)
              </label>
              <input
                type="text"
                value={songFlowInput}
                onChange={(e) => setSongFlowInput(e.target.value)}
                placeholder="Verse 1, Pre-Chorus, Chorus, Verse 2, Chorus, Bridge, Chorus"
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-3">
            <h2 className="text-base font-semibold text-white border-b border-white/[0.06] pb-3">
              2. Categorization & Tag
            </h2>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                        : "bg-slate-950 text-slate-400 border-white/10 hover:text-slate-200"
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lyric Sections with WYSIWYG Editor */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">3. Section Lirik Lagu</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap bagian (Verse, Chorus, Bridge) dapat diedit dengan toolbar bold/italic.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Section
              </button>
            </div>

            {/* List of Wysiwyg Editors */}
            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <WysiwygEditor
                  key={sec.id}
                  section={sec}
                  onChange={(updated) => handleUpdateSection(idx, updated)}
                  onDelete={() => handleDeleteSection(idx)}
                  onMoveUp={() => handleMoveUp(idx)}
                  onMoveDown={() => handleMoveDown(idx)}
                  isFirst={idx === 0}
                  isLast={idx === sections.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Lagu
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => router.push("/")}
        onSuccess={() => setAuthModalOpen(false)}
        title="Verifikasi Admin untuk Tambah Lagu"
      />
    </div>
  );
}

