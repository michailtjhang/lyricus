"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Music, Clock, Sparkles, Trash2 } from "lucide-react";
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

export default function EditSongPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isClientAuthenticated()) {
      setAuthModalOpen(true);
    }
  }, []);

  const [loadingSong, setLoadingSong] = useState(true);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [songFlowInput, setSongFlowInput] = useState("");
  const [sections, setSections] = useState<EditableSection[]>([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/songs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.song) {
          const s = data.song;
          setTitle(s.title);
          setArtist(s.artist);
          setYoutubeUrl(s.youtubeUrl || "");
          setSongFlowInput((s.songFlow || []).join(", "));
          setSelectedTags((s.tags || []).map((t: any) => t.name));
          setSections(
            (s.lyricSections || []).map((ls: any) => ({
              id: ls.id,
              sectionType: ls.sectionType,
              sectionLabel: ls.sectionLabel,
              content: ls.content,
            }))
          );
        }
        setLoadingSong(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingSong(false);
      });
  }, [slug]);

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
      const res = await fetch(`/api/songs/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title,
          artist,
          youtubeUrl,
          songFlow: flowArray,
          sections,
          tagNames: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui lagu");
      }

      router.push(`/songs/${slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui lagu");
      setSaving(false);
    }
  };

  const handleDeleteSong = async () => {
    if (!confirm(`Yakin ingin menghapus lagu "${title}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/songs/${slug}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  if (loadingSong) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        <span>Memuat data lagu...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href={`/songs/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Lagu
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="h-3.5 w-3.5" /> WYSIWYG Editor
            </div>
            <h1 className="text-3xl font-bold text-white">Edit Lagu: {title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Perbarui metadata, tags, link YouTube, alur lagu, dan lirik terstruktur.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeleteSong}
            disabled={deleting}
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Lagu
          </button>
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
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* YouTube Link Input */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-rose-400" />
                Link Video / Audio YouTube (URL)
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Song Flow Input */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alur Lagu (Urutan Menyanyi dipisah koma)
              </label>
              <input
                type="text"
                value={songFlowInput}
                onChange={(e) => setSongFlowInput(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags Section – Genre, Bahasa, Tema */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-5">
            <h2 className="text-base font-semibold text-white border-b border-white/[0.06] pb-3">
              2. Genre, Bahasa &amp; Tema
            </h2>

            {/* Genre */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Genre</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.filter((t) => t.category === "GENRE").map((tag) => {
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

            {/* Bahasa */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Bahasa</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.filter((t) => t.category === "LANGUAGE").map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleToggleTag(tag.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                          : "bg-slate-950 text-slate-400 border-white/10 hover:text-slate-200"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tema */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tema</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.filter((t) => t.category === "THEME").map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => handleToggleTag(tag.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-slate-950 text-slate-400 border-white/10 hover:text-slate-200"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lyric Sections with WYSIWYG Editor */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h2 className="text-base font-semibold text-white">3. Section Lirik Lagu</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Format lirik dengan toolbar bold/italic.
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
              href={`/songs/${slug}`}
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
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => router.push(`/songs/${slug}`)}
        onSuccess={() => setAuthModalOpen(false)}
        title="Verifikasi Admin untuk Edit Lagu"
      />
    </div>
  );
}

