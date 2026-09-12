"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export const GITHUB_URL = "https://github.com/dkaustubh92/harukas";

/**
 * Demo share screen. Press `q` (or the button) to fill the screen with two QR
 * codes so judges and the room can open the live app and the repo on their
 * phones. Escape closes it.
 *
 * The live URL is read from window.location at render time, so it is always
 * correct wherever this is deployed — no env var to forget before the demo.
 */
export function ShareOverlay() {
  const [open, setOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState(GITHUB_URL);

  useEffect(() => {
    setLiveUrl(window.location.origin);
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA"].includes(
        (e.target as HTMLElement)?.tagName,
      );
      if (e.key === "Escape") setOpen(false);
      if (e.key.toLowerCase() === "q" && !typing) setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 rounded-full border border-neutral-300 bg-white/80 px-4 py-2 text-xs font-medium backdrop-blur transition hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/80 dark:hover:bg-neutral-900"
        aria-label="Show QR codes"
      >
        Scan to open ·{" "}
        <kbd className="font-mono text-neutral-400">Q</kbd>
      </button>
    );
  }

  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-white p-8 dark:bg-neutral-950"
    >
      <h2 className="text-center text-3xl font-semibold tracking-tight">
        Try it. Fork it.
      </h2>

      <div className="flex flex-wrap items-start justify-center gap-16">
        <Code label="Live app" caption={liveUrl.replace(/^https?:\/\//, "")} value={liveUrl} />
        <Code label="Source — open source, MIT" caption="github.com/dkaustubh92/harukas" value={GITHUB_URL} />
      </div>

      <p className="text-xs text-neutral-400">
        Click anywhere or press <kbd className="font-mono">Esc</kbd> to close
      </p>
    </div>
  );
}

function Code({
  label,
  caption,
  value,
}: {
  label: string;
  caption: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
        <QRCodeSVG value={value} size={232} level="M" marginSize={0} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-neutral-400">{caption}</p>
      </div>
    </div>
  );
}
