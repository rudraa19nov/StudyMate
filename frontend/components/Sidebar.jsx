"use client";

const steps = [
  { n: 1, label: "Upload a PDF book or document" },
  { n: 2, label: "Build the knowledge base" },
  { n: 3, label: "Ask anything about it" },
];

export default function Sidebar({ status }) {
  return (
    <aside className="w-full shrink-0 rounded-xl2 border border-forest-600/10 bg-paper-soft p-6 shadow-card dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-6 lg:w-72">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🪄</span>
        <h2 className="font-display text-xl font-semibold text-forest-700 dark:text-amber-100">
          StudyMate
        </h2>
      </div>
      <p className="mt-1 text-sm text-ink-muted dark:text-amber-100/60">
        Your AI reading companion
      </p>

      <div className="my-5 h-px bg-forest-600/10 dark:bg-white/10" />

      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.n} className="flex items-start gap-3 text-sm text-ink-muted dark:text-amber-100/70">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-paper">
              {s.n}
            </span>
            <span className="pt-0.5">{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="my-5 h-px bg-forest-600/10 dark:bg-white/10" />

      <div className="rounded-lg bg-forest-50 p-3 text-xs text-forest-700 dark:bg-white/5 dark:text-amber-100/80">
        <p className="font-semibold">Knowledge base status</p>
        {status?.exists ? (
          <p className="mt-1">
            📚 {status.chunkCount} chunks indexed
            {status.sourceFile ? ` from “${status.sourceFile}”` : ""}
          </p>
        ) : (
          <p className="mt-1">No document indexed yet.</p>
        )}
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-ink-muted/80 dark:text-amber-100/50">
        Powered by Mistral · Local embeddings · Next.js + Node.js
      </p>
    </aside>
  );
}
