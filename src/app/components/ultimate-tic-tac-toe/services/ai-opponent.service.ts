import { Injectable } from '@angular/core';
import { GameState, Move, SmallBoard } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class AIOpponentService {
  constructor() {}

  getNextMove(gameState: GameState): Move {
    console.log('[AIOpponentService] getNextMove called. Current player:', gameState.currentPlayer, 'Active board:', gameState.activeBoard, 'Game status:', gameState.gameStatus);
    
    // If no active board is specified, we can choose any board
    if (!gameState.activeBoard) {
      console.log('[AIOpponentService] No active board specified, finding best move across all boards');
      const move = this.findBestMove(gameState);
      console.log('[AIOpponentService] No active board. Chose move:', move);
      return move;
    }

    // If there is an active board, we must play in that board
    const { row: boardRow, col: boardCol } = gameState.activeBoard;
    const board = gameState.boards[boardRow][boardCol];
    console.log('[AIOpponentService] Active board state:', {
      position: { row: boardRow, col: boardCol },
      winner: board.winner,
      cells: board.cells
    });

    // If the active board is won, we can play anywhere
    if (board.winner) {
      console.log('[AIOpponentService] Active board is won, finding best move across all boards');
      const move = this.findBestMove(gameState);
      console.log('[AIOpponentService] Active board is won. Chose move:', move);
      return move;
    }

    // Find the best move within the active board
    console.log('[AIOpponentService] Finding best move within active board');
    const bestCell = this.findBestCellInBoard(board);
    const move = {
      boardRow,
      boardCol,
      cellRow: bestCell.row,
      cellCol: bestCell.col
    };
    console.log('[AIOpponentService] Chose move in active board:', move);
    return move;
  }

  private findBestMove(gameState: GameState): Move {
    console.log('[AIOpponentService] findBestMove called');
    let bestScore = -Infinity;
    let bestMoves: Move[] = [];

    // Try each board
    for (let boardRow = 0; boardRow < 3; boardRow++) {
      for (let boardCol = 0; boardCol < 3; boardCol++) {
        const board = gameState.boards[boardRow][boardCol];
        // Skip boards that are already won
        if (board.winner) {
          console.log(`[AIOpponentService] Skipping won board at (${boardRow},${boardCol})`);
          continue;
        }
        // Try each cell in the board
        for (let cellRow = 0; cellRow < 3; cellRow++) {
          for (let cellCol = 0; cellCol < 3; cellCol++) {
            if (board.cells[cellRow][cellCol] === null) {
              const move: Move = { boardRow, boardCol, cellRow, cellCol };
              const score = this.evaluateMove(gameState, move);
              console.log(`[AIOpponentService] Move (${boardRow},${boardCol})->(${cellRow},${cellCol}) scored:`, score);
              if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
              } else if (score === bestScore) {
                bestMoves.push(move);
              }
            }
          }
        }
      }
    }

    // If no move was found in unwon boards, try won boards
    if (bestMoves.length === 0) {
      console.log('[AIOpponentService] No moves found in unwon boards, searching won boards');
      let allAvailableMoves: Move[] = [];
      for (let boardRow = 0; boardRow < 3; boardRow++) {
        for (let boardCol = 0; boardCol < 3; boardCol++) {
          const board = gameState.boards[boardRow][boardCol];
          for (let cellRow = 0; cellRow < 3; cellRow++) {
            for (let cellCol = 0; cellCol < 3; cellCol++) {
              if (board.cells[cellRow][cellCol] === null) {
                allAvailableMoves.push({ boardRow, boardCol, cellRow, cellCol });
              }
            }
          }
        }
      }
      if (allAvailableMoves.length > 0) {
        const move = allAvailableMoves[Math.floor(Math.random() * allAvailableMoves.length)];
        console.log('[AIOpponentService] Found move in won board:', move);
        return move;
      }
    }

    // Add some randomization to the move selection
    // 20% chance to pick a random move from the top 3 best moves
    if (Math.random() < 0.2 && bestMoves.length > 1) {
      const topMoves = bestMoves.slice(0, Math.min(3, bestMoves.length));
      const move = topMoves[Math.floor(Math.random() * topMoves.length)];
      console.log('[AIOpponentService] Randomly selected from top moves:', move);
      return move;
    }

    // Otherwise pick randomly among the best moves
    const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    console.log('[AIOpponentService] Selected from best moves:', move);
    return move;
  }

  private findBestCellInBoard(board: SmallBoard): { row: number; col: number } {
    console.log('[AIOpponentService] findBestCellInBoard called');
    let bestScore = -Infinity;
    let bestCells: { row: number; col: number }[] = [];

    // Try each cell
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board.cells[row][col] === null) {
          const score = this.evaluateCell(board, row, col);
          console.log(`[AIOpponentService] Cell (${row},${col}) scored:`, score);
          if (score > bestScore) {
            bestScore = score;
            bestCells = [{ row, col }];
          } else if (score === bestScore) {
            bestCells.push({ row, col });
          }
        }
      }
    }

    // Pick randomly among the best cells
    const cell = bestCells[Math.floor(Math.random() * bestCells.length)];
    console.log('[AIOpponentService] Selected cell:', cell);
    return cell;
  }

  private evaluateMove(gameState: GameState, move: Move): number {
    let score = 0;
    const board = gameState.boards[move.boardRow][move.boardCol];
    const nextBoard = gameState.boards[move.cellRow][move.cellCol];

    // Prefer moves that don't send opponent to a won board (negative bonus)
    if (nextBoard.winner) {
      score += 8; // Positive bonus: send opponent to a won/drawn board
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

    // Prefer moves that help win the game
    if (this.wouldHelpWinGame(gameState, move)) {
      score += 20;
    }

    // Prefer moves that block opponent from winning the game
    if (this.wouldBlockGameWin(gameState, move)) {
      score += 18;
    }

    // Add some randomness to the score to make the AI less predictable
    score += Math.random() * 5;

    return score;
  }

  private evaluateCell(board: SmallBoard, row: number, col: number): number {
    let score = 0;

    // Check if this move would complete a line
    if (this.wouldCompleteLine(board, row, col)) {
      score += 15;
    }

    // Check if this move would block opponent's line
    if (this.wouldBlockLine(board, row, col)) {
      score += 12;
    }

    // Add some randomness to make the AI less predictable
    score += Math.random() * 3;

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