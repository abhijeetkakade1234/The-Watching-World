'use client';

import { useEffect, useState, useRef } from 'react';
import { PIXEL_HUD } from '@/styles/pixelHud';
import { useGameStore } from '../store/gameStore';

// Reserved for future chapters. Keep logic compiled but not mounted in Chapter 1 UI.
export function GameLoop() {
  const {
    status,
    entities,
    playerPos,
    playerEnergy,
    playerHunger,
    sessionId,
    handleAITurn,
    spawnPredictedThreat,
    aiTrapFrequencyMs,
    gameStartTime,
    updateSurvival,
    currentMap
  } = useGameStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const playerPosRef = useRef(playerPos);
  const playerEnergyRef = useRef(playerEnergy);
  const playerHungerRef = useRef(playerHunger);
  const sessionIdRef = useRef(sessionId);
  const currentMapRef = useRef(currentMap);
  const entitiesRef = useRef(entities);
  const startTimeRef = useRef(gameStartTime);

  useEffect(() => {
    playerPosRef.current = playerPos;
    playerEnergyRef.current = playerEnergy;
    playerHungerRef.current = playerHunger;
    sessionIdRef.current = sessionId;
    currentMapRef.current = currentMap;
    entitiesRef.current = entities;
    startTimeRef.current = gameStartTime;
  }, [playerPos, playerEnergy, playerHunger, sessionId, entities, gameStartTime, currentMap]);

  // Survival Ticking
  useEffect(() => {
    if (status !== 'playing') return;
    const survivalTimer = setInterval(() => {
      updateSurvival();
    }, 500); 
    return () => clearInterval(survivalTimer);
  }, [status, updateSurvival]);

  // Local AI (Disabled for Chapter 1 typically in gameStore, but loop remains)
  useEffect(() => {
    if (status !== 'playing') return;
    const localTimer = setInterval(() => {
      spawnPredictedThreat();
    }, aiTrapFrequencyMs);
    return () => clearInterval(localTimer);
  }, [status, aiTrapFrequencyMs, spawnPredictedThreat]);

  // AI Strategist
  useEffect(() => {
    if (status !== 'playing') return;

    const strategyTimer = setInterval(async () => {
      if (isProcessing || status !== 'playing') return;
      if (!sessionIdRef.current) return;
      setIsProcessing(true);
      try {
        const response = await fetch('/api/ai-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            playerX: playerPosRef.current.x,
            playerY: playerPosRef.current.y,
            playerEnergy: playerEnergyRef.current,
            playerHunger: playerHungerRef.current,
            currentMap: currentMapRef.current
          })
        });

        if (!response.ok) throw new Error('AI Strategist request failed');
        
        const aiStrategy = await response.json();
        handleAITurn(aiStrategy);
      } catch (error) {
        console.error("AI Strategy failed to update:", error);
      } finally {
        setIsProcessing(false);
      }
    }, 10000);

    return () => clearInterval(strategyTimer);
  }, [status, isProcessing, handleAITurn]);

  if (status === 'game_over') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${PIXEL_HUD.overlayBackdrop}`}>
        <div className={`p-8 text-center ${PIXEL_HUD.panelDanger}`}>
          <h1 className="mb-4 font-mono text-4xl sm:text-6xl font-bold text-[#d36d57] animate-pulse">VITAL SIGNS LOST</h1>
          <button onClick={() => window.location.reload()} className={`mt-8 ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonSecondary}`}>
            REBOOT SYSTEM
          </button>
        </div>
      </div>
    );
  }

  if (status === 'victory') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${PIXEL_HUD.overlayBackdrop}`}>
        <div className={`p-8 text-center ${PIXEL_HUD.panelSuccess}`}>
          <h1 className="mb-4 font-mono text-4xl sm:text-6xl font-bold text-[#8fbe5e] animate-pulse">CONNECTION SECURED</h1>
          <button onClick={() => window.location.reload()} className={`mt-8 ${PIXEL_HUD.buttonBase} ${PIXEL_HUD.buttonSecondary}`}>
            NEW INSTANCE
          </button>
        </div>
      </div>
    );
  }

  return null;
}
