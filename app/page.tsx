"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type GenerationHistory = {
  id: string;
  createdAt: string;
  sourceText: string;
  platforms: string[];
  tone: string;
  audience: string;
  language: string;
  drafts: { platform: string; content: string }[];
};

const platforms = [
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "instagram", label: "Instagram", icon: "◎" },
  { id: "x", label: "X / Twitter", icon: "𝕏" },
  { id: "blog", label: "Blog post", icon: "✎" },
  { id: "newsletter", label: "Newsletter", icon: "✉" },
];

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "linkedin",
    "x",
  ]);
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState("English");
  const [n8nStatus, setN8nStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem("contentflow-preferences");

        if (stored) {
          const preferences = JSON.parse(stored);

          setTone(preferences.tone ?? "Professional");
          setLanguage(preferences.language ?? "English");
          setAudience(preferences.audience ?? "");
        }
      } catch (error) {
        console.error("Unable to load saved preferences:", error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkN8nHealth() {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!cancelled) {
          setN8nStatus(
            response.ok && data.status === "connected"
              ? "connected"
              : "disconnected",
          );
        }
      } catch {
        if (!cancelled) {
          setN8nStatus("disconnected");
        }
      }
    }

    checkN8nHealth();

    const interval = window.setInterval(checkN8nHealth, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [regeneratingDraft, setRegeneratingDraft] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [copiedPlatform, setCopiedPlatform] = useState("");
  const [drafts, setDrafts] = useState<{ platform: string; content: string }[]>(
    [],
  );
  function saveGenerationToHistory(
    draftsToSave: { platform: string; content: string }[],
  ) {
    try {
      const stored = localStorage.getItem("contentflow-history");
      const history: GenerationHistory[] = stored ? JSON.parse(stored) : [];

      const entry: GenerationHistory = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        sourceText,
        platforms: [...selectedPlatforms],
        tone,
        audience,
        language,
        drafts: draftsToSave,
      };

      localStorage.setItem(
        "contentflow-history",
        JSON.stringify([entry, ...history]),
      );
    } catch (err) {
      console.error("Unable to save generation history:", err);
    }
  }
  function togglePlatform(id: string) {
    setSelectedPlatforms((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  async function generateContent() {
    if (!sourceText.trim()) {
      setError("Please enter some source content first.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccessMessage("");
    setDrafts([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          platforms: selectedPlatforms,
          tone,
          audience,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content.");
      }

      setDrafts(data.drafts);
      saveGenerationToHistory(data.drafts);
      setSuccessMessage("Content generated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating content.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadDrafts() {
    if (drafts.length === 0) return;

    const content = drafts
      .map(
        (draft) =>
          `===== ${draft.platform.toUpperCase()} =====\n\n${draft.content}`,
      )
      .join("\n\n\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "content-drafts.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function regenerateDraft(platform: string, index: number) {
    setRegeneratingDraft(`${platform}-${index}`);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText,
          platforms: [platform],
          tone,
          audience,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate draft.");
      }

      if (!data.drafts?.[0]?.content) {
        throw new Error("The API returned an empty draft.");
      }

      setDrafts((currentDrafts) =>
        currentDrafts.map((draft, draftIndex) =>
          draftIndex === index
            ? { ...draft, content: data.drafts[0].content }
            : draft,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRegeneratingDraft(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080d17] text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0b1220] p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">
            AI
          </div>
          <div>
            <p className="font-semibold">ContentFlow</p>
            <p className="text-xs text-slate-400">Repurposing Factory</p>
          </div>
        </div>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

        <Link
          href="/"
          className="block rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-200 transition hover:bg-cyan-300/15"
        >
          ◈ Content studio
        </Link>

        <Link
          href="/history"
          className="mt-2 block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          ▤ Content history
        </Link>

        <Link
          href="/settings"
          className="mt-2 block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          ⚙ Settings
        </Link>

        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 p-4">
          <p className="text-sm font-medium">Automation status</p>

          <p
            className={`mt-2 flex items-center gap-2 text-xs ${
              n8nStatus === "connected"
                ? "text-emerald-300"
                : n8nStatus === "disconnected"
                  ? "text-red-300"
                  : "text-amber-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                n8nStatus === "connected"
                  ? "bg-emerald-400"
                  : n8nStatus === "disconnected"
                    ? "bg-red-400"
                    : "bg-amber-400"
              }`}
            />

            {n8nStatus === "connected"
              ? "Connected"
              : n8nStatus === "disconnected"
                ? "Disconnected"
                : "Checking..."}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {n8nStatus === "connected"
              ? "n8n server is responding."
              : n8nStatus === "disconnected"
                ? "Unable to reach the n8n server."
                : "Checking n8n server availability..."}
          </p>
        </div>
      </aside>

      
<section className="w-full px-4 py-6 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-8 xl:px-10 2xl:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm text-slate-400">Workspace / Content studio</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              AI Content Studio
            </h1>
          </div>

          <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-300">
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${
                n8nStatus === "connected"
                  ? "bg-emerald-400"
                  : n8nStatus === "disconnected"
                    ? "bg-red-400"
                    : "bg-amber-400"
              }`}
            />
            n8n ·{" "}
            {n8nStatus === "connected"
              ? "Connected"
              : n8nStatus === "disconnected"
                ? "Disconnected"
                : "Checking..."}
          </div>
        </header>

        <div className="grid gap-6 py-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-cyan-300">YOUR WORKFLOW</p>
              <h2 className="mt-2 text-xl font-semibold">
                Turn one idea into many
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Add your original content, choose your channels, and prepare
                platform-specific drafts with your n8n AI workflow.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
              <label htmlFor="sourceText" className="text-sm font-semibold">
                01. Original content
              </label>
              <p className="mb-3 mt-1 text-xs text-slate-400">
                Paste an article, transcript, idea, or long-form post.
              </p>
              <textarea
                id="sourceText"
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder="Paste your content here..."
                rows={9}
                className="w-full resize-y rounded-xl border border-white/10 bg-[#090f1b] p-4 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Recommended: 50–20,000 characters</span>
                <span>{sourceText.length.toLocaleString()} characters</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
              <h3 className="text-sm font-semibold">02. Choose platforms</h3>
              <p className="mb-4 mt-1 text-xs text-slate-400">
                Select one or more output formats.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {platforms.map((platform) => {
                  const active = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      aria-pressed={active}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-[#090f1b] text-slate-400 hover:border-white/25"
                      }`}
                    >
                      <span className="block text-lg">{platform.icon}</span>
                      <span className="mt-2 block text-sm font-medium">
                        {platform.label}
                      </span>
                      <span className="mt-1 block text-xs">
                        {active ? "Selected ✓" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
              <h3 className="text-sm font-semibold">03. Writing preferences</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="tone"
                    className="mb-2 block text-xs text-slate-400"
                  >
                    Tone of voice
                  </label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none focus:border-cyan-400"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="educational">Educational</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="language"
                    className="mb-2 block text-xs text-slate-400"
                  >
                    Output language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none focus:border-cyan-400"
                  >
                    <option>English</option>
                    <option>Filipino</option>
                    <option>Cebuano</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="audience"
                    className="mb-2 block text-xs text-slate-400"
                  >
                    Target audience (optional)
                  </label>
                  <input
                    id="audience"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                    placeholder="e.g. developers, business owners, students"
                    className="w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={generateContent}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-300 px-5 py-4 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Generating content...
                </>
              ) : (
                "✦ Generate content"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to clear all content and generated drafts?",
                );

                if (confirmed) {
                  setSourceText("");
                  setDrafts([]);
                  setError("");
                  setSuccessMessage("");
                  setCopiedPlatform("");
                }
              }}
              disabled={isGenerating || regeneratingDraft !== null}
              className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear All
            </button>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
              >
                <div className="mb-1 font-semibold">Generation failed</div>
                <p>{error}</p>
                <p className="mt-2 text-red-200/70">
                  Please check your connection and try again.
                </p>

                <button
                  type="button"
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="mt-3 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
              >
                {successMessage}
              </div>
            )}

            {isGenerating && (
              <div
                role="status"
                className="flex items-center justify-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-center text-sm text-slate-300"
              >
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                <p>
                  Your n8n workflow is processing your content. This may take a
                  moment.
                </p>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6 xl:sticky xl:top-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Output preview</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadDrafts}
                  disabled={drafts.length === 0}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Download
                </button>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                  Preview
                </span>
              </div>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {drafts.length > 0
                ? `${drafts.length} platform-specific draft${drafts.length === 1 ? "" : "s"} generated.`
                : "Your generated drafts will appear here after you generate content."}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Generated Drafts
                </h2>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                  {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
                </span>
              </div>

              {drafts.length > 0 ? (
                drafts.map((draft, index) => (
                  <article
                    key={`${draft.platform}-${index}`}
                    className="rounded-xl border border-white/10 bg-[#090f1b] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium text-cyan-200">
                        {draft.platform}
                      </h3>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => regenerateDraft(draft.platform, index)}
                          disabled={regeneratingDraft !== null}
                          className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-200 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {regeneratingDraft === `${draft.platform}-${index}`
                            ? "Regenerating..."
                            : "Regenerate"}
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                draft.content,
                              );
                              setCopiedPlatform(draft.platform);

                              setTimeout(() => {
                                setCopiedPlatform("");
                              }, 1800);
                            } catch {
                              setError(
                                "Unable to copy text. Check your browser permissions.",
                              );
                            }
                          }}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                        >
                          {copiedPlatform === draft.platform
                            ? "Copied!"
                            : "Copy"}
                        </button>
                      </div>
                    </div>

                    <textarea
                      aria-label={`Edit ${draft.platform} draft`}
                      value={draft.content}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDrafts((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, content: value } : item,
                          ),
                        );
                      }}
                      rows={7}
                      className="mt-3 w-full resize-y rounded-lg border border-white/10 bg-[#101827] p-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-400"
                    />
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{draft.platform} draft</span>
                      <span>
                        {draft.content.length.toLocaleString()} characters
                      </span>
                    </div>
                  </article>
                ))
              ) : selectedPlatforms.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-500">
                  Select a platform to prepare an output.
                </p>
              ) : (
                selectedPlatforms.map((id) => {
                  const platform = platforms.find((item) => item.id === id)!;
                  return (
                    <div
                      key={id}
                      className="rounded-xl border border-white/10 bg-[#090f1b] p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-cyan-300">{platform.icon}</span>
                        {platform.label}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {isGenerating
                          ? "Waiting for the n8n workflow..."
                          : "Your generated draft will appear here."}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-4">
              <p className="text-xs font-medium text-slate-300">
                Workflow pipeline
              </p>
              <div className="mt-3 space-y-3 text-xs text-slate-500">
                <p>01 · Validate input</p>
                <p>02 · Generate with OpenRouter</p>
                <p>03 · Parse and validate drafts</p>
                <p>04 · Return results from n8n</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
