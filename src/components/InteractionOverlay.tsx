'use client';

import { useGameStore } from '../store/gameStore';

export function InteractionOverlay() {
  const { currentNarration, isNarrationActive, interactionMessage } = useGameStore();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center px-10">
      {/* Clue / Narration Text */}
      {isNarrationActive && currentNarration && (
        <div className="bg-black/80 backdrop-blur-sm p-8 rounded-lg max-w-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500 mb-8">
          <p className="text-white text-xl sm:text-2xl font-medium tracking-wide text-center leading-relaxed italic">
            &ldquo;{currentNarration}&rdquo;
          </p>
        </div>
      )}

      {/* Main Interaction Prompt (Chest/Movement) */}
      {!isNarrationActive && interactionMessage && (
        <div className={`text-white font-bold drop-shadow-lg tracking-wider animate-pulse ${
          interactionMessage.includes('[') ? 'text-4xl translate-y-[-100px]' : 'text-xl mt-[60vh]'
        }`}>
          {interactionMessage}
        </div>
      )}
    </div>
  );
}
