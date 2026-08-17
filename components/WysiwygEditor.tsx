"use client";

import { useRef } from "react";
import { Bold, Italic, Sparkles, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { SectionType } from "@/types/song";

export interface EditableSection {
  id: string;
  sectionType: SectionType;
  sectionLabel: string;
  content: string;
}

interface WysiwygEditorProps {
  section: EditableSection;
  onChange: (updated: EditableSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const SECTION_TYPES: { type: SectionType; label: string }[] = [
  { type: "VERSE", label: "Verse" },
  { type: "PRE_CHORUS", label: "Pre-Chorus" },
  { type: "CHORUS", label: "Chorus" },
  { type: "BRIDGE", label: "Bridge" },
  { type: "INTRO", label: "Intro" },
  { type: "INTERLUDE", label: "Interlude" },
  { type: "OUTRO", label: "Outro" },
  { type: "TAG", label: "Tag" },
  { type: "ENDING", label: "Ending" },
];

export default function WysiwygEditor({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: WysiwygEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = section.content;
    const selectedText = currentText.substring(start, end);

    let replacement = `${prefix}${selectedText || "teks"}${suffix}`;
    if (!selectedText) {
      replacement = `${prefix}teks${suffix}`;
    }

    const newContent =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange({ ...section, content: newContent });

    // Reset selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4)
      );
    }, 50);
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentText = section.content;
    const newContent =
      currentText.substring(0, start) + snippet + currentText.substring(start);

    onChange({ ...section, content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-900/70 p-4 space-y-3 shadow-lg">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {/* Section Type Selector */}
          <select
            value={section.sectionType}
            onChange={(e) => {
              const newType = e.target.value as SectionType;
              const typeObj = SECTION_TYPES.find((t) => t.type === newType);
              onChange({
                ...section,
                sectionType: newType,
                sectionLabel: typeObj ? typeObj.label : section.sectionLabel,
              });
            }}
            className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 font-semibold outline-none focus:border-indigo-500"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t.type} value={t.type}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Section Label */}
          <input
            type="text"
            value={section.sectionLabel}
            onChange={(e) => onChange({ ...section, sectionLabel: e.target.value })}
            placeholder="Label (contoh: Verse 1)"
            className="rounded-lg border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 w-32"
          />
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="Pindah Ke Atas"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
              title="Pindah Ke Bawah"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ml-1"
            title="Hapus Section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* WYSIWYG Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-white/[0.04]">
        <button
          type="button"
          onClick={() => applyFormatting("**", "**")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-white/5"
          title="Tebalkan Teks (Bold)"
        >
          <Bold className="h-3.5 w-3.5" />
          Bold
        </button>

        <button
          type="button"
          onClick={() => applyFormatting("*", "*")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs italic text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-white/5"
          title="Miringkan Teks (Italic)"
        >
          <Italic className="h-3.5 w-3.5" />
          Italic
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Sisip:</span>
        {["(2x)", "(Chorus)", "(Instrumental)"].map((snippet) => (
          <button
            key={snippet}
            type="button"
            onClick={() => insertSnippet(snippet)}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors border border-white/5"
          >
            {snippet}
          </button>
        ))}
      </div>

      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        rows={4}
        value={section.content}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        placeholder="Ketikkan lirik lagu di sini... Gunakan toolbar di atas untuk format bold (**teks**) atau italic (*teks*)."
        className="w-full rounded-xl border border-white/[0.08] bg-slate-950/80 p-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono leading-relaxed resize-y"
      />

      {/* Live formatting preview */}
      {section.content && (
        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04]">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" /> Preview Tampilan:
          </p>
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {section.content.split("\n").map((line, idx) => (
              <p key={idx}>{line ? renderFormattedPreview(line) : "\u00A0"}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderFormattedPreview(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="italic text-indigo-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
