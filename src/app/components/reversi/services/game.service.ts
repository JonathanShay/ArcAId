import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Move, Player, CellState, DifficultyLevel } from '../models/game.models';

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
  private gameTimer: any;
  private startTime: number = 0;

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
      },
      difficulty: 'medium',
      moveCount: 0,
      gameTime: 0
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

  setDifficulty(difficulty: DifficultyLevel): void {
    const currentState = this.gameStateSubject.value;
    this.gameStateSubject.next({
      ...currentState,
      difficulty
    });
  }

  makeMove(row: number, col: number): void {
    const currentState = this.gameStateSubject.value;
    if (currentState.gameStatus !== 'playing') return;

    const move = this.validateMove(currentState, row, col);
    if (!move) return;

    // Start timer if this is the first move
    if (currentState.moveCount === 0) {
      this.startTimer();
    }

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
      score: newScore,
      difficulty: currentState.difficulty,
      moveCount: currentState.moveCount + 1,
      gameTime: currentState.gameTime
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
        this.stopTimer();
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

    let bestMove: { row: number; col: number } | null = null;

    switch (currentState.difficulty) {
      case 'easy':
        bestMove = this.getEasyMove(currentState);
        break;
      case 'medium':
        bestMove = this.getMediumMove(currentState);
        break;
      case 'hard':
        bestMove = this.getHardMove(currentState);
        break;
    }

    if (bestMove) {
      // Emit an event that the computer is about to make a move
      this.gameStateSubject.next({
        ...currentState,
        lastComputerMove: bestMove
      });
      this.makeMove(bestMove.row, bestMove.col);
    }
  }

  private getEasyMove(state: GameState): { row: number; col: number } | null {
    // Randomly choose from valid moves
    const validMoves = state.validMoves;
    if (validMoves.length === 0) return null;
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  private getMediumMove(state: GameState): { row: number; col: number } | null {
    // Choose move that flips the most pieces
    let bestMove = state.validMoves[0];
    let maxFlips = 0;

    for (const move of state.validMoves) {
      const flippedPieces = this.getFlippedPieces(state, move.row, move.col);
      if (flippedPieces.length > maxFlips) {
        maxFlips = flippedPieces.length;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getHardMove(state: GameState): { row: number; col: number } | null {
    // Evaluate each move using a scoring system
    let bestScore = -Infinity;
    let bestMove = state.validMoves[0];

    for (const move of state.validMoves) {
      const score = this.evaluateMove(state, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private evaluateMove(state: GameState, move: { row: number; col: number }): number {
    // Corner moves are highly valued
    if ((move.row === 0 || move.row === 7) && (move.col === 0 || move.col === 7)) {
      return 100;
    }

    // Edge moves are good
    if (move.row === 0 || move.row === 7 || move.col === 0 || move.col === 7) {
      return 50;
    }

    // Moves that flip more pieces are better
    const flippedPieces = this.getFlippedPieces(state, move.row, move.col);
    const flipScore = flippedPieces.length * 10;

    // Avoid moves that give opponent access to corners
    const opponentNextMoves = this.getOpponentNextMoves(state, move);
    const cornerAccessPenalty = opponentNextMoves.filter(m => 
      (m.row === 0 || m.row === 7) && (m.col === 0 || m.col === 7)
    ).length * -30;

    return flipScore + cornerAccessPenalty;
  }

  private getOpponentNextMoves(state: GameState, move: { row: number; col: number }): { row: number; col: number }[] {
    // Create a copy of the state and make the move
    const newBoard = state.board.map(row => [...row]);
    const flippedPieces = this.getFlippedPieces(state, move.row, move.col);
    flippedPieces.forEach(({ row, col }) => {
      newBoard[row][col] = state.currentPlayer;
    });
    newBoard[move.row][move.col] = state.currentPlayer;

    // Calculate opponent's valid moves
    const opponent = state.currentPlayer === 'B' ? 'W' : 'B';
    const opponentState: GameState = {
      ...state,
      board: newBoard,
      currentPlayer: opponent
    };

    return this.calculateValidMoves(opponentState);
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.gameTimer = setInterval(() => {
      const currentState = this.gameStateSubject.value;
      const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.gameStateSubject.next({
        ...currentState,
        gameTime: elapsedTime
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
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
    const currentDifficulty = this.gameStateSubject.value.difficulty;
    const initialState = this.getInitialState();
    initialState.difficulty = currentDifficulty;
    this.gameStateSubject.next(initialState);
    this.gameStateHistory = [initialState];
  }

  undoLastTurn(): void {
    if (this.gameStateHistory.length < 2) return;
    this.gameStateHistory.pop(); // Remove current state
    const previousState = this.gameStateHistory[this.gameStateHistory.length - 1];
    this.gameStateSubject.next(previousState);
  }
} 