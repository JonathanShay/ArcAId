import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameState, Move, Player } from './models/game.models';

@Component({
  selector: 'app-checkers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-header">
        <h2>Checkers</h2>
        <div class="game-status">
          <div class="current-player" [class.active]="true">
            Current Player: {{ gameState.currentPlayer === 'B' ? 'Black' : 'White' }}
          </div>
          <div class="score">
            <span class="black">Black: {{ gameState.score.black }}</span>
            <span class="white">White: {{ gameState.score.white }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button (click)="toggleHistory()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
            <span>{{ isHistoryVisible ? 'Hide' : 'Show' }} History</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path *ngIf="isHistoryVisible" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              <path *ngIf="!isHistoryVisible" fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button (click)="toggleComputerPlayer()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
            <span>{{ isComputerPlayer ? 'Disable' : 'Enable' }} Computer</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clip-rule="evenodd" />
            </svg>
          </button>
          <button (click)="resetGame()" 
                  class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
            New Game
          </button>
        </div>
      </div>

      <div class="game-flex-container" [class.history-hidden]="!isHistoryVisible">
        <div class="game-container" [class.expanded]="!isHistoryVisible">
          <div class="board" [class.game-over]="gameState.gameStatus === 'won'">
            <div class="board-row" *ngFor="let row of gameState.board; let rowIndex = index">
              <div class="cell" 
                   *ngFor="let cell of row; let colIndex = index"
                   [class.valid-move]="isValidMove(rowIndex, colIndex)"
                   [class.selected]="selectedCell?.row === rowIndex && selectedCell?.col === colIndex"
                   (click)="handleCellClick(rowIndex, colIndex)">
                <div class="piece" 
                     *ngIf="cell"
                     [class.black]="cell.player === 'B'"
                     [class.white]="cell.player === 'W'"
                     [class.king]="cell.type === 'king'"
                     [class.flashing]="flashingPiece?.row === rowIndex && flashingPiece?.col === colIndex">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="history-panel" [class.slide-out]="!isHistoryVisible">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold">Game History</h2>
            <div class="flex items-center">
              <button (click)="copyGameHistory()" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Copy History
              </button>
              <span *ngIf="copyMessage" class="ml-3 text-green-600 dark:text-green-400 font-semibold">{{ copyMessage }}</span>
            </div>
          </div>
          <div class="history-list">
            <div *ngFor="let entry of gameHistory; let i = index" 
                 class="history-entry"
                 (mouseenter)="onHistoryHover(entry.move || undefined)"
                 (mouseleave)="onHistoryHover(undefined)">
              <div class="font-mono text-xs text-gray-700 dark:text-gray-200">Move #{{ i + 1 }}</div>
              <div class="text-xs">Player: <span class="font-bold">{{ entry.move?.player === 'B' ? 'Black' : 'White' }}</span></div>
              <div class="text-xs" *ngIf="entry.move">Move: <span class="font-mono">({{ entry.move.fromRow }},{{ entry.move.fromCol }}) → ({{ entry.move.toRow }},{{ entry.move.toCol }})</span></div>
              <div class="text-xs" *ngIf="entry.move && entry.move.capturedPieces?.length">Captures: <span class="font-mono">{{ entry.move.capturedPieces?.length }}</span></div>
              <div class="text-xs">Game Status: <span class="font-mono">{{ entry.state.gameStatus }}</span></div>
              <div class="text-xs">Winner: <span class="font-mono">{{ entry.state.winner ? (entry.state.winner === 'B' ? 'Black' : 'White') : '-' }}</span></div>
              <div class="text-xs mt-1">Score: <span class="font-mono">B:{{ entry.state.score.black }} W:{{ entry.state.score.white }}</span></div>
              <hr class="my-2 border-gray-300 dark:border-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div class="game-message" *ngIf="gameState.gameStatus === 'won'">
        <h3>Game Over!</h3>
        <p>{{ gameState.winner === 'B' ? 'Black' : 'White' }} wins!</p>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .game-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      color: #fff;
    }

    .game-status {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .current-player {
      font-size: 1.2rem;
      font-weight: bold;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
    }

    .score {
      display: flex;
      gap: 1rem;
    }

    .score span {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-weight: bold;
    }

    .score .black {
      background: #333;
      color: #fff;
    }

    .score .white {
      background: #fff;
      color: #333;
    }

    .game-flex-container {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      transition: all 0.3s ease-in-out;
      width: 100%;
    }

    .game-container {
      min-width: 0;
      flex: 1 1 0%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease-in-out;
      padding: 0.5rem;
    }

    .game-container.expanded {
      max-width: 100%;
    }

    .board {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      gap: 2px;
      background: #666;
      padding: 2px;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }

    .board-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 2px;
    }

    .cell {
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f0d9b5;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .cell:nth-child(odd) {
      background: #b58863;
    }

    .board-row:nth-child(even) .cell:nth-child(even) {
      background: #b58863;
    }

    .board-row:nth-child(even) .cell:nth-child(odd) {
      background: #f0d9b5;
    }

    .cell.valid-move {
      background: rgba(74, 144, 226, 0.3);
    }

    .cell.selected {
      background: rgba(74, 144, 226, 0.5);
    }

    .piece {
      width: 80%;
      height: 80%;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .piece.black {
      background: #333;
    }

    .piece.white {
      background: #c41e3a;
    }

    .piece.king::after {
      content: '♔';
      position: absolute;
      font-size: 1.5rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .piece.king.black::after {
      color: rgba(255, 255, 255, 0.8);
    }

    .piece.king.white::after {
      color: rgba(255, 255, 255, 0.8);
    }

    .game-message {
      margin-top: 2rem;
      text-align: center;
      color: #fff;
    }

    .game-message h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .game-message p {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .board.game-over {
      opacity: 0.7;
      pointer-events: none;
    }

    .history-panel {
      width: 320px;
      max-width: 100vw;
      background: rgba(243,244,246,0.7);
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      padding: 1rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 480px;
      transition: all 0.3s ease-in-out;
      transform: translateX(0);
    }

    .history-panel.slide-out {
      transform: translateX(100%);
      width: 0;
      padding: 0;
      margin: 0;
      opacity: 0;
    }

    .history-list {
      overflow-y: auto;
      flex: 1 1 0%;
      min-height: 0;
    }

    .history-entry {
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .history-entry:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 900px) {
      .game-flex-container {
        flex-direction: column;
      }
      .history-panel {
        width: 100%;
        max-width: 100vw;
        margin-top: 2rem;
        max-height: 200px;
      }
      .history-panel.slide-out {
        transform: translateY(100%);
        height: 0;
      }
    }

    @media (max-width: 500px) {
      .game-container {
        padding: 0.25rem;
      }
      .board {
        max-width: 100%;
      }
    }

    .piece.flashing {
      animation: flash 0.5s ease-in-out 4;
    }

    @keyframes flash {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
  `]
})
export class CheckersComponent implements OnInit {
  gameState: GameState;
  selectedCell: { row: number; col: number } | null = null;
  isHistoryVisible: boolean = true;
  isComputerPlayer: boolean = false;
  copyMessage: string = '';
  hoveredMove: Move | null = null;
  gameHistory: { state: GameState; move: Move | null }[] = [];
  flashingPiece: { row: number; col: number } | null = null;
  private flashTimeout: any;

  constructor(public gameService: GameService) {
    this.gameState = this.gameService.getInitialState();
    this.isComputerPlayer = this.gameService.isComputerEnabled();
  }

  ngOnInit(): void {
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
      this.selectedCell = null;
    });
    this.gameService.getGameStateHistory().subscribe(history => {
      this.gameHistory = history;
    });
  }

  handleCellClick(row: number, col: number): void {
    if (this.gameState.gameStatus !== 'playing') return;

    const cell = this.gameState.board[row][col];
    
    // If a cell is already selected
    if (this.selectedCell) {
      // If clicking the same cell, deselect it
      if (this.selectedCell.row === row && this.selectedCell.col === col) {
        this.selectedCell = null;
        return;
      }

      // If clicking a valid move cell, make the move
      if (this.isValidMove(row, col)) {
        const move: Move = {
          fromRow: this.selectedCell.row,
          fromCol: this.selectedCell.col,
          toRow: row,
          toCol: col,
          player: this.gameState.currentPlayer
        };

        // Clear any flashing animation when making a valid move
        if (this.flashTimeout) {
          clearTimeout(this.flashTimeout);
          this.flashingPiece = null;
        }

        this.gameService.makeMove(move);
        this.selectedCell = null;
      }
    } 
    // If no cell is selected and clicked cell has a piece of current player
    else if (cell && cell.player === this.gameState.currentPlayer) {
      // Only select if the piece has valid moves
      const hasValidMoves = this.gameState.validMoves.some(move => 
        move.fromRow === row && move.fromCol === col
      );
      
      if (hasValidMoves) {
        this.selectedCell = { row, col };
        // Clear any flashing animation when selecting a valid piece
        if (this.flashTimeout) {
          clearTimeout(this.flashTimeout);
          this.flashingPiece = null;
        }
      } else {
        // If there are forced jumps available, flash the piece that can jump
        const forcedJumpMoves = this.gameState.validMoves.filter(move => move.capturedPieces && move.capturedPieces.length > 0);
        if (forcedJumpMoves.length > 0) {
          const jumpPiece = forcedJumpMoves[0];
          this.flashPiece(jumpPiece.fromRow, jumpPiece.fromCol);
        }
      }
    }
  }

  isValidMove(row: number, col: number): boolean {
    if (!this.selectedCell) return false;

    return this.gameState.validMoves.some(move => 
      move.fromRow === this.selectedCell!.row && 
      move.fromCol === this.selectedCell!.col && 
      move.toRow === row && 
      move.toCol === col
    );
  }

  resetGame(): void {
    this.gameService.resetGame();
  }

  toggleHistory(): void {
    this.isHistoryVisible = !this.isHistoryVisible;
  }

  toggleComputerPlayer(): void {
    this.isComputerPlayer = !this.isComputerPlayer;
    this.gameService.setComputerPlayer(this.isComputerPlayer);
  }

  onHistoryHover(move: Move | undefined): void {
    this.hoveredMove = move || null;
  }

  copyGameHistory(): void {
    const history = this.gameHistory;
    if (!history.length) return;
    const lines = history.map((entry, i) => {
      const move = entry.move ? `Move: (${entry.move.fromRow},${entry.move.fromCol}) → (${entry.move.toRow},${entry.move.toCol})` : '';
      const captures = entry.move?.capturedPieces?.length ? `Captures: ${entry.move.capturedPieces.length}` : '';
      return [
        `Move #${i + 1}`,
        `Player: ${entry.move?.player === 'B' ? 'Black' : 'White'}`,
        move,
        captures,
        `Game Status: ${entry.state.gameStatus}`,
        `Winner: ${entry.state.winner ? (entry.state.winner === 'B' ? 'Black' : 'White') : '-'}`,
        `Score: B:${entry.state.score.black} W:${entry.state.score.white}`,
        ''
      ].filter(Boolean).join('\n');
    });
    const text = 'Game History\n' + lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.copyMessage = 'Copied!';
      setTimeout(() => this.copyMessage = '', 1500);
    });
  }

  private flashPiece(row: number, col: number): void {
    // Clear any existing flash timeout
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }

    // Set the flashing piece
    this.flashingPiece = { row, col };

    // Clear the flash after 2 seconds
    this.flashTimeout = setTimeout(() => {
      this.flashingPiece = null;
    }, 2000);
  }
}
