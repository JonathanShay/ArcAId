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

  constructor(private aiOpponent: AIOpponentService) {}

  getGameState() {
    return this.gameState.asObservable();
  }

  makeMove(move: Move) {
    const currentState = this.gameState.value;
    
    // Validate move
    if (!this.isValidMove(currentState, move)) {
      return;
    }

    // Make the move
    const newState = this.applyMove(currentState, move);
    
    // Check for board winner
    this.checkBoardWinner(newState, move.boardRow, move.boardCol);
    
    // Check for game winner
    this.checkGameWinner(newState);
    
    // Update game state
    this.gameState.next(newState);

    // If it's O's turn (AI), make the AI move
    if (newState.currentPlayer === 'O' && newState.gameStatus === 'playing') {
      setTimeout(() => {
        const aiMove = this.aiOpponent.getNextMove(newState);
        this.makeMove(aiMove);
      }, 500); // Add a small delay to make the AI feel more natural
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
  }

  private isValidMove(state: GameState, move: Move): boolean {
    // Check if the game is still playing
    if (state.gameStatus !== 'playing') {
      return false;
    }

    // Check if it's the correct player's turn
    if (state.currentPlayer !== 'X' && state.currentPlayer !== 'O') {
      return false;
    }

    // Check if the board is active
    if (state.activeBoard) {
      if (move.boardRow !== state.activeBoard.row || move.boardCol !== state.activeBoard.col) {
        return false;
      }
    }

    // Check if the board is already won
    if (state.boards[move.boardRow][move.boardCol].winner) {
      return false;
    }

    // Check if the cell is empty
    return state.boards[move.boardRow][move.boardCol].cells[move.cellRow][move.cellCol] === null;
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
    newState.activeBoard = nextBoard.winner ? null : { row: move.cellRow, col: move.cellCol };
    
    return newState;
  }

  private checkBoardWinner(state: GameState, boardRow: number, boardCol: number) {
    const board = state.boards[boardRow][boardCol];
    const cells = board.cells;

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (cells[i][0] && cells[i][0] === cells[i][1] && cells[i][1] === cells[i][2]) {
        board.winner = cells[i][0];
        return;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (cells[0][i] && cells[0][i] === cells[1][i] && cells[1][i] === cells[2][i]) {
        board.winner = cells[0][i];
        return;
      }
    }

    // Check diagonals
    if (cells[0][0] && cells[0][0] === cells[1][1] && cells[1][1] === cells[2][2]) {
      board.winner = cells[0][0];
      return;
    }
    if (cells[0][2] && cells[0][2] === cells[1][1] && cells[1][1] === cells[2][0]) {
      board.winner = cells[0][2];
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
      return;
    }
    if (boards[0][2].winner && 
        boards[0][2].winner !== 'draw' &&
        boards[0][2].winner === boards[1][1].winner && 
        boards[1][1].winner === boards[2][0].winner) {
      state.gameStatus = 'won';
      state.winner = boards[0][2].winner;
      return;
    }

    // Check for draw - only if all boards are won or drawn
    if (boards.every(row => row.every(board => board.winner)) && !state.winner) {
      state.gameStatus = 'draw';
    }
  }
} 