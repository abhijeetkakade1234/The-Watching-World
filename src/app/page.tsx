import { GameLoop } from '@/components/GameLoop';
import { QTEOverlay } from '@/components/QTEOverlay';
import { HealthBar } from '@/components/HealthBar';
import { PauseOverlay } from '@/components/PauseOverlay';
import { MapViewport } from '@/components/MapViewport';
import { MiniMap } from '@/components/MiniMap';
import { WatcherHUD } from '@/components/WatcherHUD';

export const metadata = {
  title: 'The Watching World',
  description: 'An immersive 2D turn-based strategic board game.',
};

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 font-sans flex flex-col items-center justify-center">
      <GameLoop />
      <QTEOverlay />
      <PauseOverlay />
      <HealthBar />
      <MiniMap />
      <WatcherHUD />
      
      {/* Centered Canvas Container */}
      <div id="game-container" className="w-full h-full flex flex-col items-center justify-center z-0">
        <MapViewport />
      </div>
    </main>
  );
}
