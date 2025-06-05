export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  promotion?: PieceType;
}

export interface CastlingRights {
  kingSide: boolean;
  queenSide: boolean;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  status: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  lastMove: Move | null;
  capturedPieces: Piece[];
  castlingRights: {
    white: CastlingRights;
    black: CastlingRights;
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
} 