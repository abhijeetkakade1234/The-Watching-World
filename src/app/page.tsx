'use client';
import { MapViewport } from '@/components/MapViewport';
import { MiniMap } from '@/components/MiniMap';
import { InteractionOverlay } from '@/components/InteractionOverlay';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 font-sans flex flex-col items-center justify-center">
      <InteractionOverlay />
      <MiniMap />
      
      {/* Centered Canvas Container */}
      <div id="game-container" className="w-full h-full flex flex-col items-center justify-center z-0">
        <MapViewport />
      </div>
    </main>
  );
}
