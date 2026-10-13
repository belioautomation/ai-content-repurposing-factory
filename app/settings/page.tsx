"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Preferences = {
  tone: string;
  language: string;
  audience: string;
};

const STORAGE_KEY = "contentflow-preferences";

const DEFAULT_PREFERENCES: Preferences = {
  tone: "Professional",
  language: "English",
  audience: "",
};

export default function SettingsPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);

          setPreferences({
            tone: parsed.tone ?? DEFAULT_PREFERENCES.tone,
            language: parsed.language ?? DEFAULT_PREFERENCES.language,
            audience: parsed.audience ?? DEFAULT_PREFERENCES.audience,
          });
        }
      } catch (error) {
        console.error("Unable to load preferences:", error);
      } finally {
        setLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updatePreference(field: keyof Preferences, value: string) {
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage("");
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setMessage("Preferences saved successfully!");
    } catch (error) {
      console.error("Unable to save preferences:", error);
      setMessage("Unable to save preferences. Check your browser storage.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-cyan-300 transition hover:text-cyan-200"
        >
          ← Back to Content Studio
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Workspace / Settings
        </p>

        <h1 className="mt-3 text-3xl font-bold">Settings</h1>

        <p className="mt-3 text-slate-400">
          Configure your default content generation preferences.
        </p>

        <section className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <label
              htmlFor="default-tone"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Default tone of voice
            </label>

            <select
              id="default-tone"
              value={preferences.tone}
              disabled={!loaded}
              onChange={(event) => updatePreference("tone", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
            >
              <option>Professional</option>
              <option>Casual</option>
              <option>Educational</option>
              <option>Persuasive</option>
              <option>Friendly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="default-language"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Default output language
            </label>

            <select
              id="default-language"
              value={preferences.language}
              disabled={!loaded}
              onChange={(event) =>
                updatePreference("language", event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
            >
              <option>English</option>
              <option>Filipino</option>
              <option>Cebuano</option>
              <option>Spanish</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="default-audience"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Default target audience
            </label>

            <input
              id="default-audience"
              type="text"
              value={preferences.audience}
              disabled={!loaded}
              onChange={(event) =>
                updatePreference("audience", event.target.value)
              }
              placeholder="e.g. Business owners and technology professionals"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <p className="font-medium">Automation status</p>
            <p className="mt-1 text-sm text-emerald-300">
              ● n8n workflow configured
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              This label reflects the configured workflow, not a live connection
              check.
            </p>
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${
                message.startsWith("Preferences saved")
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={savePreferences}
            disabled={!loaded}
            className="w-full rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save preferences
          </button>
        </section>
      </div>
    </main>
  );
}
