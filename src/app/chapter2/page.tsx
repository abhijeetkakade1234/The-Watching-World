export default function Chapter2Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(239,68,68,0.1),transparent_40%)]" />
      <section className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/60 p-8 text-center shadow-2xl backdrop-blur-sm">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/90">The Watching World</p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Chapter 2</h1>
        <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
          Leo has crossed the bridge. Chapter 2 content will continue from here.
        </p>
      </section>
    </main>
  );
}
