export default function Loading() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px] animate-pulse space-y-8">
        <div className="h-10 w-44 rounded-full bg-[var(--surface-muted)]" />
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-[var(--surface-muted)]" />
          <div className="h-10 max-w-xl rounded bg-[var(--surface-muted)]" />
          <div className="h-4 max-w-md rounded bg-[var(--surface-muted)]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
          <div className="aspect-[4/3] rounded-[28px] bg-[var(--surface-muted)]" />
          <div className="h-[420px] rounded-[28px] bg-[var(--surface-muted)]" />
        </div>
      </div>
    </main>
  );
}
