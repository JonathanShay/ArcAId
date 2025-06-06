export type Player = 'B' | 'W'; // Black and White pieces
export type CellState = Player | null;
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GameState {
  board: CellState[][];
  currentPlayer: Player;
  gameStatus: 'playing' | 'won' | 'draw';
  winner: Player | null;
  validMoves: { row: number; col: number }[];
  score: {
    black: number;
    white: number;
  };
  difficulty: DifficultyLevel;
  moveCount: number;
  gameTime: number;
  lastComputerMove?: { row: number; col: number };
}

export interface Move {
  row: number;
  col: number;
  player: Player;
  flippedPieces: { row: number; col: number }[];
} 