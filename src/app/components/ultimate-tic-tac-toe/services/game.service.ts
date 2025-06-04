import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, Move, Player, SmallBoard } from '../models/game.models';
import { AIOpponentService } from './ai-opponent.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState>({
    boards: Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({
        cells: Array(3).fill(null).map(() => Array(3).fill(null)),
        winner: null,
        isActive: true
      }))
    ),
    currentPlayer: 'X',
    activeBoard: null,
    gameStatus: 'playing',
    winner: null
  });

  private gameStateHistory: Array<GameState & { movePlayer?: Player, move?: Move }> = [];
  private computerMoveSubject = new BehaviorSubject<Move | null>(null);

  constructor(private aiOpponent: AIOpponentService) {}

  getGameState() {
    return this.gameState.asObservable();
  }

  getComputerMove() {
    return this.computerMoveSubject.asObservable();
  }

  getGameStateHistory() {
    return this.gameStateHistory;
  }

  makeMove(move: Move) {
    const currentState = this.gameState.value;
    console.log('[GameService] Attempting move:', move, 'Current player:', currentState.currentPlayer, 'Game status:', currentState.gameStatus);
    
    // Validate move
    if (!this.isValidMove(currentState, move)) {
      console.log('[GameService] Invalid move:', move);
      return;
    }

    // Make the move
    const newState = this.applyMove(currentState, move);
    console.log('[GameService] Move applied. New state:', newState);
    
    // Check for board winner
    this.checkBoardWinner(newState, move.boardRow, move.boardCol);
    
    // Check for game winner
    this.checkGameWinner(newState);
    
    // Update game state
    this.gameState.next(newState);
    console.log('[GameService] Game state updated. Current player:', newState.currentPlayer, 'Game status:', newState.gameStatus, 'Winner:', newState.winner);
    console.log('[GameService] activeBoard:', newState.activeBoard);
    console.log('[GameService] Board winners:');
    for (let r = 0; r < 3; r++) {
      let rowWinners = [];
      for (let c = 0; c < 3; c++) {
        rowWinners.push(newState.boards[r][c].winner || '-');
      }
      console.log(`[GameService] Row ${r}:`, rowWinners.join(' '));
    }

    // Push a deep copy of the state *before* switching player, with move info
    const historyEntry = this.deepCopyGameState({
      ...newState,
      currentPlayer: currentState.currentPlayer, // the player who made the move
      movePlayer: currentState.currentPlayer,
      move: move
    });
    this.gameStateHistory.push(historyEntry);

    // If it's O's turn (AI), make the AI move
    if (newState.currentPlayer === 'O' && newState.gameStatus === 'playing') {
      const delay = Math.random() * (1500 - 750) + 750; // Random delay between 750ms and 1500ms
      setTimeout(() => {
        console.log('[GameService] Calling AI for next move...');
        const aiMove = this.aiOpponent.getNextMove(newState);
        console.log('[GameService] AI selected move:', aiMove);
        // Emit the computer move before making it
        this.computerMoveSubject.next(aiMove);
        this.makeMove(aiMove);
      }, delay);
    }
  }

  resetGame() {
    this.gameState.next({
      boards: Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => ({
          cells: Array(3).fill(null).map(() => Array(3).fill(null)),
          winner: null,
          isActive: true
        }))
      ),
      currentPlayer: 'X',
      activeBoard: null,
      gameStatus: 'playing',
      winner: null
    });
    this.computerMoveSubject.next(null);
    this.gameStateHistory = [];
  }

  private isValidMove(state: GameState, move: Move): boolean {
    // Check if the game is still playing
    if (state.gameStatus !== 'playing') {
      console.log('[isValidMove] Game is not playing:', state.gameStatus);
      return false;
    }

    // Check if it's the correct player's turn
    if (state.currentPlayer !== 'X' && state.currentPlayer !== 'O') {
      console.log('[isValidMove] Invalid currentPlayer:', state.currentPlayer);
      return false;
    }

    // Check if the board is already won
    if (state.boards[move.boardRow][move.boardCol].winner) {
      console.log('[isValidMove] Board already won:', move.boardRow, move.boardCol);
      return false;
    }

    // Check if the cell is empty
    if (state.boards[move.boardRow][move.boardCol].cells[move.cellRow][move.cellCol] !== null) {
      console.log('[isValidMove] Cell not empty:', move);
      return false;
    }

    // Check if the board is active (only if there is an active board)
    if (state.activeBoard) {
      const activeBoard = state.boards[state.activeBoard.row][state.activeBoard.col];
      // If the active board is won, we can play anywhere
      if (!activeBoard.winner && (move.boardRow !== state.activeBoard.row || move.boardCol !== state.activeBoard.col)) {
        console.log('[isValidMove] Move not in active board:', move, 'Active board:', state.activeBoard);
        return false;
      }
    }

    return true;
  }

  private applyMove(state: GameState, move: Move): GameState {
    const newState = { ...state };
    newState.boards = state.boards.map(boardRow => 
      boardRow.map(board => ({ ...board }))
    );
    
    // Make the move
    newState.boards[move.boardRow][move.boardCol].cells[move.cellRow][move.cellCol] = state.currentPlayer;
    
    // Switch players
    newState.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
    
    // Set the next active board
    const nextBoard = state.boards[move.cellRow][move.cellCol];
    const isFull = nextBoard.cells.every(row => row.every(cell => cell !== null));
    newState.activeBoard = (nextBoard.winner || nextBoard.winner === 'draw' || isFull) ? null : { row: move.cellRow, col: move.cellCol };
    
    return newState;
  }

  private checkBoardWinner(state: GameState, boardRow: number, boardCol: number) {
    const board = state.boards[boardRow][boardCol];
    const cells = board.cells;

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (cells[i][0] && cells[i][0] === cells[i][1] && cells[i][1] === cells[i][2]) {
        board.winner = cells[i][0];
        console.log(`[GameService] Board (${boardRow},${boardCol}) won by:`, cells[i][0]);
        return;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (cells[0][i] && cells[0][i] === cells[1][i] && cells[1][i] === cells[2][i]) {
        board.winner = cells[0][i];
        console.log(`[GameService] Board (${boardRow},${boardCol}) won by:`, cells[0][i]);
        return;
      }
    }

    // Check diagonals
    if (cells[0][0] && cells[0][0] === cells[1][1] && cells[1][1] === cells[2][2]) {
      board.winner = cells[0][0];
      console.log(`[GameService] Board (${boardRow},${boardCol}) won by:`, cells[0][0]);
      return;
    }
    if (cells[0][2] && cells[0][2] === cells[1][1] && cells[1][1] === cells[2][0]) {
      board.winner = cells[0][2];
      console.log(`[GameService] Board (${boardRow},${boardCol}) won by:`, cells[0][2]);
      return;
    }

    // Check for draw
    if (cells.every(row => row.every(cell => cell !== null))) {
      board.winner = 'draw';
    }
  }

  private checkGameWinner(state: GameState) {
    const boards = state.boards;

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (boards[i][0].winner && 
          boards[i][0].winner !== 'draw' &&
          boards[i][0].winner === boards[i][1].winner && 
          boards[i][1].winner === boards[i][2].winner) {
        state.gameStatus = 'won';
        state.winner = boards[i][0].winner;
        console.log(`[GameService] GAME WON by:`, boards[i][0].winner);
        return;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (boards[0][i].winner && 
          boards[0][i].winner !== 'draw' &&
          boards[0][i].winner === boards[1][i].winner && 
          boards[1][i].winner === boards[2][i].winner) {
        state.gameStatus = 'won';
        state.winner = boards[0][i].winner;
        console.log(`[GameService] GAME WON by:`, boards[0][i].winner);
        return;
      }
    }

    // Check diagonals
    if (boards[0][0].winner && 
        boards[0][0].winner !== 'draw' &&
        boards[0][0].winner === boards[1][1].winner && 
        boards[1][1].winner === boards[2][2].winner) {
      state.gameStatus = 'won';
      state.winner = boards[0][0].winner;
      console.log(`[GameService] GAME WON by:`, boards[0][0].winner);
      return;
    }
    if (boards[0][2].winner && 
        boards[0][2].winner !== 'draw' &&
        boards[0][2].winner === boards[1][1].winner && 
        boards[1][1].winner === boards[2][0].winner) {
      state.gameStatus = 'won';
      state.winner = boards[0][2].winner;
      console.log(`[GameService] GAME WON by:`, boards[0][2].winner);
      return;
    }

    // Check for draw - only if all boards are won or drawn
    if (boards.every(row => row.every(board => board.winner)) && !state.winner) {
      state.gameStatus = 'draw';
    }
  }

  private deepCopyGameState(state: GameState & { movePlayer?: Player, move?: Move }): GameState & { movePlayer?: Player, move?: Move } {
    return {
      boards: state.boards.map(row => row.map(board => ({
        ...board,
        cells: board.cells.map(cellRow => [...cellRow])
      }))),
      currentPlayer: state.currentPlayer,
      activeBoard: state.activeBoard ? { ...state.activeBoard } : null,
      gameStatus: state.gameStatus,
      winner: state.winner,
      movePlayer: state.movePlayer,
      move: state.move
    };
  }

  undoLastTurn() {
    // Do nothing if the game is not in progress
    if (this.gameState.value.gameStatus !== 'playing') {
      return;
    }
    // Remove the last two moves (player and opponent)
    if (this.gameStateHistory.length >= 2) {
      this.gameStateHistory.pop();
      this.gameStateHistory.pop();
      const prevState: GameState = this.gameStateHistory.length > 0
        ? this.deepCopyGameState(this.gameStateHistory[this.gameStateHistory.length - 1]) as GameState
        : {
            boards: Array(3).fill(null).map(() => 
              Array(3).fill(null).map(() => ({
                cells: Array(3).fill(null).map(() => Array(3).fill(null)),
                winner: null,
                isActive: true
              }))
            ),
            currentPlayer: 'X' as Player,
            activeBoard: null,
            gameStatus: 'playing',
            winner: null
          };
      prevState.currentPlayer = 'X';
      this.gameState.next(prevState);
    } else {
      // If less than 2 moves, just reset
      this.resetGame();
    }
  }
} 