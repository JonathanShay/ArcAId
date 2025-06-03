import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameState, Move, Player } from './models/game.models';
import { BoardPreviewComponent } from './components/board-preview.component';

@Component({
  selector: 'app-ultimate-tic-tac-toe',
  standalone: true,
  imports: [CommonModule, BoardPreviewComponent],
  template: `
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div class="relative rounded-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ultimate Tic-Tac-Toe</h1>
              <button (click)="resetGame()" 
                      class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">
                New Game
              </button>
            </div>
            
            <div class="game-status mb-6 text-center">
              <p *ngIf="gameState.gameStatus === 'playing'" class="text-lg text-gray-700 dark:text-gray-300">
                Current Player: <span class="font-bold" [class.text-indigo-600]="gameState.currentPlayer === 'X'" 
                                              [class.text-amber-500]="gameState.currentPlayer === 'O'">
                  {{ gameState.currentPlayer }}
                </span>
              </p>
              <p *ngIf="gameState.gameStatus === 'won'" class="text-2xl font-bold text-green-600 dark:text-green-400">
                Player {{ gameState.winner }} wins!
              </p>
              <p *ngIf="gameState.gameStatus === 'draw'" class="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Game ended in a draw!
              </p>
            </div>

            <div class="game-container">
              <div class="grid grid-cols-3 gap-4 w-full max-w-3xl mx-auto">
                <ng-container *ngFor="let boardRow of gameState.boards; let boardRowIndex = index">
                  <ng-container *ngFor="let board of boardRow; let boardColIndex = index">
                    <div class="relative border-2 rounded-lg aspect-square"
                         [ngClass]="{
                           'border-gray-300': !board.winner,
                           'dark:border-gray-600': !board.winner,
                           'border-indigo-600': board.winner === 'X',
                           'border-amber-500': board.winner === 'O',
                           'dark:border-indigo-400': board.winner === 'X',
                           'dark:border-amber-400': board.winner === 'O',
                           'bg-indigo-50': board.winner === 'X',
                           'bg-amber-50': board.winner === 'O',
                           'dark:bg-indigo-900/20': board.winner === 'X',
                           'dark:bg-amber-900/20': board.winner === 'O',
                           'board-won': gameState.gameStatus === 'won' && board.winner === gameState.winner
                         }">
                      
                      <!-- Small board grid -->
                      <div class="grid grid-cols-3 gap-1 h-full"
                           [ngClass]="{
                             'bg-indigo-50/50': isBoardActive(boardRowIndex, boardColIndex) && !board.winner,
                             'dark:bg-indigo-900/10': isBoardActive(boardRowIndex, boardColIndex) && !board.winner
                           }">
                        <ng-container *ngFor="let cellRow of board.cells; let cellRowIndex = index">
                          <ng-container *ngFor="let cell of cellRow; let cellColIndex = index">
                            <div class="relative aspect-square cell-wrapper">
                              <button class="w-full h-full flex items-center justify-center text-2xl font-bold rounded-md transition-colors duration-200"
                                      [ngClass]="{
                                        'bg-gray-100': !cell && !isBoardActive(boardRowIndex, boardColIndex),
                                        'bg-indigo-50': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'X',
                                        'bg-amber-50': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'O',
                                        'hover:bg-gray-200': !cell && !isBoardActive(boardRowIndex, boardColIndex),
                                        'hover:bg-indigo-100': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'X',
                                        'hover:bg-amber-100': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'O',
                                        'dark:bg-gray-700': !cell && !isBoardActive(boardRowIndex, boardColIndex),
                                        'dark:bg-indigo-900/20': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'X',
                                        'dark:bg-amber-900/20': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'O',
                                        'dark:hover:bg-gray-600': !cell && !isBoardActive(boardRowIndex, boardColIndex),
                                        'dark:hover:bg-indigo-800/30': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'X',
                                        'dark:hover:bg-amber-800/30': !cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.currentPlayer === 'O',
                                        'cursor-not-allowed': !isBoardActive(boardRowIndex, boardColIndex),
                                        'text-indigo-600': cell === 'X',
                                        'text-amber-500': cell === 'O'
                                      }"
                                      (click)="makeMove(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex)"
                                      (mouseenter)="debugHover(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex)"
                                      [disabled]="!isBoardActive(boardRowIndex, boardColIndex) || cell !== null">
                                {{ cell }}
                              </button>
                              <!-- Board preview on hover -->
                              <div *ngIf="!cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.gameStatus === 'playing'"
                                   class="preview-container">
                                <app-board-preview [board]="gameState.boards[cellRowIndex][cellColIndex]"></app-board-preview>
                              </div>
                            </div>
                          </ng-container>
                        </ng-container>
                      </div>
                    </div>
                  </ng-container>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .game-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 1rem;
    }

    .preview-container {
      position: absolute;
      inset: 0;
      z-index: 30;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      margin: 0;
      padding: 0;
    }

    .cell-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .cell-wrapper:hover .preview-container {
      opacity: 1;
    }

    @keyframes breathe {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    .board-won {
      animation: breathe 2s ease-in-out infinite;
      animation-delay: calc(var(--board-index) * 0.2s);
    }

    @media (max-width: 640px) {
      .game-container {
        padding: 0.5rem;
      }
    }
  `]
})
export class UltimateTicTacToeComponent implements OnInit {
  gameState: GameState;

  constructor(private gameService: GameService) {
    this.gameState = {
      boards: [],
      currentPlayer: 'X',
      activeBoard: null,
      gameStatus: 'playing',
      winner: null
    };
  }

  ngOnInit() {
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
    });
  }

  makeMove(boardRow: number, boardCol: number, cellRow: number, cellCol: number): void {
    this.gameService.makeMove({ boardRow, boardCol, cellRow, cellCol });
  }

  resetGame(): void {
    this.gameService.resetGame();
  }

  isBoardActive(boardRow: number, boardCol: number): boolean {
    if (this.gameState.gameStatus !== 'playing') return false;
    if (!this.gameState.activeBoard) return true;
    return this.gameState.activeBoard.row === boardRow && this.gameState.activeBoard.col === boardCol;
  }

  debugHover(boardRow: number, boardCol: number, cellRow: number, cellCol: number): void {
    console.log('Button hover:', { boardRow, boardCol, cellRow, cellCol });
  }

  debugPreview(boardRow: number, boardCol: number, cellRow: number, cellCol: number): void {
    console.log('Preview hover:', { boardRow, boardCol, cellRow, cellCol });
    const previewBoard = this.gameState.boards[cellRow][cellCol];
    console.log('Preview board:', {
      cells: previewBoard.cells.map(row => row.map(cell => cell)),
      winner: previewBoard.winner,
      isActive: previewBoard.isActive
    });
  }
} 