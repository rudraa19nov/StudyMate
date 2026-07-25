"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("sm-theme");
    const prefersDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("sm-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center gap-2 rounded-full border border-forest-600/20 bg-paper-soft px-3 py-1.5 text-xs font-semibold text-forest-700 shadow-soft transition hover:-translate-y-0.5 dark:border-amber-300/20 dark:bg-white/5 dark:text-amber-100"
    >
      <span>{dark ? "🌙" : "☀️"}</span>
      {dark ? "Dark" : "Light"}
    </button>
  );
}
