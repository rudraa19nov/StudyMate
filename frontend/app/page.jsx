"use client";

import { useEffect, useState, useCallback } from "react";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import UploadCard from "../components/UploadCard";
import AskCard from "../components/AskCard";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { getStatus, resetKnowledgeBase } from "../lib/api";

export default function Home() {
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await getStatus();
      setStatus(s);
    } catch {
      // backend might not be running yet — fail silently on first load
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleReset = async () => {
    try {
      await resetKnowledgeBase();
      await refreshStatus();
      notify("Knowledge base cleared.");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <Sidebar status={status} />

        <div className="flex-1 space-y-6">
          <Hero />

          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted dark:text-amber-100/50">
              Build &amp; chat with your document
            </h2>
            {status?.exists && (
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-amber-600 underline decoration-dotted dark:text-amber-300"
              >
                Reset knowledge base
              </button>
            )}
          </div>

          <UploadCard onUploaded={() => {}} onBuilt={refreshStatus} notify={notify} />

          <AskCard kbReady={!!status?.exists} notify={notify} />

          <Footer />
        </div>
      </div>

      <Toast toast={toast} />
    </main>
  );
}
