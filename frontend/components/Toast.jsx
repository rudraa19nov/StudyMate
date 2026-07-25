"use client";

export default function Toast({ toast }) {
  if (!toast) return null;

  const styles =
    toast.type === "error"
      ? "border-red-400/40 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
      : "border-forest-500/30 bg-forest-50 text-forest-700 dark:bg-forest-500/10 dark:text-forest-100";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-card ${styles}`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
