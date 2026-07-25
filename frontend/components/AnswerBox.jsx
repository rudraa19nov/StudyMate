"use client";

export default function AnswerBox({ item, isLast }) {
  return (
    <div className="relative flex gap-4 pl-1">
      {/* Timeline rail */}
      <div className="flex flex-col items-center">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-amber-500 bg-paper dark:bg-paper-dark" />
        {!isLast && <span className="w-px flex-1 bg-forest-600/15 dark:bg-white/10" />}
      </div>

      <div className="flex-1 pb-8">
        <p className="text-[11px] font-medium text-ink-muted dark:text-amber-100/40">
          {item.time}
        </p>

        {/* User question bubble */}
        <div className="mt-1.5 inline-block max-w-full rounded-2xl rounded-tl-sm bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-ink dark:bg-amber-300/10 dark:text-amber-50">
          {item.question}
        </div>

        {/* AI answer bubble */}
        <div className="mt-3 flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-lg">🪄</span>
          <div className="rounded-2xl rounded-tl-sm border border-forest-500/15 bg-forest-50/70 px-4 py-3 text-[15px] leading-relaxed text-ink dark:border-white/10 dark:bg-white/5 dark:text-amber-50">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}
