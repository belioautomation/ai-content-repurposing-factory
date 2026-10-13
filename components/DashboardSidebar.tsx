
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!cancelled) {
          setStatus(
            response.ok && data.status === "connected"
              ? "connected"
              : "disconnected",
          );
        }
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }

    void checkHealth();
    const interval = window.setInterval(checkHealth, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const links = [
    { href: "/", label: "◈ Content studio" },
    { href: "/history", label: "▤ Content history" },
    { href: "/settings", label: "⚙ Settings" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0b1220] p-6 lg:block">
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

      <nav className="space-y-2">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-xl border px-4 py-3 text-sm transition ${
                active
                  ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                  : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 p-4">
        <p className="text-sm font-medium">Automation status</p>
        <p
          className={`mt-2 flex items-center gap-2 text-xs ${
            status === "connected"
              ? "text-emerald-300"
              : status === "disconnected"
                ? "text-rose-300"
                : "text-slate-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              status === "connected"
                ? "bg-emerald-400"
                : status === "disconnected"
                  ? "bg-rose-400"
                  : "bg-slate-500"
            }`}
          />
          {status === "connected"
            ? "Connected"
            : status === "disconnected"
              ? "Disconnected"
              : "Checking..."}
        </p>
        <p className="mt-3 text-xs text-slate-500">
          {status === "connected"
            ? "n8n server is responding."
            : status === "disconnected"
              ? "Unable to reach n8n server."
              : "Checking n8n connection..."}
        </p>
      </div>
    </aside>
  );
}
