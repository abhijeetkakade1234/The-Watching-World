'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useGameStore } from '../store/gameStore';

export function PauseOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, togglePause, restartChapter, isMusicEnabled, toggleMusic } = useGameStore();

  if (status !== 'paused') return null;

  const handleRestart = () => {
    const segments = pathname.split('/').filter(Boolean);
    const chapterSlug = segments[0]?.startsWith('chapter') ? segments[0] : null;

    if (chapterSlug === 'chapter1') {
      restartChapter('chapter1');
      router.replace('/chapter1/village');
      return;
    }

    if (chapterSlug) {
      restartChapter(chapterSlug);
      router.replace(`/${chapterSlug}`);
      return;
    }

    restartChapter('chapter1');
    router.replace('/chapter1/village');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-slate-900 border-2 border-cyan-500/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)] w-80 text-center space-y-6">
        <h2 className="text-4xl font-black text-cyan-400 tracking-widest uppercase italic">PAUSED</h2>
        
        <div className="space-y-3 pt-4">
          <button 
            onClick={togglePause}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center space-x-2"
          >
            <span>RESUME</span>
          </button>
          
          <button 
            onClick={handleRestart}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all border border-slate-700"
          >
            RESTART
          </button>

          <button 
            className="w-full py-4 bg-slate-800/50 text-slate-500 font-bold rounded-lg cursor-not-allowed border border-slate-800"
          >
            SETTINGS
          </button>

          <button
            onClick={toggleMusic}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-all border border-slate-700"
          >
            MUSIC: {isMusicEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <p className="text-slate-500 text-xs pt-4 tracking-tighter">
          PRESS [ESC] TO CONTINUE
        </p>
      </div>
    </div>
  );
}
