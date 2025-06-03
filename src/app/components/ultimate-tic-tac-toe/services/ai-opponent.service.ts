import { Injectable } from '@angular/core';
import { GameState, Move, SmallBoard } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class AIOpponentService {
  constructor() {}

  getNextMove(gameState: GameState): Move {
    // If no active board is specified, we can choose any board
    if (!gameState.activeBoard) {
      return this.findBestMove(gameState);
    }

    // If there is an active board, we must play in that board
    const { row: boardRow, col: boardCol } = gameState.activeBoard;
    const board = gameState.boards[boardRow][boardCol];

    // If the active board is won, we can play anywhere
    if (board.winner) {
      return this.findBestMove(gameState);
    }

    // Find the best move within the active board
    const bestCell = this.findBestCellInBoard(board);
    return {
      boardRow,
      boardCol,
      cellRow: bestCell.row,
      cellCol: bestCell.col
    };
  }

  private findBestMove(gameState: GameState): Move {
    let bestScore = -Infinity;
    let bestMove: Move | null = null;

    // Try each board
    for (let boardRow = 0; boardRow < 3; boardRow++) {
      for (let boardCol = 0; boardCol < 3; boardCol++) {
        const board = gameState.boards[boardRow][boardCol];
        
        // Skip boards that are already won
        if (board.winner) continue;

        // Try each cell in the board
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            if (board.cells[cellRow][cellCol] === null) {
              const move: Move = { boardRow, boardCol, cellRow, cellCol };
              const score = this.evaluateMove(gameState, move);
              
              if (score > bestScore) {
                bestScore = score;
                bestMove = move;
              }
            }
          }
        }
      }
    }

    // If no move was found in unwon boards, try won boards
    if (!bestMove) {
      for (let boardRow = 0; boardRow < 3; boardRow++) {
        for (let boardCol = 0; boardCol < 3; boardCol++) {
          const board = gameState.boards[boardRow][boardCol];
          for (let cellRow = 0; cellRow < 3; cellRow++) {
            for (let cellCol = 0; cellCol < 3; cellCol++) {
              if (board.cells[cellRow][cellCol] === null) {
                return { boardRow, boardCol, cellRow, cellCol };
              }
            }
          }
        }
      }
    }

    return bestMove!;
  }

  private findBestCellInBoard(board: SmallBoard): { row: number; col: number } {
    let bestScore = -Infinity;
    let bestCell = { row: 0, col: 0 };

    // Try each cell
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board.cells[row][col] === null) {
          const score = this.evaluateCell(board, row, col);
          if (score > bestScore) {
            bestScore = score;
            bestCell = { row, col };
          }
        }
      }
    }

    return bestCell;
  }

  private evaluateMove(gameState: GameState, move: Move): number {
    let score = 0;
    const board = gameState.boards[move.boardRow][move.boardCol];
    const nextBoard = gameState.boards[move.cellRow][move.cellCol];

    // Prefer moves that don't send opponent to a won board
    if (nextBoard.winner) {
      score -= 10;
    }

    // Prefer moves that send opponent to a board with fewer options
    const availableMoves = this.countAvailableMoves(nextBoard);
    score += (9 - availableMoves) * 2;

    // Prefer moves that complete a line in the current board
    if (this.wouldCompleteLine(board, move.cellRow, move.cellCol)) {
      score += 15;
    }

    // Prefer moves that block opponent's line
    if (this.wouldBlockLine(board, move.cellRow, move.cellCol)) {
      score += 12;
    }

    // Slightly prefer center and corner positions (reduced from 5 to 2)
    if (move.cellRow === 1 && move.cellCol === 1) {
      score += 2;
    } else if ((move.cellRow === 0 || move.cellRow === 2) && 
               (move.cellCol === 0 || move.cellCol === 2)) {
      score += 1;
    }

    // Prefer moves that help win the game
    if (this.wouldHelpWinGame(gameState, move)) {
      score += 20;
    }

    // Prefer moves that block opponent from winning the game
    if (this.wouldBlockGameWin(gameState, move)) {
      score += 18;
    }

    return score;
  }

  private evaluateCell(board: SmallBoard, row: number, col: number): number {
    let score = 0;

    // Slightly prefer center position (reduced from 5 to 2)
    if (row === 1 && col === 1) {
      score += 2;
    }
    // Slightly prefer corners (reduced from 3 to 1)
    else if ((row === 0 || row === 2) && (col === 0 || col === 2)) {
      score += 1;
    }

    // Check if this move would complete a line
    if (this.wouldCompleteLine(board, row, col)) {
      score += 15;
    }

    // Check if this move would block opponent's line
    if (this.wouldBlockLine(board, row, col)) {
      score += 12;
    }

    return score;
  }

  private wouldCompleteLine(board: SmallBoard, row: number, col: number): boolean {
    // Check row
    const rowCount = board.cells[row].filter(cell => cell === 'O').length;
    if (rowCount === 2) return true;

    // Check column
    const colCount = board.cells.map(r => r[col]).filter(cell => cell === 'O').length;
    if (colCount === 2) return true;

    // Check diagonals
    if (row === col) {
      const diag1Count = [board.cells[0][0], board.cells[1][1], board.cells[2][2]]
        .filter(cell => cell === 'O').length;
      if (diag1Count === 2) return true;
    }
    if (row + col === 2) {
      const diag2Count = [board.cells[0][2], board.cells[1][1], board.cells[2][0]]
        .filter(cell => cell === 'O').length;
      if (diag2Count === 2) return true;
    }

    return false;
  }

  private wouldBlockLine(board: SmallBoard, row: number, col: number): boolean {
    // Check row
    const rowCount = board.cells[row].filter(cell => cell === 'X').length;
    if (rowCount === 2) return true;

    // Check column
    const colCount = board.cells.map(r => r[col]).filter(cell => cell === 'X').length;
    if (colCount === 2) return true;

    // Check diagonals
    if (row === col) {
      const diag1Count = [board.cells[0][0], board.cells[1][1], board.cells[2][2]]
        .filter(cell => cell === 'X').length;
      if (diag1Count === 2) return true;
    }
    if (row + col === 2) {
      const diag2Count = [board.cells[0][2], board.cells[1][1], board.cells[2][0]]
        .filter(cell => cell === 'X').length;
      if (diag2Count === 2) return true;
    }

    return false;
  }

  private countAvailableMoves(board: SmallBoard): number {
    return board.cells.flat().filter(cell => cell === null).length;
  }

  private wouldHelpWinGame(gameState: GameState, move: Move): boolean {
    // Create a deep copy of the game state
    const newState = { ...gameState };
    newState.boards = gameState.boards.map(boardRow => 
      boardRow.map(board => ({
        ...board,
        cells: board.cells.map(row => [...row])
      }))
    );
    
    // Make the move
    newState.boards[move.boardRow][move.boardCol].cells[move.cellRow][move.cellCol] = 'O';
    
    // Check if this move would complete a line of O's in the big board
    return this.checkForWinningLine(newState.boards, 'O');
  }

  private wouldBlockGameWin(gameState: GameState, move: Move): boolean {
    // Create a deep copy of the game state
    const newState = { ...gameState };
    newState.boards = gameState.boards.map(boardRow => 
      boardRow.map(board => ({
        ...board,
        cells: board.cells.map(row => [...row])
      }))
    );
    
    // Make the move
    newState.boards[move.boardRow][move.boardCol].cells[move.cellRow][move.cellCol] = 'X';
    
    // Check if this move would complete a line of X's in the big board
    return this.checkForWinningLine(newState.boards, 'X');
  }

  private checkForWinningLine(boards: SmallBoard[][], player: 'X' | 'O'): boolean {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (boards[i][0].winner === player && 
          boards[i][1].winner === player && 
          boards[i][2].winner === player) {
        return true;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (boards[0][i].winner === player && 
          boards[1][i].winner === player && 
          boards[2][i].winner === player) {
        return true;
      }
    }

    // Check diagonals
    if (boards[0][0].winner === player && 
        boards[1][1].winner === player && 
        boards[2][2].winner === player) {
      return true;
    }
    if (boards[0][2].winner === player && 
        boards[1][1].winner === player && 
        boards[2][0].winner === player) {
      return true;
    }

    return false;
  }
} 