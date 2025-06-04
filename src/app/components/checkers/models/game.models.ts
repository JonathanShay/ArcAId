export type Player = 'B' | 'W'; // Black or White
export type PieceType = 'normal' | 'king';
export type CellState = {
  player: Player | null;
  type: PieceType | null;
} | null;
export type GameStatus = 'playing' | 'won' | 'draw';

export interface Cell {
  player: Player;
  type: 'normal' | 'king';
}

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  player: Player;
  capturedPieces?: { row: number; col: number }[];
}

export interface GameState {
  board: (Cell | null)[][];
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  validMoves: Move[];
  score: {
    black: number;
    white: number;
  };
} 