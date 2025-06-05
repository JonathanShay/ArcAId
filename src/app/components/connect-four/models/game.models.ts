export type Player = 'R' | 'Y';

export interface Move {
  column: number;
  player: Player;
}

export interface GameState {
  board: (Player | null)[][];
  currentPlayer: Player;
  gameStatus: 'playing' | 'won' | 'draw';
  winner: Player | null;
  validMoves: number[];
  lastMove: Move | null;
}

export interface GameHistoryEntry {
  move: Move | null;
  state: GameState;
} 