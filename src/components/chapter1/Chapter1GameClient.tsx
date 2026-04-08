'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MapViewport } from '@/components/MapViewport';
import { MiniMap } from '@/components/MiniMap';
import { InteractionOverlay } from '@/components/InteractionOverlay';
import { PauseOverlay } from '@/components/PauseOverlay';
import { ChapterObjectivePanel } from '@/components/chapter1/ChapterObjectivePanel';
import { Chapter1Music } from '@/components/chapter1/Chapter1Music';
import { ChapterLoader } from '@/components/ChapterLoader';
import { chapter1ObjectiveContent } from '@/chapters/chapter1/objectives';
import { chapter1RouteForMap } from '@/chapters/chapter1/routes';
import { useGameStore } from '@/store/gameStore';
import { CHAPTER1_INTERNAL_TRANSITION_KEY, CHAPTER1_SKIP_BOOT_ONCE_KEY } from '@/utils/navigationSessionKeys';
import type { MapId } from '@/types/game';
import type { ObjectivePanelContent } from '@/types/objectives';

interface Chapter1GameClientProps {
  routeMapId: MapId;
}

function transitionLabel(mapId: MapId): string {
  if (mapId === 'village_chapter') return 'RETURNING TO VILLAGE';
  if (mapId === 'house-boysHome') return 'ENTERING OUR HOME';
  if (mapId === 'house-elder') return "ENTERING ELDER KAEL'S HALL";
  if (mapId === 'house-neighborA') return "ENTERING FINN'S COTTAGE";
  if (mapId === 'house-neighborB') return "ENTERING LYRA'S ABODE";
  if (mapId === 'house-inn') return 'ENTERING THE VILLAGE INN';
  return 'TRANSITIONING MAP';
}

export function Chapter1GameClient({ routeMapId }: Chapter1GameClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentMap = useGameStore((s) => s.currentMap);
  const status = useGameStore((s) => s.status);
  const chapter1ObjectiveStage = useGameStore((s) => s.chapter1ObjectiveStage || 'find_finn_house');
  const chapter1PreparationProgress = useGameStore(
    (s) =>
      s.chapter1PreparationProgress || {
        visitedLyraAbode: false,
        visitedVillageInn: false,
        visitedElderKael: false,
      }
  );
  const isMapTransitioning = useGameStore((s) => s.isMapTransitioning);
  const syncRouteMap = useGameStore((s) => s.syncRouteMap);
  const setMapTransitioning = useGameStore((s) => s.setMapTransitioning);
  const lastPushedRouteRef = useRef<string | null>(null);
  const didInitialRouteCheckRef = useRef(false);
  const [showBootLoader, setShowBootLoader] = useState(true);
  const transitionMessage = useMemo(() => transitionLabel(currentMap), [currentMap]);
  const objectivePanelContent = useMemo<ObjectivePanelContent | null>(
    () => chapter1ObjectiveContent(chapter1ObjectiveStage, chapter1PreparationProgress),
    [chapter1ObjectiveStage, chapter1PreparationProgress]
  );

  useEffect(() => {
    let hideTimeout: number | undefined;
    try {
      const isInternalTransition = sessionStorage.getItem(CHAPTER1_INTERNAL_TRANSITION_KEY) === '1';
      const shouldSkipBoot = sessionStorage.getItem(CHAPTER1_SKIP_BOOT_ONCE_KEY) === '1';

      if (isInternalTransition) {
        sessionStorage.removeItem(CHAPTER1_INTERNAL_TRANSITION_KEY);
        hideTimeout = window.setTimeout(() => setShowBootLoader(false), 0);
      }

      if (shouldSkipBoot) {
        sessionStorage.removeItem(CHAPTER1_SKIP_BOOT_ONCE_KEY);
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
      sessionStorage.setItem(CHAPTER1_INTERNAL_TRANSITION_KEY, '1');
    } catch {
      // no-op: transition still proceeds even if storage is unavailable.
    }
    router.replace(targetRoute);
  }, [currentMap, pathname, routeMapId, router, setMapTransitioning]);

  useEffect(() => {
    if (status !== 'victory') return;
    const timeout = window.setTimeout(() => {
      router.replace('/chapter2');
    }, 1700);
    return () => window.clearTimeout(timeout);
  }, [status, router]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-slate-100 font-sans">
      <Chapter1Music />
      <InteractionOverlay />
      <PauseOverlay />
      <ChapterObjectivePanel content={objectivePanelContent} />
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
      {!showBootLoader && status === 'victory' && (
        <ChapterLoader variant="transition" message="ENTERING CHAPTER 2" />
      )}
    </main>
  );
}
