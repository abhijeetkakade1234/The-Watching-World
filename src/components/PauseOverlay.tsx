'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PIXEL_HUD } from '@/styles/pixelHud';
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
    <div className={`fixed inset-0 z-[200] flex items-center justify-center ${PIXEL_HUD.overlayBackdrop} transition-all duration-150`}>
      <div className={`w-80 space-y-6 p-6 text-center ${PIXEL_HUD.panel}`}>
        <h2 className={`text-3xl font-black ${PIXEL_HUD.heading}`}>Paused</h2>

        <div className="space-y-3 pt-4">
          <button
            onClick={togglePause}
            className={`w-full ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonPrimary}`}
          >
            <span>RESUME</span>
          </button>

          <button
            onClick={handleRestart}
            className={`w-full ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonSecondary}`}
          >
            RESTART
          </button>

          <button
            className={`w-full ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonDisabled}`}
          >
            SETTINGS
          </button>

          <button
            onClick={toggleMusic}
            className={`w-full ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonSecondary}`}
          >
            MUSIC: {isMusicEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <p className={`pt-3 text-[11px] ${PIXEL_HUD.hint}`}>
          PRESS [ESC] TO CONTINUE
        </p>
      </div>
    </div>
  );
}
