import type { LyricSection } from "@/types/song";

const SECTION_CONFIG: Record<string, { label: string; badgeClass: string; borderClass: string; dotClass: string }> = {
  INTRO: {
    label: "Intro",
    badgeClass: "bg-slate-700/80 text-slate-300 border-slate-600/50",
    borderClass: "border-slate-700/50",
    dotClass: "bg-slate-500",
  },
  VERSE: {
    label: "Verse",
    badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    borderClass: "border-indigo-500/20",
    dotClass: "bg-indigo-500",
  },
  PRE_CHORUS: {
    label: "Pre-Chorus",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    borderClass: "border-violet-500/20",
    dotClass: "bg-violet-500",
  },
  CHORUS: {
    label: "Chorus",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    borderClass: "border-sky-500/20",
    dotClass: "bg-sky-500",
  },
  POST_CHORUS: {
    label: "Post-Chorus",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    borderClass: "border-cyan-500/20",
    dotClass: "bg-cyan-500",
  },
  BRIDGE: {
    label: "Bridge",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    borderClass: "border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  INTERLUDE: {
    label: "Interlude",
    badgeClass: "bg-slate-700/80 text-slate-300 border-slate-600/50",
    borderClass: "border-slate-700/50",
    dotClass: "bg-slate-500",
  },
  OUTRO: {
    label: "Outro",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    borderClass: "border-rose-500/20",
    dotClass: "bg-rose-500",
  },
  TAG: {
    label: "Tag",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    borderClass: "border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  ENDING: {
    label: "Ending",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    borderClass: "border-rose-500/20",
    dotClass: "bg-rose-500",
  },
};

/** Parses markdown bold (**text**) & italic (*text*) into JSX elements */
function renderFormattedLine(text: string) {
  if (!text) return "\u00A0";

  // Regex to split by markdown bold (**...**) and italic (*...*)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-white tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-indigo-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function LyricBlock({
  section,
  fontSizeClass = "text-base leading-8",
}: {
  section: LyricSection;
  fontSizeClass?: string;
}) {
  const sectionTypeKey = (section?.sectionType || "VERSE").toUpperCase();
  const config = SECTION_CONFIG[sectionTypeKey] || SECTION_CONFIG["VERSE"];
  const rawContent = section?.content || "";
  const lines = rawContent.split("\n");
  const isInstrumental = rawContent.trim() === "(Instrumental)";
  const labelText = section?.sectionLabel || "Verse";
  const sectionId = `section-${labelText.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={`relative rounded-2xl border bg-slate-900/40 backdrop-blur-sm p-5 pt-4 group hover:bg-slate-800/50 transition-colors duration-200 ${config.borderClass}`}
      id={sectionId}
    >
      {/* Section badge at top-left */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider ${config.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
          {labelText}
        </span>
      </div>

      {/* Lyric content */}
      {isInstrumental ? (
        <p className="text-sm text-slate-500 italic">{section.content}</p>
      ) : (
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <p
              key={idx}
              className={`${fontSizeClass} ${
                line === ""
                  ? "h-3"
                  : "text-slate-200 group-hover:text-white transition-colors"
              }`}
            >
              {renderFormattedLine(line)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
