import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Move, Player, GameHistoryEntry } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly ROWS = 6;
  private readonly COLS = 7;
  private readonly WIN_LENGTH = 4;
  private readonly COMPUTER_SETTING_KEY = 'connect_four_computer_enabled';
  private readonly COMPUTER_PLAYER_KEY = 'connect_four_computer_player';

  private gameStateSubject = new BehaviorSubject<GameState>(this.getInitialState());
  private gameStateHistory: GameHistoryEntry[] = [];
  private isComputerPlayer: boolean = this.loadComputerSetting();
  private computerPlayer: Player = this.loadComputerPlayer();
  private moveSoundRed: HTMLAudioElement;
  private moveSoundYellow: HTMLAudioElement;

  constructor() {
    // Initialize history with initial state
    this.addToHistory(this.getInitialState(), null);
    
    // Initialize sound effects
    this.moveSoundRed = new Audio('assets/sounds/click-124467.mp3');
    this.moveSoundYellow = new Audio('assets/sounds/click-21156.mp3');

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
    return (saved === 'R' || saved === 'Y') ? saved : 'Y';
  }

  private saveComputerSetting(enabled: boolean): void {
    localStorage.setItem(this.COMPUTER_SETTING_KEY, enabled.toString());
  }

  private saveComputerPlayer(player: Player): void {
    localStorage.setItem(this.COMPUTER_PLAYER_KEY, player);
  }

  setComputerEnabled(enabled: boolean): void {
    this.isComputerPlayer = enabled;
    this.saveComputerSetting(enabled);
    if (enabled && this.gameStateSubject.getValue().currentPlayer === this.computerPlayer) {
      this.makeComputerMove();
    }
  }

  setComputerPlayer(player: Player): void {
    this.computerPlayer = player;
    this.saveComputerPlayer(player);
  }

  getGameState(): Observable<GameState> {
    return this.gameStateSubject.asObservable();
  }

  getGameStateHistory(): GameHistoryEntry[] {
    return this.gameStateHistory;
  }

  private getInitialState(): GameState {
    const board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
    return {
      board,
      currentPlayer: 'R',  // Red goes first
      gameStatus: 'playing',
      winner: null,
      lastMove: null,
      validMoves: Array.from({ length: this.COLS }, (_, i) => i)
    };
  }

  makeMove(column: number): void {
    const currentState = this.gameStateSubject.value;
    
    if (!this.isValidMove(currentState, column)) {
      return;
    }

    const newState = this.applyMove(currentState, column);
    this.gameStateSubject.next(newState);
    this.addToHistory(newState, { column, player: currentState.currentPlayer });

    // Play sound effect
    this.playMoveSound(currentState.currentPlayer);

    // If computer is enabled and it's computer's turn, make a move
    if (this.isComputerPlayer && newState.gameStatus === 'playing' && 
        newState.currentPlayer === this.computerPlayer) {
      setTimeout(() => this.makeComputerMove(), 500);
    }
  }

  private isValidMove(state: GameState, column: number): boolean {
    if (state.gameStatus !== 'playing') return false;
    if (column < 0 || column >= this.COLS) return false;
    return state.board[0][column] === null;  // Check if top row is empty
  }

  private applyMove(state: GameState, column: number): GameState {
    const newState = { ...state };
    newState.board = state.board.map((row: (Player | null)[]) => [...row]);
    
    // Find the lowest empty row in the selected column
    for (let row = 5; row >= 0; row--) {
      if (newState.board[row][column] === null) {
        newState.board[row][column] = state.currentPlayer;
        newState.lastMove = { column, player: state.currentPlayer };
        break;
      }
    }
    
    // Update game state
    newState.currentPlayer = state.currentPlayer === 'R' ? 'Y' : 'R';
    newState.validMoves = this.getValidMoves(newState.board);
    
    // Check for win or draw
    const gameResult = this.checkGameResult(newState.board);
    if (gameResult.won) {
      newState.gameStatus = 'won';
      newState.winner = gameResult.winner;
    } else if (gameResult.draw) {
      newState.gameStatus = 'draw';
    }
    
    return newState;
  }

  private checkWin(board: (Player | null)[][], row: number, col: number): boolean {
    const player = board[row][col];
    if (!player) return false;

    // Check horizontal
    for (let c = Math.max(0, col - 3); c <= Math.min(this.COLS - 4, col); c++) {
      if (board[row][c] === player &&
          board[row][c + 1] === player &&
          board[row][c + 2] === player &&
          board[row][c + 3] === player) {
        return true;
      }
    }

    // Check vertical
    for (let r = Math.max(0, row - 3); r <= Math.min(this.ROWS - 4, row); r++) {
      if (board[r][col] === player &&
          board[r + 1][col] === player &&
          board[r + 2][col] === player &&
          board[r + 3][col] === player) {
        return true;
      }
    }

    // Check diagonal (down-right)
    for (let r = Math.max(0, row - 3); r <= Math.min(this.ROWS - 4, row); r++) {
      for (let c = Math.max(0, col - 3); c <= Math.min(this.COLS - 4, col); c++) {
        if (board[r][c] === player &&
            board[r + 1][c + 1] === player &&
            board[r + 2][c + 2] === player &&
            board[r + 3][c + 3] === player) {
          return true;
        }
      }
    }

    // Check diagonal (down-left)
    for (let r = Math.max(0, row - 3); r <= Math.min(this.ROWS - 4, row); r++) {
      for (let c = Math.min(this.COLS - 1, col + 3); c >= Math.max(3, col); c--) {
        if (board[r][c] === player &&
            board[r + 1][c - 1] === player &&
            board[r + 2][c - 2] === player &&
            board[r + 3][c - 3] === player) {
          return true;
        }
      }
    }

    return false;
  }

  private checkDraw(board: (Player | null)[][]): boolean {
    return board[0].every(cell => cell !== null);
  }

  private getValidMoves(board: (Player | null)[][]): number[] {
    return board[0]
      .map((cell, index) => cell === null ? index : -1)
      .filter(index => index !== -1);
  }

  private addToHistory(state: GameState, move: Move | null): void {
    this.gameStateHistory.push({ state: { ...state }, move });
  }

  resetGame(): void {
    const initialState = this.getInitialState();
    this.gameStateHistory = [];
    this.addToHistory(initialState, null);
    this.gameStateSubject.next(initialState);
  }

  undoMove(): void {
    if (this.gameStateHistory.length > 1) {
      this.gameStateHistory.pop();
      const previousState = this.gameStateHistory[this.gameStateHistory.length - 1].state;
      this.gameStateSubject.next({ ...previousState });
    }
  }

  canUndo(): boolean {
    return this.gameStateHistory.length > 1;
  }

  getGameHistoryString(): string {
    return this.gameStateHistory
      .slice(1)  // Skip initial state
      .map(entry => {
        if (!entry.move) return '';
        return `${entry.move.player}${entry.move.column + 1}`;
      })
      .filter(move => move !== '')
      .join(' ');
  }

  private playMoveSound(player: Player): void {
    const sound = player === 'R' ? this.moveSoundRed : this.moveSoundYellow;
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Audio play failed:', err));
  }

  private getComputerMove(state: GameState): number | null {
    if (state.validMoves.length === 0) {
      return null;
    }

    // Try to win
    for (const col of state.validMoves) {
      const testState = this.applyMove(state, col);
      if (testState.gameStatus === 'won' && testState.winner === this.computerPlayer) {
        return col;
      }
    }

    // Try to block opponent
    for (const col of state.validMoves) {
      const testState = this.applyMove(state, col);
      if (testState.gameStatus === 'won' && testState.winner !== this.computerPlayer) {
        return col;
      }
    }

    // Make a random valid move
    return state.validMoves[Math.floor(Math.random() * state.validMoves.length)];
  }

  private makeComputerMove(): void {
    const state = this.gameStateSubject.value;
    if (state.gameStatus !== 'playing' || state.currentPlayer !== this.computerPlayer) {
      return;
    }

    const column = this.getComputerMove(state);
    if (column !== null) {
      this.makeMove(column);
    }
  }

  private checkGameResult(board: (Player | null)[][]): { won: boolean; winner: Player | null; draw: boolean } {
    const result = { won: false, winner: null as Player | null, draw: false };

    // Check for win
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (board[row][col] !== null && this.checkWin(board, row, col)) {
          result.won = true;
          result.winner = board[row][col];
          return result;
        }
      }
    }

    // Check for draw
    if (this.checkDraw(board)) {
      result.draw = true;
      return result;
    }

    return result;
  }

  private getLastMove(): Move | null {
    const state = this.gameStateSubject.value;
    return state.lastMove;
  }
} 