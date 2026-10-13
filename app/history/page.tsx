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
  const [search, setSearch] = useState("");

  useEffect(() => {
  const timer = window.setTimeout(() => {
    try {
      const stored = localStorage.getItem("contentflow-history");

      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Unable to load content history:", error);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  function deleteEntry(id: string) {
    const updated = history.filter((entry) => entry.id !== id);
    setHistory(updated);
    localStorage.setItem("contentflow-history", JSON.stringify(updated));
  }

  function clearHistory() {
    if (!window.confirm("Delete all saved generations?")) return;
    setHistory([]);
    localStorage.removeItem("contentflow-history");
  }

  const filteredHistory = history.filter((entry) =>
    `${entry.sourceText} ${entry.platforms.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#080d17] text-slate-100">
      <section className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm text-slate-400">
              Workspace / Content history
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Content History
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review and manage your previously generated content.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            + Create content
          </Link>
        </header>

        <div className="grid gap-4 py-8 sm:grid-cols-3">
          {[
            { label: "Total generations", value: history.length },
            {
              label: "Saved drafts",
              value: history.reduce(
                (total, entry) => total + entry.drafts.length,
                0,
              ),
            },
            {
              label: "Platforms used",
              value: new Set(history.flatMap((entry) => entry.platforms)).size,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#101827] p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Saved generations</h2>
              <p className="mt-1 text-sm text-slate-400">
                Your content is stored locally in this browser.
              </p>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-xl border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
              >
                Clear history
              </button>
            )}
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search saved content or platforms..."
            className="mt-5 w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />

          <div className="mt-6 space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 px-5 py-12 text-center">
                <p className="text-lg font-semibold">
                  {history.length === 0
                    ? "No saved generations yet"
                    : "No matching content found"}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {history.length === 0
                    ? "Generate content in Content Studio and your saved results will appear here."
                    : "Try another search term."}
                </p>
                {history.length === 0 && (
                  <Link
                    href="/"
                    className="mt-5 inline-flex rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
                  >
                    Open Content Studio
                  </Link>
                )}
              </div>
            ) : (
              filteredHistory.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-xl border border-white/10 bg-[#090f1b] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                      <h3 className="mt-2 font-semibold">
                        {entry.sourceText.slice(0, 100)}
                        {entry.sourceText.length > 100 ? "…" : ""}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteEntry(entry.id)}
                      className="rounded-lg border border-red-400/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/10"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                      >
                        {platform}
                      </span>
                    ))}
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                      {entry.tone}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                      {entry.language}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {entry.drafts.map((draft, index) => (
                      <div
                        key={`${draft.platform}-${index}`}
                        className="rounded-lg border border-white/10 bg-[#101827] p-4"
                      >
                        <h4 className="text-sm font-medium text-cyan-200">
                          {draft.platform}
                        </h4>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {draft.content}
                        </p>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                draft.content,
                              );
                            } catch (error) {
                              console.error("Unable to copy draft:", error);
                            }
                          }}
                          className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                        >
                          Copy draft
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}