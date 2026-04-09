'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const CHAPTER2_AUDIO_SRC = '/audio/chapter2/chapter2-theme.mp3';

// Template component for Chapter 2. Keep unmounted until Chapter 2 gameplay is live.
export function Chapter2Music() {
  const status = useGameStore((s) => s.status);
  const isMusicEnabled = useGameStore((s) => s.isMusicEnabled);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const statusRef = useRef(status);
  const enabledRef = useRef(isMusicEnabled);

  useEffect(() => {
    statusRef.current = status;
    enabledRef.current = isMusicEnabled;
  }, [status, isMusicEnabled]);

  useEffect(() => {
    const audio = new Audio(CHAPTER2_AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.18;
    audio.preload = 'auto';
    audio.muted = false;
    audioRef.current = audio;

    const attemptPlay = () => {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;
      if (!enabledRef.current) return;
      if (statusRef.current === 'paused' || statusRef.current === 'game_over' || statusRef.current === 'victory') {
        return;
      }
      void currentAudio.play().catch(() => {
        // Browser autoplay policies may still block until additional user gestures.
      });
    };

    const unlock = () => {
      attemptPlay();
    };

    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('focus', unlock);
    document.addEventListener('visibilitychange', unlock);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('focus', unlock);
      document.removeEventListener('visibilitychange', unlock);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isMusicEnabled || status === 'paused' || status === 'game_over' || status === 'victory') {
      audio.pause();
      return;
    }

    void audio.play().catch(() => {
      // Will retry from global interaction handlers registered on mount.
    });
  }, [isMusicEnabled, status]);

  return null;
}
