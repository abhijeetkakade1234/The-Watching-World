import Link from 'next/link';
import { CHAPTER1_VILLAGE_ROUTE } from '@/chapters/chapter1/routes';

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(239,68,68,0.14),transparent_38%)]" />
      <section className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/55 p-8 text-center shadow-2xl backdrop-blur-sm">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-cyan-300/90">
          The Watching World
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">A Promise in the Dark</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm text-slate-300 sm:text-base">
          Landing screen placeholder. Story images and prologue flow can be added here before the chapter starts.
        </p>

        <Link
          href={CHAPTER1_VILLAGE_ROUTE}
          className="inline-flex items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-7 py-3 font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-500/30"
        >
          Enter Chapter 1
        </Link>
      </section>
    </main>
  );
}
