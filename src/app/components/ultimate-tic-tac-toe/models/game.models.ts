export type Player = 'X' | 'O';
export type CellValue = Player | 'draw' | null;
export type BoardState = CellValue[][];
export type GameStatus = 'playing' | 'won' | 'draw';

export interface SmallBoard {
  cells: BoardState;
  winner: CellValue;
  isActive: boolean;
}

export interface GameState {
  boards: SmallBoard[][];
  currentPlayer: Player;
  activeBoard: { row: number; col: number } | null;
  gameStatus: GameStatus;
  winner: CellValue;
}

export interface Move {
  boardRow: number;
  boardCol: number;
  cellRow: number;
  cellCol: number;
} 