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
        <div class="scoreboard flex justify-center gap-8 mb-6 items-center">
          <div class="score-x flex items-center gap-2">
            <span class="text-indigo-600 dark:text-white font-bold text-xl">You (X):</span>
            <span class="text-2xl font-mono text-indigo-600 dark:text-indigo-200">{{ scoreX }}</span>
          </div>
          <div class="score-o flex items-center gap-2">
            <span class="text-amber-500 dark:text-white font-bold text-xl">Opponent (O):</span>
            <span class="text-2xl font-mono text-amber-500 dark:text-amber-200">{{ scoreO }}</span>
          </div>
          <div class="score-draw flex items-center gap-2">
            <span class="text-gray-500 dark:text-white font-bold text-xl">Draws:</span>
            <span class="text-2xl font-mono text-gray-500 dark:text-gray-300">{{ scoreDraw }}</span>
          </div>
          <button (click)="resetScores()" class="ml-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-semibold">Reset</button>
        </div>
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div class="relative rounded-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ultimate Tic-Tac-Toe</h1>
              <div class="flex gap-2">
                <button (click)="toggleHistory()" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2">
                  <span>{{ isHistoryVisible ? 'Hide' : 'Show' }} History</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path *ngIf="isHistoryVisible" fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    <path *ngIf="!isHistoryVisible" fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button (click)="undo()"
                        [disabled]="gameService.getGameStateHistory().length < 2 || gameState.gameStatus !== 'playing'"
                        class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l-4-4m0 0l4-4m-4 4h16" /></svg>
                  Undo
                </button>
                <button (click)="resetGame()" 
                        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">
                  New Game
                </button>
              </div>
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

            <div class="game-flex-container" [class.history-hidden]="!isHistoryVisible">
              <div class="game-container" [class.expanded]="!isHistoryVisible">
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
                             'board-won': isWinningBoard(boardRowIndex, boardColIndex)
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
                                          'text-amber-500': cell === 'O',
                                          'computer-move': isComputerMove(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex),
                                          'history-hover-x': isHoveredMove(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex) && hoveredMove?.player === 'X',
                                          'history-hover-o': isHoveredMove(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex) && hoveredMove?.player === 'O'
                                        }"
                                        (click)="makeMove(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex)"
                                        (mouseenter)="debugHover(boardRowIndex, boardColIndex, cellRowIndex, cellColIndex)"
                                        [disabled]="!isBoardActive(boardRowIndex, boardColIndex) || cell !== null">
                                  {{ cell }}
                                </button>
                                <!-- Board preview on hover -->
                                <div *ngIf="!cell && isBoardActive(boardRowIndex, boardColIndex) && gameState.gameStatus === 'playing'"
                                     class="preview-container">
                                  <app-board-preview [board]="gameState.boards[cellRowIndex][cellColIndex]" [winner]="gameState.boards[cellRowIndex][cellColIndex].winner"></app-board-preview>
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
              <div class="history-panel" [class.slide-out]="!isHistoryVisible">
                <div class="flex items-center justify-between mb-2">
                  <h2 class="text-lg font-semibold">Game History</h2>
                  <div class="flex items-center">
                    <button (click)="copyGameHistory()" class="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-semibold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Copy History
                    </button>
                    <span *ngIf="copyMessage" class="ml-3 text-green-600 dark:text-green-400 font-semibold">{{ copyMessage }}</span>
                  </div>
                </div>
                <div class="history-list">
                  <div *ngFor="let entry of gameService.getGameStateHistory(); let i = index" 
                       class="history-entry"
                       (mouseenter)="onHistoryHover(entry.move, entry.movePlayer)"
                       (mouseleave)="onHistoryHover(undefined, undefined)">
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-200">Move #{{ i + 1 }}</div>
                    <div class="text-xs">Player: <span class="font-bold">{{ entry.movePlayer }}</span></div>
                    <div class="text-xs" *ngIf="entry.move">Move: <span class="font-mono">({{ entry.move.boardRow }},{{ entry.move.boardCol }}) → ({{ entry.move.cellRow }},{{ entry.move.cellCol }})</span></div>
                    <div class="text-xs">Active Board: <span class="font-mono">{{ entry.activeBoard ? '(' + entry.activeBoard.row + ',' + entry.activeBoard.col + ')' : 'Any' }}</span></div>
                    <div class="text-xs">Game Status: <span class="font-mono">{{ entry.gameStatus }}</span></div>
                    <div class="text-xs">Winner: <span class="font-mono">{{ entry.winner || '-' }}</span></div>
                    <div class="text-xs mt-1">Boards: <span class="font-mono">{{ formatBoardWinners(entry) }}</span></div>
                    <hr class="my-2 border-gray-300 dark:border-gray-700" />
                  </div>
                </div>
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

    .game-flex-container {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      transition: all 0.3s ease-in-out;
      width: 100%;
    }

    .game-container {
      min-width: 0; /* Remove minimum width constraint */
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

    @keyframes flash {
      0% {
        background-color: rgba(245, 158, 11, 0.3);
      }
      20% {
        background-color: transparent;
      }
      40% {
        background-color: rgba(245, 158, 11, 0.3);
      }
      60% {
        background-color: transparent;
      }
      80% {
        background-color: rgba(245, 158, 11, 0.3);
      }
      100% {
        background-color: transparent;
      }
    }

    .board-won {
      animation: breathe 2s ease-in-out infinite;
    }

    .computer-move {
      animation: flash 1.5s ease-in-out forwards;
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
      .game-container .grid {
        gap: 0.25rem;
      }
      .game-container .grid > div {
        gap: 0.125rem;
      }
    }

    @keyframes historyHover {
      0% {
        background-color: rgba(79, 70, 229, 0.1); /* indigo-600 with low opacity */
      }
      50% {
        background-color: rgba(79, 70, 229, 0.3); /* indigo-600 with higher opacity */
      }
      100% {
        background-color: rgba(79, 70, 229, 0.1); /* back to low opacity */
      }
    }

    @keyframes historyHoverO {
      0% {
        background-color: rgba(245, 158, 11, 0.1); /* amber-500 with low opacity */
      }
      50% {
        background-color: rgba(245, 158, 11, 0.3); /* amber-500 with higher opacity */
      }
      100% {
        background-color: rgba(245, 158, 11, 0.1); /* back to low opacity */
      }
    }

    .history-hover-x {
      animation: historyHover 2s ease-in-out infinite;
    }

    .history-hover-o {
      animation: historyHoverO 2s ease-in-out infinite;
    }
  `]
})
export class UltimateTicTacToeComponent implements OnInit {
  gameState: GameState;
  lastComputerMove: { boardRow: number; boardCol: number; cellRow: number; cellCol: number } | null = null;
  hoveredMove: { boardRow: number; boardCol: number; cellRow: number; cellCol: number; player: Player } | null = null;
  private playerXMoveSound: HTMLAudioElement;
  private playerOMoveSound: HTMLAudioElement;
  private boardWinSound: HTMLAudioElement;
  private gameWinSound: HTMLAudioElement;
  private sweepSound: HTMLAudioElement;
  private unlockSound: HTMLAudioElement;
  private previousGameStatus: string = 'playing';
  isHistoryVisible: boolean = true;

  // Scoreboard state
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;

  copyMessage: string = '';

  constructor(public gameService: GameService) {
    // Initialize game state with empty boards
    this.gameState = {
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
    };

    // Initialize audio elements
    this.playerXMoveSound = new Audio('assets/sounds/click-124467.mp3');
    this.playerOMoveSound = new Audio('assets/sounds/click-21156.mp3');
    this.boardWinSound = new Audio('assets/sounds/achievement-bell-600.mp3');
    this.gameWinSound = new Audio('assets/sounds/applause-8-6256.mp3');
    this.sweepSound = new Audio('assets/sounds/sweep-2637.mp3');
    this.unlockSound = new Audio('assets/sounds/unlock-253.mp3');

    // Configure audio settings
    this.playerXMoveSound.volume = 0.3;
    this.playerOMoveSound.volume = 0.3;
    this.boardWinSound.volume = 0.4;
    this.gameWinSound.volume = 0.5;
    this.sweepSound.volume = 0.4;
    this.unlockSound.volume = 0.4;
  }

  private playSound(sound: HTMLAudioElement): void {
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Audio play failed:', err));
  }

  private playPlayerXMoveSound(): void {
    this.playSound(this.playerXMoveSound);
  }

  private playPlayerOMoveSound(): void {
    this.playSound(this.playerOMoveSound);
  }

  private playBoardWinSound(): void {
    this.playSound(this.boardWinSound);
  }

  private playGameWinSound(): void {
    this.playSound(this.gameWinSound);
  }

  private playSweepSound(): void {
    this.playSound(this.sweepSound);
  }

  private playUnlockSound(): void {
    this.playSound(this.unlockSound);
  }

  ngOnInit() {
    // Load scores from localStorage
    const savedScores = localStorage.getItem('utt-scoreboard');
    if (savedScores) {
      const { scoreX, scoreO, scoreDraw } = JSON.parse(savedScores);
      this.scoreX = scoreX || 0;
      this.scoreO = scoreO || 0;
      this.scoreDraw = scoreDraw || 0;
    }

    // Subscribe to game state changes
    this.gameService.getGameState().subscribe(state => {
      // Check for board wins
      if (this.gameState.boards) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (!this.gameState.boards[i][j].winner && state.boards[i][j].winner) {
              this.playBoardWinSound();
            }
          }
        }
      }

      // Check for game win or draw and update scoreboard
      if (this.previousGameStatus === 'playing' && state.gameStatus === 'won') {
        if (state.winner === 'X') {
          this.scoreX++;
        } else if (state.winner === 'O') {
          this.scoreO++;
        }
        this.saveScores();
        this.playGameWinSound();
      } else if (this.previousGameStatus === 'playing' && state.gameStatus === 'draw') {
        this.scoreDraw++;
        this.saveScores();
      }

      this.previousGameStatus = state.gameStatus;
      this.gameState = state;
    });

    // Subscribe to computer moves for flash animation and sound
    this.gameService.getComputerMove().subscribe(move => {
      if (move) {
        // Set the move for flash animation
        this.lastComputerMove = move;
        // Play sound immediately
        this.playPlayerOMoveSound();
        // Clear the last computer move after animation duration
        setTimeout(() => {
          this.lastComputerMove = null;
        }, 2000);
      }
    });
  }

  makeMove(boardRow: number, boardCol: number, cellRow: number, cellCol: number): void {
    this.gameService.makeMove({ boardRow, boardCol, cellRow, cellCol });
    this.playPlayerXMoveSound();
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.lastComputerMove = null;
    this.playSweepSound();
  }

  isBoardActive(boardRow: number, boardCol: number): boolean {
    if (this.gameState.gameStatus !== 'playing') return false;
    if (!this.gameState.activeBoard) return true;
    return this.gameState.activeBoard.row === boardRow && this.gameState.activeBoard.col === boardCol;
  }

  isWinningBoard(boardRow: number, boardCol: number): boolean {
    if (this.gameState.gameStatus !== 'won' || !this.gameState.winner) return false;
    
    const boards = this.gameState.boards;
    const winner = this.gameState.winner;

    // Check rows
    for (let i = 0; i < 3; i++) {
      if (boards[i][0].winner === winner && 
          boards[i][1].winner === winner && 
          boards[i][2].winner === winner) {
        return boardRow === i;
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (boards[0][i].winner === winner && 
          boards[1][i].winner === winner && 
          boards[2][i].winner === winner) {
        return boardCol === i;
      }
    }

    // Check diagonals
    if (boards[0][0].winner === winner && 
        boards[1][1].winner === winner && 
        boards[2][2].winner === winner) {
      return boardRow === boardCol;
    }
    if (boards[0][2].winner === winner && 
        boards[1][1].winner === winner && 
        boards[2][0].winner === winner) {
      return boardRow + boardCol === 2;
    }

    return false;
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

  formatBoardWinners(entry: GameState): string {
    return entry.boards
      .map(row => row.map(b => b.winner || '-').join(' '))
      .join(' | ');
  }

  isComputerMove(boardRow: number, boardCol: number, cellRow: number, cellCol: number): boolean {
    if (!this.lastComputerMove) return false;
    return this.lastComputerMove.boardRow === boardRow &&
           this.lastComputerMove.boardCol === boardCol &&
           this.lastComputerMove.cellRow === cellRow &&
           this.lastComputerMove.cellCol === cellCol;
  }

  isHoveredMove(boardRow: number, boardCol: number, cellRow: number, cellCol: number): boolean {
    if (!this.hoveredMove) return false;
    return this.hoveredMove.boardRow === boardRow &&
           this.hoveredMove.boardCol === boardCol &&
           this.hoveredMove.cellRow === cellRow &&
           this.hoveredMove.cellCol === cellCol;
  }

  onHistoryHover(move: Move | undefined, player: Player | undefined): void {
    if (move && player) {
      this.hoveredMove = { ...move, player };
    } else {
      this.hoveredMove = null;
    }
  }

  toggleHistory(): void {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.playSweepSound(); // Play the swoosh sound during the animation
  }

  private saveScores() {
    localStorage.setItem('utt-scoreboard', JSON.stringify({
      scoreX: this.scoreX,
      scoreO: this.scoreO,
      scoreDraw: this.scoreDraw
    }));
  }

  resetScores(): void {
    this.scoreX = 0;
    this.scoreO = 0;
    this.scoreDraw = 0;
    this.saveScores();
  }

  copyGameHistory(): void {
    const history = this.gameService.getGameStateHistory();
    if (!history.length) return;
    const lines = history.map((entry, i) => {
      const move = entry.move ? `Move: (${entry.move.boardRow},${entry.move.boardCol}) → (${entry.move.cellRow},${entry.move.cellCol})` : '';
      return [
        `Move #${i + 1}`,
        `Player: ${entry.movePlayer}`,
        move,
        `Active Board: ${entry.activeBoard ? `(${entry.activeBoard.row},${entry.activeBoard.col})` : 'Any'}`,
        `Game Status: ${entry.gameStatus}`,
        `Winner: ${entry.winner || '-'}`,
        `Boards: ${this.formatBoardWinners(entry)}`,
        ''
      ].filter(Boolean).join('\n');
    });
    const text = 'Game History\n' + lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.copyMessage = 'Copied!';
      setTimeout(() => this.copyMessage = '', 1500);
    });
  }

  undo(): void {
    this.gameService.undoLastTurn();
  }
} 