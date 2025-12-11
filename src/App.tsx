import React, { useEffect } from 'react';
import { GameScene } from './components/Game/Scene';
import { MotionTracker } from './components/Input/MotionTracker';
import { useGameStore } from './store/gameStore';
import { Trophy, Activity, Camera, Zap, RotateCcw, RefreshCw } from 'lucide-react';

function App() {
  const { playerScore, opponentScore, gameState, setGameState, retryPoint, restartMatch } = useGameStore();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900 font-sans select-none">
      
      {/* 3D Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Header / Scoreboard */}
        <div className="flex justify-between items-start pointer-events-auto">
            {/* Player Score */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    <span className="font-bold text-white tracking-wider text-sm">YOU</span>
                </div>
                <div className="text-5xl font-black text-white drop-shadow-lg">{playerScore}</div>
            </div>

            {/* Game Logo / Title / Controls */}
            <div className="mt-2 flex flex-col items-center">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm tracking-tighter italic">
                    MOTION TENNIS
                </h1>
                
                {/* Controls - Only visible during gameplay */}
                {(gameState === 'RALLY' || gameState === 'SERVING' || gameState === 'POINT_END') && (
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={retryPoint}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all text-sm font-bold shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                            title="Reset current point"
                        >
                            <RotateCcw size={14} />
                            RETRY
                        </button>
                        <button 
                            onClick={restartMatch}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 px-4 py-2 rounded-full backdrop-blur-md border border-red-500/20 transition-all text-sm font-bold shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                            title="Restart entire match"
                        >
                            <RefreshCw size={14} />
                            RESTART
                        </button>
                    </div>
                )}
            </div>

            {/* Opponent Score */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white tracking-wider text-sm">CPU</span>
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                </div>
                <div className="text-5xl font-black text-white drop-shadow-lg">{opponentScore}</div>
            </div>
        </div>

        {/* Start Button Overlay */}
        {(gameState === 'MENU' || gameState === 'GAME_OVER') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm z-50">
                <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md text-center max-w-lg shadow-2xl">
                    <Trophy size={64} className="text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    <h2 className="text-4xl font-bold text-white mb-2">
                        {gameState === 'GAME_OVER' ? (playerScore > opponentScore ? 'YOU WON!' : 'CPU WINS') : 'Ready to Play?'}
                    </h2>
                    <p className="text-gray-300 mb-8">
                        {gameState === 'GAME_OVER' ? 'Great match! Play again?' : 'Stand back until you see your skeleton in the camera box.'}
                    </p>
                    
                    <button 
                        onClick={() => {
                            if (gameState === 'GAME_OVER') restartMatch();
                            else setGameState('SERVING');
                        }}
                        className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.5)] transform transition hover:scale-105 flex items-center gap-3 mx-auto overflow-hidden cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {gameState === 'GAME_OVER' ? 'PLAY AGAIN' : 'START MATCH'} <Zap className="group-hover:text-yellow-300 transition-colors" />
                        </span>
                    </button>
                </div>
            </div>
        )}

        {/* Bottom Area */}
        <div className="flex justify-between items-end w-full">
            {/* Instructions */}
            <div className="bg-black/40 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 max-w-md shadow-lg hidden md:block">
                <h3 className="font-bold flex items-center gap-2 mb-3 text-cyan-400 uppercase tracking-wide text-sm">
                    <Activity size={16} />
                    Controls
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</div>
                        <p className="text-sm text-gray-200">Move your body <span className="text-white font-bold">Left/Right</span> to position.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</div>
                        <p className="text-sm text-gray-200">Swing hand <span className="text-white font-bold">Fast</span> to hit.</p>
                    </div>
                </div>
            </div>

            {/* Camera Feed (Bottom Right) */}
            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-white/80 text-xs font-mono bg-black/50 px-3 py-1 rounded-full backdrop-blur">
                    <Camera size={12} />
                    <span>AI VISION ACTIVE</span>
                </div>
                <div className="w-64 h-48 pointer-events-auto relative">
                    <MotionTracker />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;
