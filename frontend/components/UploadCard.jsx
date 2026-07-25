"use client";

import { useRef, useState } from "react";
import { uploadPdf, buildKnowledgeBase } from "../lib/api";

const FEATURES = [
  { icon: "💬", label: "Chat with PDF" },
  { icon: "🔎", label: "Semantic Search" },
  { icon: "🧾", label: "AI Summaries" },
  { icon: "⚡", label: "Fast Responses" },
];

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadCard({ onUploaded, onBuilt, notify }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploadedMeta, setUploadedMeta] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [building, setBuilding] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const MAX_MB = 300;

  const reset = () => {
    setFile(null);
    setUploadedMeta(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (selected) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      notify("Please choose a PDF file.", "error");
      return;
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      notify(`That file is too large — max size is ${MAX_MB}MB.`, "error");
      return;
    }

    setFile(selected);
    setUploadedMeta(null);
    setUploading(true);
    setProgress(0);
    try {
      const meta = await uploadPdf(selected, setProgress);
      setUploadedMeta(meta);
      onUploaded?.(meta);
      notify(`"${meta.fileName}" uploaded successfully!`);
    } catch (err) {
      notify(err.message, "error");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleBuild = async () => {
    if (!uploadedMeta) return;
    setBuilding(true);
    try {
      const result = await buildKnowledgeBase(uploadedMeta.fileId, uploadedMeta.fileName);
      onBuilt?.(result);
      notify(`Knowledge base created — ${result.chunkCount} chunks indexed!`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl2 border border-forest-600/10 bg-paper-soft p-6 shadow-card dark:border-white/10 dark:bg-white/5 sm:p-8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-forest-700 dark:text-amber-100">
            📤 Step 1 — Upload your document
          </h3>
          {(uploadedMeta || file) && !uploading && (
            <button
              onClick={reset}
              className="text-xs font-semibold text-amber-600 underline decoration-dotted hover:text-amber-500 dark:text-amber-300"
            >
              ✕ Remove &amp; choose another
            </button>
          )}
        </div>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
              dragOver
                ? "border-amber-500 bg-amber-100/40 scale-[1.01]"
                : "border-forest-500/30 bg-forest-50/60 dark:border-amber-300/30 dark:bg-white/5"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {/* Illustration */}
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="60" cy="90" rx="44" ry="6" fill="currentColor" className="text-forest-600/10 dark:text-white/10" />
              <rect x="30" y="18" width="60" height="66" rx="6" fill="currentColor" className="text-paper dark:text-paper-dark" stroke="currentColor" strokeWidth="2" />
              <rect x="30" y="18" width="60" height="66" rx="6" className="text-forest-500/40 dark:text-amber-300/40" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M40 32h28M40 42h40M40 52h40M40 62h32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-forest-500/40 dark:text-amber-100/30" />
              <circle cx="78" cy="26" r="20" className="text-amber-400" fill="currentColor" opacity="0.15" />
              <g className="text-amber-500 dark:text-amber-300">
                <path d="M78 16v16M71 25l7-7 7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </svg>

            <p className="mt-4 text-base font-semibold text-forest-700 dark:text-amber-100">
              Click to browse or drag a PDF here
            </p>
            <p className="mt-1 text-xs text-ink-muted dark:text-amber-100/50">
              Max {MAX_MB}MB · PDF only
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-forest-500/20 bg-forest-50/60 p-5 dark:border-amber-300/20 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-300/10">
                📄
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest-700 dark:text-amber-100">
                  {file.name}
                </p>
                <p className="text-xs text-ink-muted dark:text-amber-100/50">
                  {formatBytes(file.size)}
                </p>
              </div>
              {uploadedMeta && !uploading && (
                <span className="shrink-0 rounded-full bg-forest-500/15 px-3 py-1 text-xs font-bold text-forest-600 dark:text-forest-300">
                  ✅ Uploaded
                </span>
              )}
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted dark:text-amber-100/60">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-forest-600/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-forest-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-lg bg-forest-50/70 px-3 py-2 text-xs font-medium text-forest-700 dark:bg-white/5 dark:text-amber-100/80"
            >
              <span>✓</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {uploadedMeta && (
        <div className="rounded-xl2 border border-forest-600/10 bg-paper-soft p-6 shadow-card dark:border-white/10 dark:bg-white/5">
          <h3 className="font-display text-lg font-semibold text-forest-700 dark:text-amber-100">
            🧠 Step 2 — Build your knowledge base
          </h3>
          <p className="mt-1 text-sm text-ink-muted dark:text-amber-100/60">
            This chunks the document and embeds it into a searchable vector database.
          </p>
          <button
            onClick={handleBuild}
            disabled={building}
            className="mt-4 rounded-lg bg-gradient-to-r from-forest-600 to-forest-500 px-5 py-2.5 text-sm font-bold text-paper shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {building ? "🔍 Reading, chunking & embedding…" : "⚡ Build AI Knowledge Base"}
          </button>
        </div>
      )}
    </div>
  );
}
