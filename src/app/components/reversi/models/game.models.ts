export type Player = 'B' | 'W'; // Black and White pieces
export type CellState = Player | null;

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
}

export interface Move {
  row: number;
  col: number;
  player: Player;
  flippedPieces: { row: number; col: number }[];
} 