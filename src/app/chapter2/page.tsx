import { PIXEL_HUD } from '@/styles/pixelHud';

export default function Chapter2Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080704] px-6 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(152,117,48,0.2),transparent_35%),radial-gradient(circle_at_75%_70%,rgba(56,85,34,0.18),transparent_40%)]" />
      <section className={`relative z-10 w-full max-w-2xl p-8 text-center ${PIXEL_HUD.panel}`}>
        <p className={`mb-3 text-xs ${PIXEL_HUD.heading}`}>The Watching World</p>
        <h1 className="mb-4 font-mono text-3xl font-bold sm:text-4xl text-[#efe6c8]">Chapter 2</h1>
        <p className={`mx-auto max-w-xl text-sm sm:text-base ${PIXEL_HUD.text}`}>
          Leo has crossed the bridge. Chapter 2 content will continue from here.
        </p>
      </section>
    </main>
  );
}
