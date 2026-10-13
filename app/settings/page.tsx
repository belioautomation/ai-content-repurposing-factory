"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English");
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");

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
        console.error("Unable to load settings:", error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function saveSettings() {
    try {
      localStorage.setItem(
        "contentflow-preferences",
        JSON.stringify({ tone, language, audience }),
      );
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    setTone("Professional");
    setLanguage("English");
    setAudience("");
    setMessage("");
    localStorage.removeItem("contentflow-preferences");
  }

  return (
    <main className="min-h-screen bg-[#080d17] text-slate-100">
      <section className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm text-slate-400">Workspace / Settings</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Customize your default content generation preferences.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Back to Content Studio
          </Link>
        </header>

        <div className="grid gap-6 py-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-cyan-300">
                PERSONALIZATION
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Default writing preferences
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                These preferences are used when you open Content Studio.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
              <div>
                <label
                  htmlFor="tone"
                  className="mb-2 block text-sm font-medium"
                >
                  Default tone of voice
                </label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none focus:border-cyan-400"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Educational">Educational</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium"
                >
                  Default output language
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

              <div className="mt-5">
                <label
                  htmlFor="audience"
                  className="mb-2 block text-sm font-medium"
                >
                  Default target audience
                </label>
                <input
                  id="audience"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="e.g. developers, business owners, students"
                  className="w-full rounded-xl border border-white/10 bg-[#090f1b] p-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
                <p className="mt-2 text-xs text-slate-500">
                  You can still change the audience for each generation.
                </p>
              </div>

              {message && (
                <p
                  role="status"
                  className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-200"
                >
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveSettings}
                  className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Save settings
                </button>
                <button
                  type="button"
                  onClick={resetSettings}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Reset defaults
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#101827] p-5 sm:p-6">
            <h2 className="font-semibold">Your workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              ContentFlow uses your preferences to help prepare drafts for
              different publishing platforms.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-[#090f1b] p-4">
                <p className="text-xs text-slate-500">Default tone</p>
                <p className="mt-1 text-sm font-medium">{tone}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090f1b] p-4">
                <p className="text-xs text-slate-500">Output language</p>
                <p className="mt-1 text-sm font-medium">{language}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090f1b] p-4">
                <p className="text-xs text-slate-500">Target audience</p>
                <p className="mt-1 text-sm font-medium">
                  {audience.trim() || "Not specified"}
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-cyan-400/20 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/10"
            >
              Open Content Studio
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
