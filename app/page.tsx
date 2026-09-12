"use client";

import { useChat } from "@ai-sdk/react";
import { ShareOverlay } from "@/components/ShareOverlay";
import { useState } from "react";

// Pipeline proof only. The real product gets built against the challenge.
export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">HaruKas</h1>
        <p className="text-sm text-neutral-500">
          Pipeline check — Next.js → Anthropic → Vercel.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-neutral-400">
              {m.role === "user" ? "you" : "claude"}
            </span>
            <div className="whitespace-pre-wrap">
              {m.parts.map((p, i) =>
                p.type === "text" ? <span key={i}>{p.text}</span> : null,
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-neutral-400">thinking…</p>}
      </div>

      <form
        className="mt-auto flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          value={input}
          placeholder="Ask something about Halifax…"
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          disabled={busy}
        >
          Send
        </button>
      </form>
      <ShareOverlay />
    </main>
  );
}
