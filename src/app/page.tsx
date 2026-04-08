'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChapterLoader } from '@/components/ChapterLoader';
import { CHAPTER1_VILLAGE_ROUTE } from '@/chapters/chapter1/routes';
import { CHAPTER1_SKIP_BOOT_ONCE_KEY } from '@/utils/navigationSessionKeys';

type IntroPhase =
  | 'idle'
  | 'preVideoLoader'
  | 'playingVideo'
  | 'postVideoLoader'
  | 'navigating';

const PRE_VIDEO_FALLBACK_MS = 7000;
const POST_VIDEO_LOADER_MS = 1500;

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<IntroPhase>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMovedPastVideoRef = useRef(false);

  const enterPostVideoLoader = useCallback(() => {
    if (hasMovedPastVideoRef.current) return;
    hasMovedPastVideoRef.current = true;

    const video = videoRef.current;
    if (video) {
      video.pause();
    }

    setPhase('postVideoLoader');
  }, []);

  const startPlaybackIfReady = useCallback(async () => {
    if (phase !== 'preVideoLoader' || hasMovedPastVideoRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      if (!hasMovedPastVideoRef.current) {
        setPhase('playingVideo');
      }
    } catch {
      enterPostVideoLoader();
    }
  }, [enterPostVideoLoader, phase]);

  useEffect(() => {
    if (phase !== 'preVideoLoader') return;

    hasMovedPastVideoRef.current = false;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.load();
    }

    const fallbackTimeout = window.setTimeout(() => {
      enterPostVideoLoader();
    }, PRE_VIDEO_FALLBACK_MS);

    return () => window.clearTimeout(fallbackTimeout);
  }, [enterPostVideoLoader, phase]);

  useEffect(() => {
    if (phase !== 'postVideoLoader') return;

    const navigateTimeout = window.setTimeout(() => {
      try {
        sessionStorage.setItem(CHAPTER1_SKIP_BOOT_ONCE_KEY, '1');
      } catch {
        // no-op: navigation should continue even if storage is unavailable.
      }
      setPhase('navigating');
      router.push(CHAPTER1_VILLAGE_ROUTE);
    }, POST_VIDEO_LOADER_MS);

    return () => window.clearTimeout(navigateTimeout);
  }, [phase, router]);

  const handleStart = () => {
    if (phase !== 'idle') return;
    setPhase('preVideoLoader');
  };

  const isVideoMounted = phase === 'preVideoLoader' || phase === 'playingVideo';

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

        <button
          type="button"
          onClick={handleStart}
          disabled={phase !== 'idle'}
          className="inline-flex items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-7 py-3 font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-wait disabled:opacity-70"
        >
          Enter Chapter 1
        </button>
      </section>

      {isVideoMounted && (
        <div className={`fixed inset-0 z-[850] bg-black ${phase === 'playingVideo' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <video
            ref={videoRef}
            className="h-full w-full object-contain bg-black"
            playsInline
            preload="auto"
            onCanPlayThrough={() => {
              void startPlaybackIfReady();
            }}
            onLoadedData={() => {
              void startPlaybackIfReady();
            }}
            onEnded={enterPostVideoLoader}
            onError={enterPostVideoLoader}
          >
            <source src="/videos/introVideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {phase === 'playingVideo' && (
            <button
              type="button"
              onClick={enterPostVideoLoader}
              className="absolute right-4 top-4 rounded-md border border-white/50 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black/85 sm:right-8 sm:top-8"
            >
              Skip
            </button>
          )}
        </div>
      )}

      {phase === 'preVideoLoader' && (
        <ChapterLoader variant="boot" message="PREPARING VISIONS..." />
      )}
      {phase === 'postVideoLoader' && (
        <ChapterLoader variant="boot" message="ENTERING CHAPTER 1..." />
      )}
    </main>
  );
}
