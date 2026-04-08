'use client';

import { useGameStore } from '../store/gameStore';

export function InteractionOverlay() {
  const {
    currentNarration,
    isNarrationActive,
    interactionMessage,
    isDialogueActive,
    dialogueSpeaker,
    dialogueText,
  } = useGameStore();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center px-10">
      {isDialogueActive && dialogueText && (
        <div className="relative mb-8 w-full max-w-3xl overflow-hidden rounded-xl border border-cyan-300/35 bg-black/86 p-8 shadow-[0_0_40px_rgba(34,211,238,0.14)] backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.15),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(245,158,11,0.12),transparent_40%)]" />
          <div className="relative flex items-center justify-between mb-4">
            <p className="text-amber-200 text-sm sm:text-base uppercase tracking-[0.25em]">
              {dialogueSpeaker}
            </p>
            <span className="rounded border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-cyan-200">
              Auto
            </span>
          </div>
          <p className="relative text-white text-xl sm:text-2xl font-medium tracking-wide text-center leading-relaxed italic">
            &ldquo;{dialogueText}&rdquo;
          </p>
          <div className="relative mt-6 h-[2px] w-full bg-cyan-200/20">
            <div className="h-full w-1/3 bg-gradient-to-r from-cyan-300/30 via-cyan-200 to-cyan-300/30 animate-pulse" />
          </div>
        </div>
      )}

      {/* Clue / Narration Text */}
      {!isDialogueActive && isNarrationActive && currentNarration && (
        <div className="bg-black/80 backdrop-blur-sm p-8 rounded-lg max-w-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500 mb-8">
          <p className="text-white text-xl sm:text-2xl font-medium tracking-wide text-center leading-relaxed italic">
            &ldquo;{currentNarration}&rdquo;
          </p>
        </div>
      )}

      {/* Main Interaction Prompt (Chest/Movement) */}
      {!isDialogueActive && !isNarrationActive && interactionMessage && (
        <div className={`text-white font-bold drop-shadow-lg tracking-wider animate-pulse ${
          interactionMessage.includes('[') ? 'text-4xl translate-y-[-100px]' : 'text-xl mt-[60vh]'
        }`}>
          {interactionMessage}
        </div>
      )}
    </div>
  );
}
