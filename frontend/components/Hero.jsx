import ThemeToggle from "./ThemeToggle";

export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-xl2 border border-forest-600/10 bg-gradient-to-br from-forest-100 via-paper-soft to-amber-100/60 p-8 shadow-card dark:border-white/10 dark:from-forest-700/40 dark:via-white/5 dark:to-amber-500/10 sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full border border-amber-500/30 bg-amber-100/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:border-amber-300/30 dark:bg-white/10 dark:text-amber-200">
            ✨ AI-Powered Study Tool
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold italic text-forest-700 dark:text-amber-100 sm:text-5xl">
            StudyMate
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted dark:text-amber-100/70">
            Upload any PDF and chat with it — StudyMate reads, understands, and
            answers your questions instantly.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
