'use client';

import { PIXEL_HUD } from '@/styles/pixelHud';
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
        <div className={`relative mb-8 w-full max-w-3xl overflow-hidden p-6 sm:p-8 ${PIXEL_HUD.panel}`}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,224,163,0.06),transparent)]" />
          <div className="relative flex items-center justify-between mb-4">
            <p className={`${PIXEL_HUD.heading} text-xs sm:text-sm`}>
              {dialogueSpeaker}
            </p>
            <span className={PIXEL_HUD.tag}>
              Auto
            </span>
          </div>
          <p className={`relative text-center text-base sm:text-xl leading-relaxed ${PIXEL_HUD.text}`}>
            &ldquo;{dialogueText}&rdquo;
          </p>
          <div className="relative mt-6 h-[6px] w-full border border-[#4b3a18] bg-[#0b0905]">
            <div className="h-full w-1/3 bg-[#c79a43] animate-pulse" />
          </div>
        </div>
      )}

      {/* Clue / Narration Text */}
      {!isDialogueActive && isNarrationActive && currentNarration && (
        <div className={`mb-8 max-w-2xl animate-in fade-in zoom-in duration-500 p-6 sm:p-8 ${PIXEL_HUD.panelMuted}`}>
          <p className={`text-center text-base sm:text-xl leading-relaxed ${PIXEL_HUD.text}`}>
            &ldquo;{currentNarration}&rdquo;
          </p>
        </div>
      )}

      {/* Main Interaction Prompt (Chest/Movement) */}
      {!isDialogueActive && !isNarrationActive && interactionMessage && (
        <div className={`${PIXEL_HUD.text} font-bold tracking-[0.14em] animate-pulse ${
          interactionMessage.includes('[') ? 'text-2xl sm:text-4xl translate-y-[-100px]' : 'text-sm sm:text-xl mt-[60vh]'
        }`}>
          {interactionMessage}
        </div>
      )}
    </div>
  );
}
