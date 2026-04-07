'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MapViewport } from '@/components/MapViewport';
import { MiniMap } from '@/components/MiniMap';
import { InteractionOverlay } from '@/components/InteractionOverlay';
import { ChapterLoader } from '@/components/ChapterLoader';
import { chapter1RouteForMap } from '@/chapters/chapter1/routes';
import { useGameStore } from '@/store/gameStore';
import type { MapId } from '@/types/game';

interface Chapter1GameClientProps {
  routeMapId: MapId;
}

const INTERNAL_TRANSITION_KEY = 'chapter1_internal_transition';

function transitionLabel(mapId: MapId): string {
  if (mapId === 'village_chapter') return 'RETURNING TO VILLAGE';
  if (mapId === 'house-boysHome') return 'ENTERING YOUR HOME';
  if (mapId === 'house-elder') return "ENTERING ELDER'S HOUSE";
  if (mapId === 'house-neighborA') return "ENTERING NEIGHBOR'S HOUSE";
  if (mapId === 'house-neighborB') return "ENTERING NEIGHBOR'S HOUSE";
  if (mapId === 'house-inn') return 'ENTERING THE VILLAGE INN';
  return 'TRANSITIONING MAP';
}

export function Chapter1GameClient({ routeMapId }: Chapter1GameClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentMap = useGameStore((s) => s.currentMap);
  const isMapTransitioning = useGameStore((s) => s.isMapTransitioning);
  const syncRouteMap = useGameStore((s) => s.syncRouteMap);
  const setMapTransitioning = useGameStore((s) => s.setMapTransitioning);
  const lastPushedRouteRef = useRef<string | null>(null);
  const didInitialRouteCheckRef = useRef(false);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const transitionMessage = useMemo(() => transitionLabel(currentMap), [currentMap]);

  useEffect(() => {
    let hideTimeout: number | undefined;
    try {
      const isInternalTransition = sessionStorage.getItem(INTERNAL_TRANSITION_KEY) === '1';
      if (isInternalTransition) {
        sessionStorage.removeItem(INTERNAL_TRANSITION_KEY);
        hideTimeout = window.setTimeout(() => setShowBootLoader(false), 0);
      }
    } catch {
      // Keep boot loader visible when storage is unavailable.
    }

    return () => {
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, []);

  useEffect(() => {
    syncRouteMap(routeMapId);
    setMapTransitioning(false);
    lastPushedRouteRef.current = null;
  }, [routeMapId, syncRouteMap, setMapTransitioning]);

  useEffect(() => {
    const expectedRoute = chapter1RouteForMap(routeMapId);

    // First client pass only: avoid hydration mismatch reroute from stale persisted map state.
    if (!didInitialRouteCheckRef.current) {
      didInitialRouteCheckRef.current = true;
      if (pathname === expectedRoute && currentMap !== routeMapId) return;
    }

    const targetRoute = chapter1RouteForMap(currentMap);
    if (targetRoute === pathname) {
      return;
    }

    if (lastPushedRouteRef.current === targetRoute) {
      return;
    }

    setMapTransitioning(true);
    lastPushedRouteRef.current = targetRoute;
    try {
      sessionStorage.setItem(INTERNAL_TRANSITION_KEY, '1');
    } catch {
      // no-op: transition still proceeds even if storage is unavailable.
    }
    router.replace(targetRoute);
  }, [currentMap, pathname, routeMapId, router, setMapTransitioning]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-slate-100 font-sans">
      <InteractionOverlay />
      <MiniMap />
      <div id="game-container" className="z-0 h-full w-full">
        <MapViewport />
      </div>
      {showBootLoader && (
        <ChapterLoader
          variant="boot"
          message="THE WORLD IS WATCHING..."
          onReady={() => setShowBootLoader(false)}
        />
      )}
      {!showBootLoader && isMapTransitioning && (
        <ChapterLoader variant="transition" message={transitionMessage} />
      )}
    </main>
  );
}
