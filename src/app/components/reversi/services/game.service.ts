import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Move, Player, CellState } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly BOARD_SIZE = 8;
  private readonly DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  private gameStateSubject = new BehaviorSubject<GameState>(this.getInitialState());
  private gameStateHistory: (GameState & { move?: Move })[] = [];

  constructor() {
    this.gameStateHistory.push(this.getInitialState());
  }

  getInitialState(): GameState {
    const board = Array(this.BOARD_SIZE).fill(null).map(() => Array(this.BOARD_SIZE).fill(null));
    
    // Set up initial pieces
    const center = this.BOARD_SIZE / 2;
    board[center - 1][center - 1] = 'W';
    board[center - 1][center] = 'B';
    board[center][center - 1] = 'B';
    board[center][center] = 'W';

    const initialState: GameState = {
      board,
      currentPlayer: 'B', // Black goes first
      gameStatus: 'playing',
      winner: null,
      validMoves: [],
      score: {
        black: 2,
        white: 2
      }
    };

    // Calculate initial valid moves
    initialState.validMoves = this.calculateValidMoves(initialState);
    return initialState;
  }

  getGameState(): Observable<GameState> {
    return this.gameStateSubject.asObservable();
  }

  getGameStateHistory(): (GameState & { move?: Move })[] {
    return this.gameStateHistory;
  }

  makeMove(row: number, col: number): void {
    const currentState = this.gameStateSubject.value;
    if (currentState.gameStatus !== 'playing') return;

    const move = this.validateMove(currentState, row, col);
    if (!move) return;

    // Create new board state
    const newBoard = currentState.board.map(row => [...row]);
    move.flippedPieces.forEach(({ row, col }) => {
      newBoard[row][col] = currentState.currentPlayer;
    });
    newBoard[row][col] = currentState.currentPlayer;

    // Calculate new score
    const newScore = this.calculateScore(newBoard);

    // Create new game state
    const nextPlayer = currentState.currentPlayer === 'B' ? 'W' : 'B';
    const newState: GameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      gameStatus: 'playing',
      winner: null,
      validMoves: [],
      score: newScore
    };

    // Calculate valid moves for next player
    newState.validMoves = this.calculateValidMoves(newState);

    // Check if game is over
    if (newState.validMoves.length === 0) {
      // If no valid moves for next player, check if current player has moves
      const currentPlayerMoves = this.calculateValidMoves({
        ...newState,
        currentPlayer: currentState.currentPlayer
      });

      if (currentPlayerMoves.length === 0) {
        // Game is over
        newState.gameStatus = 'won';
        newState.winner = newScore.black > newScore.white ? 'B' : 
                         newScore.white > newScore.black ? 'W' : null;
        if (!newState.winner) {
          newState.gameStatus = 'draw';
        }
      } else {
        // Skip next player's turn
        newState.currentPlayer = currentState.currentPlayer;
        newState.validMoves = currentPlayerMoves;
      }
    }

    // Update state
    this.gameStateHistory.push({ ...newState, move });
    this.gameStateSubject.next(newState);

    // If it's computer's turn (White), make a move
    if (newState.gameStatus === 'playing' && newState.currentPlayer === 'W') {
      setTimeout(() => this.makeComputerMove(), 500);
    }
  }

  private makeComputerMove(): void {
    const currentState = this.gameStateSubject.value;
    if (currentState.gameStatus !== 'playing' || currentState.currentPlayer !== 'W') return;

    // Simple AI: Choose the move that flips the most pieces
    let bestMove = currentState.validMoves[0];
    let maxFlips = 0;

    for (const move of currentState.validMoves) {
      const flippedPieces = this.getFlippedPieces(currentState, move.row, move.col);
      if (flippedPieces.length > maxFlips) {
        maxFlips = flippedPieces.length;
        bestMove = move;
      }
    }

    if (bestMove) {
      this.makeMove(bestMove.row, bestMove.col);
    }
  }

  private validateMove(state: GameState, row: number, col: number): Move | null {
    if (row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE) {
      return null;
    }

    if (state.board[row][col] !== null) {
      return null;
    }

    const flippedPieces = this.getFlippedPieces(state, row, col);
    if (flippedPieces.length === 0) {
      return null;
    }

    return {
      row,
      col,
      player: state.currentPlayer,
      flippedPieces
    };
  }

  private getFlippedPieces(state: GameState, row: number, col: number): { row: number; col: number }[] {
    const flippedPieces: { row: number; col: number }[] = [];
    const opponent = state.currentPlayer === 'B' ? 'W' : 'B';

    for (const [dx, dy] of this.DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      const directionFlipped: { row: number; col: number }[] = [];

      while (
        x >= 0 && x < this.BOARD_SIZE &&
        y >= 0 && y < this.BOARD_SIZE &&
        state.board[x][y] === opponent
      ) {
        directionFlipped.push({ row: x, col: y });
        x += dx;
        y += dy;
      }

      if (
        x >= 0 && x < this.BOARD_SIZE &&
        y >= 0 && y < this.BOARD_SIZE &&
        state.board[x][y] === state.currentPlayer &&
        directionFlipped.length > 0
      ) {
        flippedPieces.push(...directionFlipped);
      }
    }

    return flippedPieces;
  }

  private calculateValidMoves(state: GameState): { row: number; col: number }[] {
    const validMoves: { row: number; col: number }[] = [];

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (this.validateMove(state, row, col)) {
          validMoves.push({ row, col });
        }
      }
    }

    return validMoves;
  }

  private calculateScore(board: CellState[][]): { black: number; white: number } {
    let black = 0;
    let white = 0;

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col] === 'B') black++;
        if (board[row][col] === 'W') white++;
      }
    }

    return { black, white };
  }

  resetGame(): void {
    const initialState = this.getInitialState();
    this.gameStateHistory = [initialState];
    this.gameStateSubject.next(initialState);
  }

  undoLastTurn(): void {
    if (this.gameStateHistory.length < 2) return;
    this.gameStateHistory.pop(); // Remove current state
    const previousState = this.gameStateHistory[this.gameStateHistory.length - 1];
    this.gameStateSubject.next(previousState);
  }
} 