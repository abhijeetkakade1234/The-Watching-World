'use client';

import { useEffect, useRef } from 'react';

interface ChapterLoaderProps {
  variant: 'boot' | 'transition';
  message?: string;
  onReady?: () => void;
}

interface Star {
  x: number;
  y: number;
  big: boolean;
  tw: number;
  sp: number;
}

interface TreeSpec {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface EyeSpec {
  x: number;
  y: number;
  col: string;
  sep: number;
  open: boolean;
  bt: number;
  nb: number;
  ph: number;
}

interface MistSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  spd: number;
  a: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

class Firefly {
  private readonly random: () => number;
  x = 0;
  y = 0;
  by = 0;
  vx = 0;
  wph = 0;
  wsp = 0;
  wam = 0;
  bph = 0;
  bsp = 0;
  sz = 1;
  col = '#d4f040';
  drift = 0;

  constructor(random: () => number, colors: { ffY: string; ffG: string; ffW: string }) {
    this.random = random;
    this.respawn(colors);
    this.bph = this.random() * Math.PI * 2;
  }

  respawn(colors: { ffY: string; ffG: string; ffW: string }) {
    this.x = this.random() * 240;
    this.y = 45 + this.random() * 75;
    this.by = this.y;
    this.vx = (this.random() - 0.5) * 0.22;
    this.wph = this.random() * Math.PI * 2;
    this.wsp = 0.012 + this.random() * 0.022;
    this.wam = 2 + this.random() * 5;
    this.bsp = 0.022 + this.random() * 0.04;
    this.sz = this.random() < 0.68 ? 1 : 2;
    this.col = this.random() < 0.5 ? colors.ffY : this.random() < 0.78 ? colors.ffG : colors.ffW;
    this.drift = (this.random() - 0.5) * 0.04;
  }
}

export function ChapterLoader({ variant, message, onReady }: ChapterLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isBoot = variant === 'boot';
    const defaultMessage = isBoot ? 'THE WORLD IS WATCHING...' : 'LOADING...';
    const messageText = (message ?? defaultMessage).toUpperCase();

    const S = 2;
    const VW = 240;
    const VH = 160;
    const CW = VW * S;
    const CH = VH * S;
    canvas.width = CW;
    canvas.height = CH;
    ctx.imageSmoothingEnabled = false;

    const resize = () => {
      const sc = Math.min(window.innerWidth / CW, window.innerHeight / CH);
      canvas.style.width = `${CW * sc}px`;
      canvas.style.height = `${CH * sc}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const random = (() => {
      let s = 8675309 >>> 0;
      return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967295;
      };
    })();

    const PAL = {
      star: '#c0e0a0',
      farTree: '#0a1209',
      midTree: '#0d1a0c',
      nearTree: '#080c07',
      moonGlow: '#a8cc80',
      ffY: '#d4f040',
      ffG: '#78f090',
      ffW: '#f0e870',
      eyeR: '#ff2828',
      eyeO: '#ff7030',
      eyeG: '#28ff60',
      txt: '#a8e060',
      txtShadow: '#283818',
      barFill: '#68c030',
      barHi: '#a4e854',
      barBg: '#0c1808',
      barBdr: '#2a4818',
      uiBg: '#050904',
      fog: '#b0d890',
      fire0: '#ff3800',
      fire1: '#ff7010',
      fire2: '#ffaa28',
      fire3: '#ffe050',
      ember: '#ff4018',
    };

    const r = (x: number, y: number, w: number, h: number, col: string, a = 1) => {
      const prev = ctx.globalAlpha;
      if (a !== 1) ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.fillRect(x * S, y * S, w * S, h * S);
      if (a !== 1) ctx.globalAlpha = prev;
    };
    const p = (x: number, y: number, col: string, a = 1) => r(x, y, 1, 1, col, a);

    const SKY_H = 65;
    const UI_Y = 130;
    const UI_H = VH - UI_Y;
    const MX = 178;
    const MY = 22;
    const MR = 11;
    const FX = 118;
    const FY = 112;

    const STARS: Star[] = Array.from({ length: 48 }, () => ({
      x: (random() * VW) | 0,
      y: (random() * 55 + 1) | 0,
      big: random() < 0.15,
      tw: random() * Math.PI * 2,
      sp: 0.6 + random() * 2.2,
    }));

    const FAR_T: TreeSpec[] = Array.from({ length: 28 }, () => ({
      x: ((random() * (VW + 16)) - 6) | 0,
      y: (20 + random() * 15) | 0,
      w: (3 + random() * 5) | 0,
      h: (7 + random() * 10) | 0,
    }));

    const MID_T: TreeSpec[] = Array.from({ length: 22 }, () => {
      const zone = random();
      let x: number;
      if (zone < 0.4) x = (random() * 58) | 0;
      else if (zone < 0.78) x = (VW - 58 + random() * 62) | 0;
      else x = (random() * VW) | 0;
      return { x, y: (36 + random() * 20) | 0, w: (8 + random() * 9) | 0, h: (15 + random() * 16) | 0 };
    });

    const NEAR_T: TreeSpec[] = [
      { x: -6, y: 42, w: 36, h: 94 },
      { x: 16, y: 48, w: 28, h: 80 },
      { x: -2, y: 60, w: 24, h: 68 },
      { x: 26, y: 66, w: 20, h: 58 },
      { x: -8, y: 0, w: 46, h: 56 },
      { x: VW - 30, y: 42, w: 36, h: 94 },
      { x: VW - 44, y: 48, w: 28, h: 80 },
      { x: VW - 22, y: 60, w: 24, h: 68 },
      { x: VW - 46, y: 66, w: 20, h: 58 },
      { x: VW - 38, y: 0, w: 46, h: 56 },
    ];

    const EYES: EyeSpec[] = [
      { x: 7, y: 76, col: PAL.eyeR, sep: 5, open: true, bt: 0, nb: 3.5, ph: random() * 6.28 },
      { x: 132, y: 80, col: PAL.eyeO, sep: 5, open: true, bt: 0, nb: 2.2, ph: random() * 6.28 },
      { x: 44, y: 64, col: PAL.eyeG, sep: 5, open: true, bt: 0, nb: 5.8, ph: random() * 6.28 },
      { x: 96, y: 88, col: PAL.eyeR, sep: 5, open: true, bt: 0, nb: 1.9, ph: random() * 6.28 },
      { x: 190, y: 72, col: PAL.eyeO, sep: 5, open: true, bt: 0, nb: 4.3, ph: random() * 6.28 },
      { x: 18, y: 82, col: PAL.eyeR, sep: 5, open: true, bt: 0, nb: 7.5, ph: random() * 6.28 },
      { x: 218, y: 84, col: PAL.eyeG, sep: 5, open: true, bt: 0, nb: 6.0, ph: random() * 6.28 },
      { x: 160, y: 60, col: PAL.eyeR, sep: 5, open: true, bt: 0, nb: 2.9, ph: random() * 6.28 },
    ];

    const MIST: MistSpec[] = [
      { x: 15, y: 94, w: 95, h: 4, spd: 0.022, a: 0.052 },
      { x: -25, y: 100, w: 115, h: 3, spd: 0.016, a: 0.042 },
      { x: 80, y: 96, w: 85, h: 3, spd: -0.018, a: 0.038 },
      { x: 40, y: 104, w: 75, h: 4, spd: 0.028, a: 0.048 },
      { x: -10, y: 90, w: 65, h: 2, spd: 0.013, a: 0.03 },
      { x: 120, y: 108, w: 80, h: 3, spd: -0.025, a: 0.035 },
    ];

    const FFS = Array.from({ length: 26 }, () => new Firefly(random, PAL));
    const SPARKS: Spark[] = [];

    const treeSil = (x: number, y: number, w: number, h: number, col: string) => {
      const tw = Math.max(2, (w * 0.2) | 0);
      const tx = x + (((w - tw) / 2) | 0);
      r(tx, y + ((h * 0.68) | 0), tw, h - ((h * 0.68) | 0), col);
      r(x, y + ((h * 0.42) | 0), w, (h * 0.3) | 0, col);
      r(x + ((w * 0.09) | 0), y + ((h * 0.24) | 0), (w * 0.82) | 0, (h * 0.22) | 0, col);
      r(x + ((w * 0.18) | 0), y + ((h * 0.1) | 0), (w * 0.64) | 0, (h * 0.17) | 0, col);
      r(x + ((w * 0.28) | 0), y, (w * 0.44) | 0, (h * 0.13) | 0, col);
    };

    const drawBackground = () => {
      for (let y = 0; y < SKY_H; y++) {
        const f = y / SKY_H;
        const rv = (5 + f * 8) | 0;
        const gv = (8 + f * 19) | 0;
        const bv = (10 + f * 12) | 0;
        r(0, y, VW, 1, `rgb(${rv},${gv},${bv})`);
      }
      for (let y = SKY_H; y < UI_Y; y++) {
        const f = (y - SKY_H) / (UI_Y - SKY_H);
        const rv = (9 + f * 4) | 0;
        const gv = (15 + f * 5) | 0;
        const bv = (7 + f * 3) | 0;
        r(0, y, VW, 1, `rgb(${rv},${gv},${bv})`);
      }
      r(82, SKY_H + 2, 76, UI_Y - SKY_H - 2, '#131e0e', 0.22);
    };

    const drawStars = (t: number) => {
      for (const s of STARS) {
        const a = 0.2 + 0.42 * ((Math.sin(t * s.sp + s.tw) + 1) / 2);
        p(s.x, s.y, PAL.star, a);
        if (s.big && a > 0.45) {
          p(s.x - 1, s.y, PAL.star, a * 0.4);
          p(s.x + 1, s.y, PAL.star, a * 0.4);
          p(s.x, s.y - 1, PAL.star, a * 0.3);
        }
      }
    };

    const drawMoon = () => {
      const halos: Array<[number, number]> = [[26, 0.018], [20, 0.03], [15, 0.052], [11, 0.08], [8, 0.11]];
      for (const [rd, al] of halos) {
        for (let dy = -rd; dy <= rd; dy++) {
          for (let dx = -rd; dx <= rd; dx++) {
            if (dx * dx + dy * dy <= rd * rd) p(MX + dx, MY + dy, PAL.moonGlow, al);
          }
        }
      }
      for (let dy = -MR; dy <= MR; dy++) {
        for (let dx = -MR; dx <= MR; dx++) {
          if (dx * dx + dy * dy <= MR * MR) {
            const d = Math.sqrt(dx * dx + dy * dy);
            const br = 1 - (d / MR) * 0.28;
            const rv = (200 + br * 32) | 0;
            const gv = (218 + br * 22) | 0;
            const bv = (168 + br * 16) | 0;
            p(MX + dx, MY + dy, `rgb(${rv},${gv},${bv})`);
          }
        }
      }
      p(MX + 3, MY - 3, '#bdd4a0', 0.38);
      p(MX - 4, MY + 4, '#bdd4a0', 0.3);
      p(MX + 5, MY + 3, '#bdd4a0', 0.24);
    };

    const drawMist = () => {
      for (const m of MIST) {
        m.x += m.spd;
        if (m.spd > 0 && m.x > VW) m.x -= VW + m.w;
        if (m.spd < 0 && m.x < -m.w) m.x += VW + m.w;
        const mx = m.x | 0;
        r(mx, m.y, m.w, m.h, PAL.fog, m.a);
        r(mx + VW, m.y, m.w, m.h, PAL.fog, m.a);
        r(mx - VW, m.y, m.w, m.h, PAL.fog, m.a);
      }
    };

    const drawEyes = (t: number, dt: number) => {
      for (const e of EYES) {
        e.bt += dt;
        if (e.bt >= e.nb) {
          e.open = !e.open;
          e.bt = 0;
          e.nb = e.open ? 2.2 + Math.random() * 4.5 : 0.07 + Math.random() * 0.12;
        }
        if (!e.open) continue;
        const pulse = 0.45 + 0.38 * Math.sin(t * 1.9 + e.ph);
        p(e.x, e.y, e.col, pulse * 0.92);
        p(e.x + e.sep, e.y, e.col, pulse * 0.92);
        p(e.x + 1, e.y, e.col, pulse * 0.45);
        p(e.x + e.sep + 1, e.y, e.col, pulse * 0.45);
      }
    };

    const tickCampfire = (dt: number, sparkTimer: { current: number }) => {
      sparkTimer.current += dt;
      if (sparkTimer.current > 0.065 && SPARKS.length < 14) {
        sparkTimer.current = 0;
        if (Math.random() < 0.6) {
          SPARKS.push({
            x: FX + (Math.random() - 0.5) * 5,
            y: FY - 4,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(0.8 + Math.random() * 0.8),
            life: 1,
          });
        }
      }
      for (let i = SPARKS.length - 1; i >= 0; i--) {
        const sp = SPARKS[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.04;
        sp.life -= 0.035;
        if (sp.life <= 0) SPARKS.splice(i, 1);
      }
    };

    const drawCampfire = (t: number) => {
      const fl = Math.sin(t * 7.1) * 0.28 + Math.sin(t * 12.3) * 0.18 + Math.sin(t * 19.7) * 0.1;
      const gR = 24 + fl * 5;

      for (let gy = -5; gy <= 7; gy++) {
        for (let gx = -(gR | 0); gx <= (gR | 0); gx++) {
          const d = Math.sqrt(gx * gx + (gy * 2.8) * (gy * 2.8));
          if (d < gR) p(FX + gx, FY + gy, PAL.fire1, (1 - d / gR) * 0.072 * (1 + fl * 0.4));
        }
      }

      r(FX - 5, FY + 2, 10, 2, '#1e1008');
      r(FX - 4, FY + 3, 8, 1, '#120a04');
      p(FX - 2, FY + 2, PAL.ember, 0.95);
      p(FX, FY + 2, PAL.fire1, 0.85);
      p(FX + 2, FY + 2, PAL.ember, 0.9);
      r(FX - 2, FY - 1, 5, 3, PAL.fire0, 0.88);
      r(FX - 2, FY - 2, 5, 2, PAL.fire1, 0.9);
      r(FX - 1, FY - 3 - (fl > 0 ? 1 : 0), 3, 3, PAL.fire2, 0.84);
      r(FX, FY - 4 - ((fl * 1.5) | 0), 1, 2, PAL.fire3, 0.75);
      if (fl > 0.15) p(FX, FY - 5 - ((fl * 2) | 0), PAL.fire3, 0.55 + fl * 0.25);

      for (const sp of SPARKS) {
        p(sp.x | 0, sp.y | 0, PAL.fire3, sp.life * 0.9);
      }
    };

    const drawVignette = () => {
      for (let x = 0; x < 22; x++) r(x, 0, 1, VH, '#000000', ((22 - x) / 22) * 0.65);
      for (let x = 0; x < 22; x++) r(VW - 1 - x, 0, 1, VH, '#000000', ((22 - x) / 22) * 0.65);
      for (let y = 0; y < 12; y++) r(0, y, VW, 1, '#000000', ((12 - y) / 12) * 0.45);
    };

    const drawScanlines = () => {
      for (let y = 0; y < VH; y += 2) r(0, y, VW, 1, '#000000', 0.038);
    };

    const drawUI = (t: number, loadProg: number) => {
      r(0, UI_Y, VW, UI_H, PAL.uiBg, 0.92);
      r(0, UI_Y, VW, 1, PAL.barBdr);
      r(0, UI_Y + 1, VW, 1, '#0a1206', 0.5);

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = `${7 * S}px "Press Start 2P", monospace`;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = PAL.txtShadow;
      ctx.fillText(messageText, CW / 2 + S, (UI_Y + 8) * S + S);
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = PAL.txt;
      ctx.fillText(messageText, CW / 2, (UI_Y + 8) * S);
      ctx.restore();

      const BX = 18;
      const BY = UI_Y + 22;
      const BW = VW - 36;
      const BH = 8;
      r(BX - 1, BY - 1, BW + 2, BH + 2, PAL.barBdr);
      r(BX, BY, BW, BH, PAL.barBg);

      const filled = (BW * loadProg) | 0;
      if (filled > 0) {
        r(BX, BY, filled, BH, PAL.barFill);
        r(BX, BY, filled, 3, PAL.barHi, 0.65);
        r(BX, BY + BH - 2, filled, 2, '#3a7818', 0.6);
        const shX = ((t * 38) % BW) | 0;
        if (shX < filled) {
          r(BX + shX, BY, 2, BH, '#ffffff', 0.16);
        }
      }
    };

    const sparkTimer = { current: 0 };
    let loadProg = 0;
    let prevTs: number | null = null;
    let raf = 0;

    const render = (ts: number) => {
      if (prevTs === null) prevTs = ts;
      const dt = Math.min((ts - prevTs) / 1000, 0.05);
      prevTs = ts;
      const t = ts / 1000;

      loadProg = Math.min(1, loadProg + (isBoot ? 0.0016 : 0.006));
      tickCampfire(dt, sparkTimer);

      for (const ff of FFS) {
        ff.x += ff.vx + ff.drift;
        ff.wph += ff.wsp;
        ff.y = ff.by + Math.sin(ff.wph) * ff.wam;
        ff.bph += ff.bsp;
        if (ff.x < -5 || ff.x > VW + 5) ff.respawn(PAL);
      }

      ctx.clearRect(0, 0, CW, CH);
      drawBackground();
      drawStars(t);
      drawMoon();
      for (const tree of FAR_T) treeSil(tree.x, tree.y, tree.w, tree.h, PAL.farTree);
      for (const tree of MID_T) treeSil(tree.x, tree.y, tree.w, tree.h, PAL.midTree);
      drawMist();
      drawEyes(t, dt);

      for (const ff of FFS) {
        const a = (Math.sin(ff.bph) + 1) / 2;
        if (a < 0.06) continue;
        const fx = ff.x | 0;
        const fy = ff.y | 0;
        if (ff.sz === 2) r(fx, fy, 2, 1, ff.col, a * 0.95);
        else p(fx, fy, ff.col, a * 0.95);
        if (a > 0.28) {
          p(fx - 1, fy, ff.col, a * 0.14);
          p(fx + ff.sz, fy, ff.col, a * 0.14);
        }
      }

      drawCampfire(t);
      for (const tree of NEAR_T) treeSil(tree.x, tree.y, tree.w, tree.h, PAL.nearTree);
      drawVignette();
      drawScanlines();
      drawUI(t, loadProg);

      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);

    let readyTimeout: number | undefined;
    if (isBoot && onReady) {
      readyTimeout = window.setTimeout(() => onReady(), 1700);
    }

    return () => {
      if (readyTimeout) window.clearTimeout(readyTimeout);
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [variant, message, onReady]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black pointer-events-none"
      aria-label="Loading chapter 1 map"
    >
      <canvas ref={canvasRef} className="block [image-rendering:pixelated] [image-rendering:crisp-edges]" />
    </div>
  );
}
