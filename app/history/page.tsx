"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Draft = {
  platform: string;
  content: string;
};

type GenerationHistory = {
  id: string;
  createdAt: string;
  sourceText: string;
  platforms: string[];
  tone: string;
  audience: string;
  language: string;
  drafts: Draft[];
};

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("contentflow-history");

        if (stored) {
          const parsed: GenerationHistory[] = JSON.parse(stored);

          setHistory(parsed);
        }
      } catch (error) {
        console.error("Unable to load generation history:", error);
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function deleteGeneration(id: string) {
    const confirmed = window.confirm(
      "Delete this saved generation permanently?",
    );

    if (!confirmed) return;

    const updated = history.filter((item) => item.id !== id);

    setHistory(updated);
    localStorage.setItem("contentflow-history", JSON.stringify(updated));
  }

  async function copyDraft(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      window.alert("Draft copied!");
    } catch {
      window.alert("Unable to copy this draft.");
    }
  }

  return (
    <main className="min-h-screen bg-[#080d17] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← Back to Content Studio
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-sm text-slate-400">Workspace / Content history</p>

          <h1 className="mt-2 text-3xl font-bold">Content History</h1>

          <p className="mt-3 text-sm text-slate-400">
            Review and revisit your previously generated content.
          </p>
        </header>

        {!loaded ? (
          <p className="text-sm text-slate-400">Loading history...</p>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <div className="text-3xl">▤</div>

            <h2 className="mt-4 text-lg font-semibold">
              No saved generations yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Generate content in the Content Studio. Your successful
              generations will appear here automatically.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
            >
              Generate content
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-400">
              {history.length} saved generation
              {history.length === 1 ? "" : "s"}
            </p>

            {history.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#101827] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {item.drafts.length} generated draft
                      {item.drafts.length === 1 ? "" : "s"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteGeneration(item.id)}
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {item.sourceText}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.drafts.map((draft, index) => (
                    <span
                      key={`${draft.platform}-${index}`}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-200"
                    >
                      {draft.platform}
                    </span>
                  ))}
                </div>

                <details className="mt-5">
                  <summary className="cursor-pointer text-sm font-medium text-cyan-300 hover:text-cyan-200">
                    View saved drafts
                  </summary>

                  <div className="mt-4 space-y-4">
                    {item.drafts.map((draft, index) => (
                      <div
                        key={`${draft.platform}-${index}`}
                        className="rounded-xl border border-white/10 bg-[#090f1b] p-4"
                      >
                        <h3 className="font-medium text-cyan-200">
                          {draft.platform}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {draft.content}
                        </p>

                        <button
                          type="button"
                          onClick={() => copyDraft(draft.content)}
                          className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                        >
                          Copy draft
                        </button>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
