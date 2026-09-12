import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <section className="w-full max-w-md rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-7 text-center shadow-[0_20px_60px_rgba(24,62,50,.08)]">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--forest)]">
          <span aria-hidden="true" className="text-xl">?</span>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest-soft)]">
          HaruKas demo
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Report not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--forest-soft)]">
          This report link may be incomplete, expired, or not saved yet.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--forest)] px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to citizen home
          </Link>
          <Link
            href="/staff"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--surface-muted)]"
          >
            Officer demo
          </Link>
        </div>
      </section>
    </main>
  );
}
