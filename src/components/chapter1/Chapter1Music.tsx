'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const CHAPTER1_AUDIO_SRC = '/audio/chapter1/Before_the_Morning_Mist.mp3';

export function Chapter1Music() {
  const status = useGameStore((s) => s.status);
  const isMusicEnabled = useGameStore((s) => s.isMusicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(CHAPTER1_AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMusicEnabled || status === 'paused' || status === 'game_over' || status === 'victory') {
      audio.pause();
      return;
    }

    const tryPlay = () => {
      void audio.play().catch(() => {
        // Browser autoplay policies may block until user gesture; retry on input events below.
      });
    };

    tryPlay();

    const unlockAndPlay = () => {
      tryPlay();
      window.removeEventListener('keydown', unlockAndPlay);
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('touchstart', unlockAndPlay);
    };

    window.addEventListener('keydown', unlockAndPlay);
    window.addEventListener('pointerdown', unlockAndPlay);
    window.addEventListener('touchstart', unlockAndPlay);

    return () => {
      window.removeEventListener('keydown', unlockAndPlay);
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('touchstart', unlockAndPlay);
    };
  }, [isMusicEnabled, status]);

  return null;
}
