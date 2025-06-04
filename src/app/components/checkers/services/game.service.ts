import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Move, Player, Cell } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly BOARD_SIZE = 8;
  private readonly COMPUTER_SETTING_KEY = 'checkers_computer_enabled';
  private readonly COMPUTER_PLAYER_KEY = 'checkers_computer_player';
  private gameStateSubject = new BehaviorSubject<GameState>(this.getInitialState());
  private gameStateHistorySubject = new BehaviorSubject<{ state: GameState; move: Move | null }[]>([]);
  private isComputerPlayer: boolean = this.loadComputerSetting();
  private computerPlayer: Player = this.loadComputerPlayer();
  private moveSoundBlack: HTMLAudioElement;
  private moveSoundWhite: HTMLAudioElement;

  constructor() {
    // Initialize history with initial state
    this.addToHistory(this.getInitialState(), null);
    
    // Initialize sound effects
    this.moveSoundBlack = new Audio('assets/sounds/click-124467.mp3');
    this.moveSoundWhite = new Audio('assets/sounds/click-21156.mp3');

    // If computer is enabled and it's computer's turn, make a move
    if (this.isComputerPlayer && this.gameStateSubject.getValue().currentPlayer === this.computerPlayer) {
      this.makeComputerMove();
    }
  }

  private loadComputerSetting(): boolean {
    const saved = localStorage.getItem(this.COMPUTER_SETTING_KEY);
    return saved === 'true';
  }

  private loadComputerPlayer(): Player {
    const saved = localStorage.getItem(this.COMPUTER_PLAYER_KEY);
    return (saved === 'B' || saved === 'W') ? saved : 'W';
  }

  private saveComputerSetting(enabled: boolean): void {
    localStorage.setItem(this.COMPUTER_SETTING_KEY, enabled.toString());
  }

  private saveComputerPlayer(player: Player): void {
    localStorage.setItem(this.COMPUTER_PLAYER_KEY, player);
  }

  getGameState(): Observable<GameState> {
    return this.gameStateSubject.asObservable();
  }

  getGameStateHistory(): Observable<{ state: GameState; move: Move | null }[]> {
    return this.gameStateHistorySubject.asObservable();
  }

  getInitialState(): GameState {
    const board: (Cell | null)[][] = Array(this.BOARD_SIZE).fill(null).map(() => Array(this.BOARD_SIZE).fill(null));
    
    // Place black pieces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'B', type: 'normal' };
        }
      }
    }
    
    // Place white pieces
    for (let row = 5; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'W', type: 'normal' };
        }
      }
    }

    const initialState: GameState = {
      board,
      currentPlayer: 'B',
      validMoves: this.calculateValidMoves(board, 'B'),
      gameStatus: 'playing',
      winner: null,
      score: { black: 0, white: 0 }
    };

    return initialState;
  }

  resetGame(): void {
    const initialState = this.getInitialState();
    this.gameStateHistorySubject.next([]);
    this.addToHistory(initialState, null);
    this.gameStateSubject.next(initialState);
  }

  private validateMove(move: Move, state: GameState): boolean {
    return state.validMoves.some(m => 
      m.fromRow === move.fromRow && 
      m.fromCol === move.fromCol && 
      m.toRow === move.toRow && 
      m.toCol === move.toCol
    );
  }

  private addToHistory(state: GameState, move: Move | null): void {
    const currentHistory = this.gameStateHistorySubject.getValue();
    const newHistory = [...currentHistory, { state: { ...state }, move: move ? { ...move } : null }];
    this.gameStateHistorySubject.next(newHistory);
  }

  setComputerPlayer(enabled: boolean, computerPlaysAs: Player = 'W'): void {
    this.isComputerPlayer = enabled;
    this.computerPlayer = computerPlaysAs;
    this.saveComputerSetting(enabled);
    this.saveComputerPlayer(computerPlaysAs);
    if (enabled && this.gameStateSubject.getValue().currentPlayer === computerPlaysAs) {
      this.makeComputerMove();
    }
  }

  isComputerEnabled(): boolean {
    return this.isComputerPlayer;
  }

  getComputerPlayer(): Player {
    return this.computerPlayer;
  }

  private makeComputerMove(): void {
    const currentState = this.gameStateSubject.getValue();
    if (currentState.gameStatus !== 'playing' || currentState.currentPlayer !== this.computerPlayer) {
      return;
    }

    // Get all valid moves
    const validMoves = currentState.validMoves;
    if (validMoves.length === 0) return;

    // Evaluate each move and choose the best one
    const bestMove = this.evaluateMoves(validMoves, currentState);
    if (bestMove) {
      // Add a small delay to make the computer's move feel more natural
      setTimeout(() => {
        this.makeMove(bestMove);
      }, 500);
    }
  }

  private evaluateMoves(moves: Move[], state: GameState): Move {
    // Prioritize moves in this order:
    // 1. Multiple captures
    // 2. Single captures
    // 3. Moves that get closer to becoming a king
    // 4. Moves that control the center
    // 5. Random move if no better option

    // First, look for multiple captures
    const multiCaptureMoves = moves.filter(move => {
      const board = state.board.map(row => [...row]);
      return this.hasAdditionalCaptures(move, board);
    });

    if (multiCaptureMoves.length > 0) {
      return multiCaptureMoves[Math.floor(Math.random() * multiCaptureMoves.length)];
    }

    // Then, prioritize single captures
    const captureMoves = moves.filter(move => move.capturedPieces && move.capturedPieces.length > 0);
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // For non-capture moves, evaluate based on position and king potential
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
    const piece = state.board[move.fromRow][move.fromCol];
    if (!piece) return score;

    // Prefer moves that get closer to becoming a king
    if (piece.type === 'normal') {
      if (piece.player === 'B') {
        score += move.toRow; // Black pieces want to move down
      } else {
        score += (this.BOARD_SIZE - 1 - move.toRow); // White pieces want to move up
      }
    }

    // Prefer moves that control the center
    const centerDistance = Math.abs(move.toCol - (this.BOARD_SIZE / 2));
    score += (this.BOARD_SIZE / 2 - centerDistance);

    // Prefer moves that don't leave pieces vulnerable
    if (this.isMoveSafe(move, state)) {
      score += 2;
    }

    return score;
  }

  private isMoveSafe(move: Move, state: GameState): boolean {
    const board = state.board.map(row => [...row]);
    const piece = board[move.fromRow][move.fromCol];
    if (!piece) return false;

    // Move the piece
    board[move.fromRow][move.fromCol] = null;
    board[move.toRow][move.toCol] = piece;

    // Check if the piece can be captured after the move
    const opponent = this.getOpponent(piece.player);
    const opponentMoves = this.calculateValidMoves(board, opponent);
    
    return !opponentMoves.some(m => 
      m.capturedPieces?.some(cp => 
        cp.row === move.toRow && cp.col === move.toCol
      )
    );
  }

  private hasAdditionalCaptures(move: Move, board: (Cell | null)[][]): boolean {
    const piece = board[move.fromRow][move.fromCol];
    if (!piece) return false;

    // Make the move
    board[move.fromRow][move.fromCol] = null;
    board[move.toRow][move.toCol] = piece;

    // Check for additional captures
    const directions = this.getValidDirections(piece);
    for (const [dRow, dCol] of directions) {
      const jumpRow = move.toRow + 2 * dRow;
      const jumpCol = move.toCol + 2 * dCol;
      const captureRow = move.toRow + dRow;
      const captureCol = move.toCol + dCol;

      if (this.isValidPosition(jumpRow, jumpCol) && 
          !board[jumpRow][jumpCol] && 
          board[captureRow][captureCol]?.player === this.getOpponent(piece.player)) {
        return true;
      }
    }

    return false;
  }

  makeMove(move: Move): void {
    const currentState = this.gameStateSubject.getValue();
    if (currentState.gameStatus !== 'playing') return;

    // Validate move
    const isValidMove = this.validateMove(move, currentState);
    if (!isValidMove) return;

    // Play move sound
    if (currentState.currentPlayer === 'B') {
      this.moveSoundBlack.play().catch(err => console.log('Error playing sound:', err));
    } else {
      this.moveSoundWhite.play().catch(err => console.log('Error playing sound:', err));
    }

    // Create new board state
    const newBoard = currentState.board.map(row => [...row]);
    const capturedPieces: { row: number; col: number }[] = [];

    // Move the piece
    const piece = newBoard[move.fromRow][move.fromCol];
    newBoard[move.fromRow][move.fromCol] = null;
    newBoard[move.toRow][move.toCol] = piece;

    // Handle captures
    if (Math.abs(move.toRow - move.fromRow) === 2) {
      const capturedRow = (move.fromRow + move.toRow) / 2;
      const capturedCol = (move.fromCol + move.toCol) / 2;
      newBoard[capturedRow][capturedCol] = null;
      capturedPieces.push({ row: capturedRow, col: capturedCol });
    }

    // Handle king promotion
    if ((move.toRow === 0 && piece?.player === 'W') || (move.toRow === 7 && piece?.player === 'B')) {
      piece!.type = 'king';
    }

    // Update score
    const newScore = { ...currentState.score };
    if (capturedPieces.length > 0) {
      newScore[currentState.currentPlayer === 'B' ? 'black' : 'white'] += capturedPieces.length;
    }

    // Check for game over
    const nextPlayer = currentState.currentPlayer === 'B' ? 'W' : 'B';
    const nextPlayerMoves = this.calculateValidMoves(newBoard, nextPlayer);
    const currentPlayerMoves = this.calculateValidMoves(newBoard, currentState.currentPlayer);

    let gameStatus: 'playing' | 'won' | 'draw' = 'playing';
    let winner: Player | null = null;

    if (nextPlayerMoves.length === 0) {
      gameStatus = 'won';
      winner = currentState.currentPlayer;
    } else if (currentPlayerMoves.length === 0) {
      gameStatus = 'won';
      winner = nextPlayer;
    }

    // Update game state
    const newState: GameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      validMoves: nextPlayerMoves,
      gameStatus,
      winner,
      score: newScore
    };

    // Add move to history
    const moveWithPlayer: Move = {
      ...move,
      player: currentState.currentPlayer,
      capturedPieces
    };
    this.addToHistory(newState, moveWithPlayer);

    this.gameStateSubject.next(newState);

    // If computer player is enabled and it's the computer's turn, make a move
    if (this.isComputerPlayer && nextPlayer === this.computerPlayer && gameStatus === 'playing') {
      this.makeComputerMove();
    }
  }

  private calculateValidMoves(board: (Cell | null)[][], player: Player): Move[] {
    const moves: Move[] = [];
    const captureMoves: Move[] = [];

    // Check each cell for valid moves
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const cell = board[row][col];
        if (!cell || cell.player !== player) continue;

        const directions = this.getValidDirections(cell);
        for (const [dRow, dCol] of directions) {
          // Check normal moves
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (this.isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
            moves.push({
              fromRow: row,
              fromCol: col,
              toRow: newRow,
              toCol: newCol,
              player
            });
          }

          // Check capture moves
          const jumpRow = row + 2 * dRow;
          const jumpCol = col + 2 * dCol;
          const captureRow = row + dRow;
          const captureCol = col + dCol;
          if (this.isValidPosition(jumpRow, jumpCol) && 
              !board[jumpRow][jumpCol] && 
              board[captureRow][captureCol]?.player === this.getOpponent(player)) {
            captureMoves.push({
              fromRow: row,
              fromCol: col,
              toRow: jumpRow,
              toCol: jumpCol,
              player,
              capturedPieces: [{ row: captureRow, col: captureCol }]
            });
          }
        }
      }
    }

    // If there are capture moves, only return those
    return captureMoves.length > 0 ? captureMoves : moves;
  }

  private getValidDirections(cell: Cell): [number, number][] {
    const directions: [number, number][] = [];
    if (cell.type === 'king' || cell.player === 'B') {
      directions.push([1, -1], [1, 1]); // Down-left, Down-right for black pieces
    }
    if (cell.type === 'king' || cell.player === 'W') {
      directions.push([-1, -1], [-1, 1]); // Up-left, Up-right for white pieces
    }
    return directions;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.BOARD_SIZE && col >= 0 && col < this.BOARD_SIZE;
  }

  private getOpponent(player: Player): Player {
    return player === 'B' ? 'W' : 'B';
  }
} 