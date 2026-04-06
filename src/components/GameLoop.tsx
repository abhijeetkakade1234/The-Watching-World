'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

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
  } = useGameStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const playerPosRef = useRef(playerPos);
  const playerEnergyRef = useRef(playerEnergy);
  const playerHungerRef = useRef(playerHunger);
  const sessionIdRef = useRef(sessionId);
  const entitiesRef = useRef(entities);
  const startTimeRef = useRef(gameStartTime);

  useEffect(() => {
    playerPosRef.current = playerPos;
    playerEnergyRef.current = playerEnergy;
    playerHungerRef.current = playerHunger;
    sessionIdRef.current = sessionId;
    entitiesRef.current = entities;
    startTimeRef.current = gameStartTime;
  }, [playerPos, playerEnergy, playerHunger, sessionId, entities, gameStartTime]);

  // Survival Ticking (Hunger/Vision)
  useEffect(() => {
    if (status !== 'playing') return;
    const survivalTimer = setInterval(() => {
      updateSurvival();
    }, 500); 
    return () => clearInterval(survivalTimer);
  }, [status, updateSurvival]);

  // Fast Local Loop (Physical Predictor)
  useEffect(() => {
    if (status !== 'playing') return;
    
    // Trigger local AI based on Gemini's requested frequency
    const localTimer = setInterval(() => {
      spawnPredictedThreat();
    }, aiTrapFrequencyMs);

    return () => clearInterval(localTimer);
  }, [status, aiTrapFrequencyMs, spawnPredictedThreat]);

  // Slow Remote Loop (Gemini Strategist)
  useEffect(() => {
    if (status !== 'playing') return;

    // Fetch master strategy every 10 seconds
    const strategyTimer = setInterval(async () => {
      if (isProcessing || status !== 'playing') return;
      if (!sessionIdRef.current) return;
      setIsProcessing(true);
      try {
        const corruptedCount = entitiesRef.current.filter(e => e.type === 'corruption').length;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        const response = await fetch('/api/ai-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            playerX: playerPosRef.current.x,
            playerY: playerPosRef.current.y,
            playerEnergy: playerEnergyRef.current,
            playerHunger: playerHungerRef.current,
            elapsedSeconds: elapsed,
            corruptedCount
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
    }, 10000); // 10 seconds

    return () => clearInterval(strategyTimer);
  }, [status, isProcessing, handleAITurn]);

  if (status === 'game_over') {
    const isStarved = playerHunger >= 100;
    const title = isStarved ? "VITAL SIGNS LOST" : "SYSTEM OVERWHELM";
    const desc = isStarved ? "You succumbed to exhaustion." : "The world consumed you.";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="text-center p-8 bg-slate-900/40 border border-red-500/30 rounded-xl">
          <h1 className="text-6xl font-bold text-red-500 mb-4 animate-pulse">{title}</h1>
          <p className="text-slate-300 text-xl font-mono">{desc}</p>
          <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-red-900/50 border-2 border-red-500/50 rounded-lg text-white font-bold hover:bg-red-800 hover:border-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">REBOOT SYSTEM</button>
        </div>
      </div>
    );
  }

  if (status === 'victory') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-emerald-400 mb-4 animate-pulse">CONNECTION SECURED</h1>
          <p className="text-slate-300 text-xl">You outsmarted the system.</p>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500 rounded text-white font-bold transition-all">NEW INSTANCE</button>
        </div>
      </div>
    );
  }

  return null;
}
