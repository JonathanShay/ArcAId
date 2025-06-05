import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Move, Piece, PieceType, PieceColor } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState>(this.initializeGameState());
  private moveHistory: Move[] = [];
  private isComputerPlayer: boolean = false;
  private computerPlayer: PieceColor = 'black';

  constructor() {}

  getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  setComputerPlayer(enabled: boolean, computerPlaysAs: PieceColor = 'black'): void {
    this.isComputerPlayer = enabled;
    this.computerPlayer = computerPlaysAs;
    if (enabled && this.gameState.value.currentPlayer === computerPlaysAs) {
      this.makeComputerMove();
    }
  }

  private makeComputerMove(): void {
    const currentState = this.gameState.value;
    if (currentState.status !== 'playing' || currentState.currentPlayer !== this.computerPlayer) {
      return;
    }

    // Get all valid moves
    const validMoves: Move[] = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = currentState.board[fromRow][fromCol];
        if (piece && piece.color === this.computerPlayer) {
          const moves = this.getValidMoves(fromRow, fromCol);
          moves.forEach(({ row: toRow, col: toCol }) => {
            validMoves.push({
              from: { row: fromRow, col: fromCol },
              to: { row: toRow, col: toCol }
            });
          });
        }
      }
    }

    if (validMoves.length === 0) return;

    // Evaluate each move and choose the best one
    const bestMove = this.evaluateMoves(validMoves, currentState);
    if (bestMove) {
      // Add a small delay to make the computer's move feel more natural
      setTimeout(() => {
        this.makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
      }, 500);
    }
  }

  private evaluateMoves(moves: Move[], state: GameState): Move {
    // Prioritize moves in this order:
    // 1. Captures (especially high-value pieces)
    // 2. Checks
    // 3. Moves that control the center
    // 4. Moves that develop pieces
    // 5. Random move if no better option

    const evaluatedMoves = moves.map(move => ({
      move,
      score: this.evaluateMove(move, state)
    }));

    // Sort by score in descending order
    evaluatedMoves.sort((a, b) => b.score - a.score);

    // Return the move with the highest score
    return evaluatedMoves[0].move;
  }

  private evaluateMove(move: Move, state: GameState): number {
    let score = 0;
    const piece = state.board[move.from.row][move.from.col];
    const targetPiece = state.board[move.to.row][move.to.col];
    if (!piece) return score;

    // Prefer captures
    if (targetPiece) {
      score += this.getPieceValue(targetPiece.type) * 10;
    }

    // Prefer checks
    const newState = this.applyMove(state, move);
    if (this.isInCheck(newState, piece.color === 'white' ? 'black' : 'white')) {
      score += 5;
    }

    // Prefer moves that control the center
    const centerDistance = Math.abs(move.to.col - 3.5) + Math.abs(move.to.row - 3.5);
    score += (7 - centerDistance);

    // Prefer moves that develop pieces
    if (!piece.hasMoved) {
      score += 2;
    }

    // Prefer moves that don't leave pieces vulnerable
    if (this.isMoveSafe(move, state)) {
      score += 3;
    }

    return score;
  }

  private getPieceValue(type: PieceType): number {
    switch (type) {
      case 'pawn': return 1;
      case 'knight': return 3;
      case 'bishop': return 3;
      case 'rook': return 5;
      case 'queen': return 9;
      case 'king': return 100;
      default: return 0;
    }
  }

  private isMoveSafe(move: Move, state: GameState): boolean {
    const newState = this.applyMove(state, move);
    return !this.isInCheck(newState, state.currentPlayer);
  }

  makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number, promotion?: PieceType): void {
    const currentState = this.gameState.value;
    const move: Move = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      promotion
    };

    // First check if the move is valid according to piece movement rules
    if (this.isValidMove(currentState, move)) {
      // Then check if the move would resolve check (if in check) or not put/leave us in check
      const newState = this.applyMove(currentState, move);
      
      // Check if the move would leave our own king in check
      if (this.isInCheck(newState, currentState.currentPlayer)) {
        return; // Move would leave our king in check, so it's invalid
      }

      // If we're in check, verify that this move actually gets us out of check
      if (currentState.status === 'check') {
        const isInCheckAfterMove = this.isInCheck(newState, currentState.currentPlayer);
        if (isInCheckAfterMove) {
          return; // Move doesn't resolve check, so it's invalid
        }
      }

      // Check if this move puts the opponent in checkmate
      const opponentColor = currentState.currentPlayer === 'white' ? 'black' : 'white';
      const isOpponentInCheck = this.isInCheck(newState, opponentColor);
      const opponentHasLegalMoves = this.hasLegalMoves(newState, 1);
      
      if (isOpponentInCheck && !opponentHasLegalMoves) {
        // This is checkmate, update the state and return
        newState.status = 'checkmate';
        this.moveHistory.push(move);
        this.gameState.next(newState);
        return;
      }
      
      this.moveHistory.push(move);
      this.gameState.next(newState);

      // If computer player is enabled and it's the computer's turn, make a move
      if (this.isComputerPlayer && newState.currentPlayer === this.computerPlayer && newState.status === 'playing') {
        this.makeComputerMove();
      }
    }
  }

  getValidMoves(row: number, col: number): { row: number; col: number }[] {
    const currentState = this.gameState.value;
    const validMoves: { row: number; col: number }[] = [];

    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        const move: Move = {
          from: { row, col },
          to: { row: toRow, col: toCol }
        };

        if (this.isValidMove(currentState, move)) {
          const newState = this.applyMove(currentState, move);
          if (!this.isInCheck(newState, currentState.currentPlayer)) {
            // If we're in check, only allow moves that get us out of check
            if (currentState.status === 'check') {
              const isInCheckAfterMove = this.isInCheck(newState, currentState.currentPlayer);
              if (!isInCheckAfterMove) {
                validMoves.push({ row: toRow, col: toCol });
              }
            } else {
              validMoves.push({ row: toRow, col: toCol });
            }
          }
        }
      }
    }

    return validMoves;
  }

  resetGame(): void {
    this.gameState.next(this.initializeGameState());
    this.moveHistory = [];
  }

  undoMove(): void {
    if (this.moveHistory.length > 0) {
      this.moveHistory.pop();
      const initialState = this.initializeGameState();
      let currentState = { ...initialState };

      for (const move of this.moveHistory) {
        currentState = this.applyMove(currentState, move);
      }

      this.gameState.next(currentState);
    }
  }

  canUndo(): boolean {
    return this.moveHistory.length > 0;
  }

  private initializeGameState(): GameState {
    const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
      board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
    }

    // Set up other pieces
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false };
      board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false };
    }

    return {
      board,
      currentPlayer: 'white',
      status: 'playing',
      lastMove: null,
      capturedPieces: [],
      castlingRights: {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
      },
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  private isValidMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    const piece = state.board[from.row][from.col];

    if (!piece || piece.color !== state.currentPlayer) {
      return false;
    }

    // Basic validation
    if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) {
      return false;
    }

    const targetPiece = state.board[to.row][to.col];
    if (targetPiece && targetPiece.color === piece.color) {
      return false;
    }

    // Piece-specific validation
    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(state, move);
      case 'rook':
        return this.isValidRookMove(state, move);
      case 'knight':
        return this.isValidKnightMove(state, move);
      case 'bishop':
        return this.isValidBishopMove(state, move);
      case 'queen':
        return this.isValidQueenMove(state, move);
      case 'king':
        return this.isValidKingMove(state, move);
      default:
        return false;
    }
  }

  private isValidPawnMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    const piece = state.board[from.row][from.col]!;
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;

    // Forward move (must be in same column)
    if (from.col === to.col) {
      // Single square move
      if (to.row === from.row + direction && !state.board[to.row][to.col]) {
        return true;
      }
      // Double square move from starting position
      if (!piece.hasMoved && 
          to.row === from.row + 2 * direction && 
          !state.board[from.row + direction][from.col] && 
          !state.board[to.row][to.col]) {
        return true;
      }
    }

    // Diagonal capture moves (only allowed when capturing or en passant)
    if (Math.abs(to.col - from.col) === 1 && to.row === from.row + direction) {
      const targetPiece = state.board[to.row][to.col];
      const isEnPassant = state.enPassantTarget && 
                         to.row === state.enPassantTarget.row && 
                         to.col === state.enPassantTarget.col;

      // Must have either a piece to capture or be a valid en passant
      if ((targetPiece && targetPiece.color !== piece.color) || isEnPassant) {
        return true;
      }
    }

    return false;
  }

  private isValidRookMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    if (from.row !== to.row && from.col !== to.col) {
      return false;
    }

    const rowStep = from.row === to.row ? 0 : (to.row - from.row) / Math.abs(to.row - from.row);
    const colStep = from.col === to.col ? 0 : (to.col - from.col) / Math.abs(to.col - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row || currentCol !== to.col) {
      if (state.board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  private isValidKnightMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  private isValidBishopMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
      return false;
    }

    const rowStep = (to.row - from.row) / Math.abs(to.row - from.row);
    const colStep = (to.col - from.col) / Math.abs(to.col - from.col);

    let currentRow = from.row + rowStep;
    let currentCol = from.col + colStep;

    while (currentRow !== to.row && currentCol !== to.col) {
      if (state.board[currentRow][currentCol]) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  private isValidQueenMove(state: GameState, move: Move): boolean {
    // A queen can move like a rook or a bishop
    return this.isValidRookMove(state, move) || this.isValidBishopMove(state, move);
  }

  private isValidKingMove(state: GameState, move: Move): boolean {
    const { from, to } = move;
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Normal move (one square in any direction)
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }

    // Castling
    if (rowDiff === 0 && colDiff === 2) {
      const color = state.board[from.row][from.col]!.color;
      const castlingRights = state.castlingRights[color];
      const isKingSide = to.col > from.col;

      // Check if castling rights exist
      if (!castlingRights[isKingSide ? 'kingSide' : 'queenSide']) {
        return false;
      }

      // Check if king is in check
      if (this.isInCheck(state, color)) {
        return false;
      }

      const rookCol = isKingSide ? 7 : 0;
      const rook = state.board[from.row][rookCol];
      
      // Check if rook exists and hasn't moved
      if (!rook || rook.type !== 'rook' || rook.color !== color || rook.hasMoved) {
        return false;
      }

      // Check if there are pieces between king and rook
      const step = isKingSide ? 1 : -1;
      let currentCol = from.col + step;
      while (currentCol !== rookCol) {
        if (state.board[from.row][currentCol]) {
          return false;
        }
        currentCol += step;
      }

      // Check if any of the squares the king moves through are under attack
      const checkCol = from.col + step;
      if (this.isSquareUnderAttack(state, from.row, checkCol, color) ||
          this.isSquareUnderAttack(state, from.row, to.col, color)) {
        return false;
      }

      return true;
    }

    return false;
  }

  private isSquareUnderAttack(state: GameState, row: number, col: number, defendingColor: 'white' | 'black'): boolean {
    const attackingColor = defendingColor === 'white' ? 'black' : 'white';
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = state.board[fromRow][fromCol];
        if (piece && piece.color === attackingColor) {
          const move: Move = {
            from: { row: fromRow, col: fromCol },
            to: { row, col }
          };
          if (this.isValidMove(state, move)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isInCheck(state: GameState, color: 'white' | 'black'): boolean {
    // Find the king of the specified color
    let kingRow = -1;
    let kingCol = -1;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece?.type === 'king' && piece.color === color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    // Check if any opponent piece can capture the king
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.color === opponentColor) {
          const move: Move = {
            from: { row, col },
            to: { row: kingRow, col: kingCol }
          };
          if (this.isValidMove(state, move)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private hasLegalMoves(state: GameState, depth: number = 0): boolean {
    // Prevent infinite recursion
    if (depth > 1) return true;

    const currentPlayer = state.currentPlayer;
    let hasLegalMoves = false;

    // First check if the current player is in check
    const isInCheck = this.isInCheck(state, currentPlayer);

    // Iterate through the board to find pieces belonging to the current player
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = state.board[fromRow][fromCol];
        if (piece && piece.color === currentPlayer) {
          // Check all possible moves for this piece
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              const move: Move = {
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol }
              };

              // Validate the move
              if (this.isValidMove(state, move)) {
                // Apply the move to a copy of the state
                const newState = this.applyMove(state, move, depth + 1);

                // Check if the move leaves the king in check
                if (!this.isInCheck(newState, currentPlayer)) {
                  hasLegalMoves = true;
                  break;
                }
              }
            }
            if (hasLegalMoves) break;
          }
        }
        if (hasLegalMoves) break;
      }
      if (hasLegalMoves) break;
    }

    return hasLegalMoves;
  }

  private applyMove(state: GameState, move: Move, depth: number = 0): GameState {
    const newState: GameState = {
      ...state,
      board: state.board.map(row => [...row]),
      currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
      lastMove: move,
      capturedPieces: [...state.capturedPieces],
      castlingRights: {
        white: { ...state.castlingRights.white },
        black: { ...state.castlingRights.black }
      },
      enPassantTarget: null,
      halfMoveClock: state.halfMoveClock + 1,
      fullMoveNumber: state.currentPlayer === 'black' ? state.fullMoveNumber + 1 : state.fullMoveNumber,
      status: 'playing'
    };

    const { from, to, promotion } = move;
    const piece = state.board[from.row][from.col];
    const targetPiece = state.board[to.row][to.col];

    // Handle piece movement
    newState.board[to.row][to.col] = piece ? { ...piece, hasMoved: true } : null;
    newState.board[from.row][from.col] = null;

    // Handle captures
    if (targetPiece) {
      newState.capturedPieces.push(targetPiece);
      newState.halfMoveClock = 0;
    }

    // Handle castling
    if (piece?.type === 'king' && Math.abs(from.col - to.col) === 2) {
      const isKingside = to.col > from.col;
      const rookCol = isKingside ? 7 : 0;
      const newRookCol = isKingside ? to.col - 1 : to.col + 1;
      const rook = newState.board[from.row][rookCol];
      if (rook) {
        newState.board[from.row][newRookCol] = { ...rook, hasMoved: true };
        newState.board[from.row][rookCol] = null;
      }
    }

    // Update castling rights
    if (piece?.type === 'king') {
      newState.castlingRights[state.currentPlayer].kingSide = false;
      newState.castlingRights[state.currentPlayer].queenSide = false;
    } else if (piece?.type === 'rook') {
      if (from.col === 0) {
        newState.castlingRights[state.currentPlayer].queenSide = false;
      } else if (from.col === 7) {
        newState.castlingRights[state.currentPlayer].kingSide = false;
      }
    }

    // Handle en passant
    if (piece?.type === 'pawn' && state.enPassantTarget && 
        to.row === state.enPassantTarget.row && to.col === state.enPassantTarget.col) {
      const capturedPawnRow = from.row;
      const capturedPawn = newState.board[capturedPawnRow][to.col];
      if (capturedPawn) {
        newState.capturedPieces.push(capturedPawn);
        newState.board[capturedPawnRow][to.col] = null;
        newState.halfMoveClock = 0;
      }
    }

    // Set en passant target for pawns
    if (piece?.type === 'pawn' && Math.abs(from.row - to.row) === 2) {
      newState.enPassantTarget = {
        row: (from.row + to.row) / 2,
        col: from.col
      };
    }

    // Handle pawn promotion
    if (piece?.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      newState.board[to.row][to.col] = {
        type: promotion || 'queen',
        color: piece.color,
        hasMoved: true
      };
    }

    // Reset half-move clock for pawn moves
    if (piece?.type === 'pawn') {
      newState.halfMoveClock = 0;
    }

    // Only check for check, checkmate, stalemate, or draw at depth 0
    if (depth === 0) {
      // First check if the move puts the opponent in check
      const nextPlayer = newState.currentPlayer;
      const isOpponentInCheck = this.isInCheck(newState, nextPlayer);
      const opponentHasLegalMoves = this.hasLegalMoves(newState, 1);

      if (isOpponentInCheck) {
        if (!opponentHasLegalMoves) {
          newState.status = 'checkmate';
        } else {
          newState.status = 'check';
        }
      } else if (!opponentHasLegalMoves) {
        newState.status = 'stalemate';
      } else if (this.isDraw(newState)) {
        newState.status = 'draw';
      }
    }

    return newState;
  }

  private isDraw(state: GameState): boolean {
    // Check for insufficient material
    const pieces = new Map<PieceType, number>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece) {
          pieces.set(piece.type, (pieces.get(piece.type) || 0) + 1);
        }
      }
    }

    // King vs King
    if (pieces.size === 2 && pieces.get('king') === 2) {
      return true;
    }

    // King and Knight vs King
    if (pieces.size === 3 && pieces.get('king') === 2 && pieces.get('knight') === 1) {
      return true;
    }

    // King and Bishop vs King
    if (pieces.size === 3 && pieces.get('king') === 2 && pieces.get('bishop') === 1) {
      return true;
    }

    // Check for threefold repetition
    // This would require maintaining a move history with board states
    // For simplicity, we'll skip this check

    // Check for fifty-move rule
    if (state.halfMoveClock >= 50) {
      return true;
    }

    return false;
  }
} 