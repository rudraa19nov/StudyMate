"use client";

import { useState } from "react";
import { askQuestion } from "../lib/api";
import AnswerBox from "./AnswerBox";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AskCard({ kbReady, notify }) {
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [history, setHistory] = useState([]); // {question, answer, time}

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!kbReady) {
      notify("Build the knowledge base first.", "error");
      return;
    }

    const question = query.trim();
    setAsking(true);
    setQuery("");

    try {
      const result = await askQuestion(question);
      setHistory((prev) => [
        ...prev,
        { question, answer: result.answer, time: formatTime(new Date()) },
      ]);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl2 border border-forest-600/10 bg-paper-soft p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        <h3 className="font-display text-lg font-semibold text-forest-700 dark:text-amber-100">
          Step 3 — Ask StudyMate anything
        </h3>
        <form onSubmit={handleAsk} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What is the main argument of chapter 3?"
            className="flex-1 rounded-lg border border-forest-600/20 bg-paper px-4 py-2.5 text-sm text-ink outline-none ring-amber-500/40 transition focus:ring-2 dark:border-white/10 dark:bg-white/10 dark:text-amber-50"
          />
          <button
            type="submit"
            disabled={asking || !kbReady}
            className="shrink-0 rounded-lg bg-gradient-to-r from-amber-500 to-amber-300 px-5 py-2.5 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {asking ? " Thinking…" : "Ask"}
          </button>
        </form>
        {!kbReady && (
          <p className="mt-2 text-xs text-ink-muted dark:text-amber-100/50">
            Upload a PDF and build the knowledge base to start asking questions.
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-xl2 border border-forest-600/10 bg-paper-soft p-6 shadow-card dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-amber-100/50">
               Conversation timeline
            </h4>
            <button
              onClick={() => setHistory([])}
              className="text-xs font-semibold text-amber-600 underline decoration-dotted dark:text-amber-300"
            >
              Clear conversation
            </button>
          </div>

          <div className="mt-5">
            {history.map((item, i) => (
              <AnswerBox key={i} item={item} isLast={i === history.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
