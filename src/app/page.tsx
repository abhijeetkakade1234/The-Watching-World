'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Press_Start_2P } from 'next/font/google';
import { ChapterLoader } from '@/components/ChapterLoader';
import { CHAPTER1_VILLAGE_ROUTE } from '@/chapters/chapter1/routes';
import { CHAPTER1_SKIP_BOOT_ONCE_KEY } from '@/utils/navigationSessionKeys';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
});

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
  const [isButtonFlash, setIsButtonFlash] = useState(false);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMovedPastVideoRef = useRef(false);
  const buttonFlashTimeoutRef = useRef<number | null>(null);

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

  const handleStart = useCallback(() => {
    if (phase !== 'idle') return;
    setIsButtonFlash(true);
    if (buttonFlashTimeoutRef.current) {
      window.clearTimeout(buttonFlashTimeoutRef.current);
    }
    buttonFlashTimeoutRef.current = window.setTimeout(() => {
      setIsButtonFlash(false);
      buttonFlashTimeoutRef.current = null;
    }, 180);
    setPhase('preVideoLoader');
  }, [phase]);

  const isVideoMounted = phase === 'preVideoLoader' || phase === 'playingVideo';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      handleStart();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [handleStart]);

  useEffect(() => {
    return () => {
      if (buttonFlashTimeoutRef.current) {
        window.clearTimeout(buttonFlashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const PAL = {
      trunk: '#1a1008',
      trunk2: '#241508',
      leaf1: '#143314',
      leaf2: '#1a4a18',
      leaf3: '#0d2a0d',
      moon: '#b8ccb0',
      g1: '#0a1a0a',
      g2: '#122212',
      g3: '#0f1e0f',
    };

    const prng = (seed: number) => Math.sin(seed * 9301 + 49297) * 0.5 + 0.5;

    const px = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };

    const drawTree = (x: number, baseY: number, scale: number, seed: number) => {
      const s = Math.round(scale);
      const trunkW = s * 2;
      const trunkH = Math.round(prng(seed + 1) * s * 6 + s * 8);
      const trunkX = x - trunkW / 2;
      const trunkY = baseY - trunkH;

      const trunkColor = prng(seed + 2) > 0.5 ? PAL.trunk : PAL.trunk2;
      px(trunkX, trunkY, trunkW, trunkH, trunkColor);

      const layers = 3 + Math.round(prng(seed + 3) * 3);
      for (let i = 0; i < layers; i += 1) {
        const t = i / Math.max(layers - 1, 1);
        const crownW = Math.round(s * 6 * (1 - t * 0.55));
        const crownH = Math.round(s * 3);
        const crownY = trunkY - (layers - i) * (crownH * 0.7) + crownH * 0.5;
        const crownX = x - crownW / 2 + Math.round((prng(seed + i + 10) - 0.5) * s);
        const color =
          prng(seed + i + 5) > 0.5
            ? PAL.leaf1
            : prng(seed + i + 6) > 0.5
              ? PAL.leaf2
              : PAL.leaf3;

        px(crownX, crownY, crownW, crownH, color);

        for (let f = 0; f < crownW; f += Math.max(s, 1)) {
          if (prng(seed + i + f) > 0.4) px(crownX + f, crownY - s, s, s, color);
          if (prng(seed + i + f + 1) > 0.4) px(crownX + f, crownY + crownH, s, s, color);
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const bands = 32;
      for (let i = 0; i < bands; i += 1) {
        const t = i / bands;
        const r = Math.round(8 + t * 5);
        const g = Math.round(10 + t * 14);
        const b = Math.round(8 + t * 6);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, Math.round(t * height * 0.65), width, Math.ceil(height * 0.65 / bands) + 1);
      }

      for (let i = 0; i < 80; i += 1) {
        const sx = Math.round(prng(i * 3) * width);
        const sy = Math.round(prng(i * 3 + 1) * height * 0.55);
        const ss = prng(i * 3 + 2) > 0.7 ? 2 : 1;
        const opacity = 0.3 + prng(i * 7) * 0.5;
        ctx.fillStyle = `rgba(180,220,160,${opacity})`;
        ctx.fillRect(sx, sy, ss, ss);
      }

      const moonX = Math.round(width * 0.78);
      const moonY = Math.round(height * 0.18);
      const moonR = 20;

      const glow = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 5);
      glow.addColorStop(0, 'rgba(180,210,160,0.12)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(moonX - moonR * 5, moonY - moonR * 5, moonR * 10, moonR * 10);

      for (let py = -moonR; py <= moonR; py += 2) {
        for (let px2 = -moonR; px2 <= moonR; px2 += 2) {
          if (px2 * px2 + py * py <= moonR * moonR) {
            ctx.fillStyle = PAL.moon;
            ctx.fillRect(moonX + px2, moonY + py, 2, 2);
          }
        }
      }

      const craters: Array<[number, number, number]> = [
        [4, -6, 4],
        [-6, 3, 3],
        [2, 5, 2],
      ];
      for (const [cx, cy, r] of craters) {
        for (let py = -r; py <= r; py += 2) {
          for (let px2 = -r; px2 <= r; px2 += 2) {
            if (px2 * px2 + py * py <= r * r) {
              ctx.fillStyle = 'rgba(100,130,95,0.45)';
              ctx.fillRect(moonX + cx + px2, moonY + cy + py, 2, 2);
            }
          }
        }
      }

      const groundY = height * 0.72;
      for (let i = 0; i < 6; i += 1) {
        ctx.fillStyle = i < 2 ? PAL.g1 : i < 4 ? PAL.g2 : PAL.g3;
        ctx.fillRect(0, Math.round(groundY + i * 8), width, 9);
      }
      ctx.fillStyle = PAL.g1;
      ctx.fillRect(0, Math.round(groundY + 48), width, height);

      const farCount = Math.round(width / 18);
      for (let i = 0; i < farCount; i += 1) {
        const tx = Math.round(prng(42 + i) * width);
        const s = 2 + Math.round(prng(42 + i + 0.5) * 2);
        drawTree(tx, groundY + 4, s, 42 + i * 13);
      }

      const nearCount = Math.round(width / 80);
      for (let i = 0; i < nearCount; i += 1) {
        const tx = Math.round(prng(99 + i) * width);
        const s = 6 + Math.round(prng(99 + i + 0.5) * 4);
        ctx.save();
        ctx.globalAlpha = 0.85;
        drawTree(tx, groundY + 8, s, 99 + i * 17);
        ctx.restore();
      }

      const bottomShade = ctx.createLinearGradient(0, groundY - 60, 0, height);
      bottomShade.addColorStop(0, 'transparent');
      bottomShade.addColorStop(1, 'rgba(5,10,5,0.92)');
      ctx.fillStyle = bottomShade;
      ctx.fillRect(0, groundY - 60, width, height);
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Firefly = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      speed: number;
      color: string;
      size: number;
    };

    let width = 0;
    let height = 0;
    let raf = 0;

    const flies: Firefly[] = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * (window.innerHeight * 0.85) + window.innerHeight * 0.1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      life: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.012,
      color: Math.random() > 0.7 ? '#cc2200' : Math.random() > 0.5 ? '#8ab060' : '#c8a84b',
      size: Math.random() > 0.5 ? 2 : 1,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const fly of flies) {
        fly.life += fly.speed;
        fly.x += fly.vx + Math.sin(fly.life * 1.3) * 0.3;
        fly.y += fly.vy + Math.cos(fly.life * 0.9) * 0.2;

        if (fly.x < 0) fly.x = width;
        if (fly.x > width) fly.x = 0;
        if (fly.y < 0) fly.y = height;
        if (fly.y > height) fly.y = 0;

        const alpha = (Math.sin(fly.life) * 0.5 + 0.5) * 0.75 + 0.1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fly.color;
        ctx.fillRect(Math.round(fly.x), Math.round(fly.y), fly.size, fly.size);
        ctx.globalAlpha = 1;
      }

      raf = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main className={`${pressStart2P.className} landing-root`}>
      <canvas id="bg" ref={bgCanvasRef} />
      <div id="fog" />
      <div id="scanlines" />
      <div id="vignette" />
      <canvas id="particles" ref={particlesCanvasRef} />

      <div id="ui">
        <div className="eye-wrap" aria-hidden>
          <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="16" y="0" width="20" height="4" fill="#cc2200" />
            <rect x="8" y="4" width="8" height="4" fill="#cc2200" />
            <rect x="36" y="4" width="8" height="4" fill="#cc2200" />
            <rect x="4" y="8" width="4" height="4" fill="#cc2200" />
            <rect x="44" y="8" width="4" height="4" fill="#cc2200" />
            <rect x="4" y="12" width="4" height="4" fill="#cc2200" />
            <rect x="44" y="12" width="4" height="4" fill="#cc2200" />
            <rect x="8" y="16" width="8" height="4" fill="#cc2200" />
            <rect x="36" y="16" width="8" height="4" fill="#cc2200" />
            <rect x="16" y="20" width="20" height="4" fill="#cc2200" />
            <rect x="20" y="8" width="12" height="12" fill="#1a0000" />
            <rect x="22" y="10" width="8" height="8" fill="#440000" />
            <rect x="24" y="12" width="4" height="4" fill="#cc2200" />
            <rect x="24" y="12" width="2" height="2" fill="#ff6644" />
          </svg>
        </div>

        <h1 className="title">THE<br />WATCHING<br />WORLD</h1>
        <div className="divider" />
        <p className="subtitle">YOU ARE BEING WATCHED.</p>
        <button
          className={`btn ${isButtonFlash ? 'flash' : ''}`}
          type="button"
          id="startBtn"
          onClick={handleStart}
          disabled={phase !== 'idle'}
        >
          ▶ START GAME
        </button>
        <p className="hint">[ PRESS ENTER ]</p>
      </div>

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

      <style jsx>{`
        .landing-root {
          --green-dark: #0d1f0d;
          --gold: #c8a84b;
          --gold-glow: #e8c86b;
          --red-eye: #cc2200;
          --text-main: #d4e8c2;
          --text-sub: rgba(180, 210, 160, 0.55);

          position: fixed;
          inset: 0;
          overflow: hidden;
          background: var(--green-dark);
          image-rendering: pixelated;
          cursor: crosshair;
        }

        #bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        #fog {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 40% at 50% 100%, rgba(20, 50, 20, 0.7) 0%, transparent 70%),
            radial-gradient(ellipse 100% 60% at 50% 0%, rgba(5, 12, 5, 0.9) 0%, transparent 60%);
        }

        #scanlines {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0, 0, 0, 0.18) 3px,
            rgba(0, 0, 0, 0.18) 4px
          );
        }

        #vignette {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: radial-gradient(
            ellipse 90% 90% at 50% 50%,
            transparent 40%,
            rgba(0, 0, 0, 0.75) 100%
          );
        }

        #particles {
          position: fixed;
          inset: 0;
          z-index: 4;
          pointer-events: none;
        }

        #ui {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .eye-wrap {
          margin-bottom: 28px;
          animation: eyePulse 3s ease-in-out infinite;
        }

        .title {
          font-size: clamp(18px, 4vw, 42px);
          color: var(--text-main);
          text-align: center;
          letter-spacing: 0.12em;
          line-height: 1.6;
          text-shadow:
            0 0 6px rgba(200, 230, 160, 0.5),
            0 0 18px rgba(160, 210, 120, 0.3),
            2px 2px 0 rgba(0, 0, 0, 0.8);
          animation: flicker 6s infinite;
        }

        .divider {
          width: min(340px, 80vw);
          height: 2px;
          margin: 22px 0 18px;
          background: linear-gradient(
            to right,
            transparent,
            var(--gold) 25%,
            var(--gold-glow) 50%,
            var(--gold) 75%,
            transparent
          );
          box-shadow: 0 0 8px var(--gold);
          image-rendering: pixelated;
        }

        .subtitle {
          font-size: clamp(7px, 1.4vw, 13px);
          color: var(--text-sub);
          letter-spacing: 0.22em;
          text-align: center;
          text-shadow: 0 0 10px rgba(150, 200, 120, 0.25);
          margin-bottom: 48px;
          animation: subFade 4s ease-in-out infinite alternate;
        }

        .btn {
          position: relative;
          font-size: clamp(9px, 1.6vw, 14px);
          color: #0d1f0d;
          background: var(--gold);
          border: none;
          padding: 16px 38px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          image-rendering: pixelated;
          outline: 3px solid #8a6c20;
          box-shadow: 4px 4px 0 #5a4410, inset 0 1px 0 rgba(255, 255, 200, 0.3);
          transition:
            transform 0.06s steps(1),
            box-shadow 0.06s steps(1),
            background 0.06s steps(1),
            color 0.06s steps(1);
          cursor: pointer;
        }

        .btn:hover:not(:disabled),
        .btn:focus-visible:not(:disabled) {
          background: var(--gold-glow);
          color: #1a0d00;
          transform: translate(2px, 2px);
          box-shadow:
            2px 2px 0 #5a4410,
            0 0 18px rgba(232, 200, 80, 0.55),
            inset 0 1px 0 rgba(255, 255, 200, 0.4);
        }

        .btn:active:not(:disabled) {
          transform: translate(4px, 4px);
          box-shadow: 0 0 0 #5a4410, 0 0 24px rgba(232, 200, 80, 0.7);
        }

        .btn.flash {
          background: #ffe87a;
          color: #000;
        }

        .btn:disabled {
          opacity: 0.8;
          cursor: wait;
        }

        .hint {
          margin-top: 28px;
          font-size: clamp(5px, 0.9vw, 9px);
          color: rgba(160, 200, 140, 0.3);
          letter-spacing: 0.18em;
          animation: subFade 3s ease-in-out infinite alternate;
        }

        @keyframes eyePulse {
          0%,
          100% {
            filter: drop-shadow(0 0 4px var(--red-eye)) drop-shadow(0 0 12px rgba(200, 30, 0, 0.4));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 10px var(--red-eye)) drop-shadow(0 0 28px rgba(200, 30, 0, 0.7));
            transform: scale(1.06);
          }
        }

        @keyframes flicker {
          0%,
          19%,
          21%,
          23%,
          25%,
          54%,
          56%,
          100% {
            opacity: 1;
          }
          20%,
          22%,
          24% {
            opacity: 0.85;
          }
          55% {
            opacity: 0.9;
          }
        }

        @keyframes subFade {
          from {
            opacity: 0.45;
          }
          to {
            opacity: 0.75;
          }
        }
      `}</style>
    </main>
  );
}
