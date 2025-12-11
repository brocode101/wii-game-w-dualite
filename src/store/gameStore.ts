import { create } from 'zustand';

export type GameState = 'MENU' | 'SERVING' | 'RALLY' | 'POINT_END' | 'GAME_OVER';

interface GameStore {
  gameState: GameState;
  playerScore: number;
  opponentScore: number;
  message: string;
  
  // Motion Inputs (Updated by MotionTracker, read by GameLoop)
  playerPositionX: number; // -1 (Left) to 1 (Right)
  isSwinging: boolean;
  swingType: 'forehand' | 'backhand' | 'none';
  
  // Actions
  setGameState: (state: GameState) => void;
  addScore: (winner: 'player' | 'opponent') => void;
  updateMotion: (x: number, isSwinging: boolean, swingType: 'forehand' | 'backhand' | 'none') => void;
  resetGame: () => void;
  retryPoint: () => void;
  restartMatch: () => void; // New action
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU',
  playerScore: 0,
  opponentScore: 0,
  message: 'Welcome to Motion Tennis!',
  
  playerPositionX: 0,
  isSwinging: false,
  swingType: 'none',

  setGameState: (state) => set({ gameState: state }),
  
  addScore: (winner) => set((state) => {
    const newPlayerScore = winner === 'player' ? state.playerScore + 15 : state.playerScore;
    const newOpponentScore = winner === 'opponent' ? state.opponentScore + 15 : state.opponentScore;
    
    // Simplified Tennis Scoring for Demo (15, 30, 40, Game)
    let nextState = state.gameState;
    let msg = winner === 'player' ? 'Point You!' : 'Point Opponent!';

    if (newPlayerScore > 40 || newOpponentScore > 40) {
        nextState = 'GAME_OVER';
        msg = newPlayerScore > newOpponentScore ? 'You Win!' : 'Opponent Wins!';
    } else {
        nextState = 'POINT_END';
    }

    return {
      playerScore: newPlayerScore > 40 ? 0 : newPlayerScore, 
      opponentScore: newOpponentScore > 40 ? 0 : newOpponentScore,
      gameState: nextState,
      message: msg
    };
  }),

  updateMotion: (x, isSwinging, swingType) => set({ 
    playerPositionX: x, 
    isSwinging, 
    swingType 
  }),

  resetGame: () => set({
    gameState: 'MENU',
    playerScore: 0,
    opponentScore: 0,
    message: 'Ready?'
  }),

  retryPoint: () => set({
    gameState: 'SERVING',
    message: 'Replay Point'
  }),

  restartMatch: () => set({
    gameState: 'SERVING',
    playerScore: 0,
    opponentScore: 0,
    message: 'Match Restarted'
  })
}));
