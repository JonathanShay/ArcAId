import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameState, Move, Player } from './models/game.models';

@Component({
  selector: 'app-reversi',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="scoreboard flex justify-center gap-8 mb-6 items-center">
          <div class="score-black flex items-center gap-2">
            <span class="text-gray-900 dark:text-white font-bold text-xl">You (Black):</span>
            <span class="text-2xl font-mono text-gray-900 dark:text-gray-200">{{ gameState.score.black }}</span>
          </div>
          <div class="score-white flex items-center gap-2">
            <span class="text-gray-500 dark:text-white font-bold text-xl">Computer (White):</span>
            <span class="text-2xl font-mono text-gray-500 dark:text-gray-300">{{ gameState.score.white }}</span>
          </div>
          <button (click)="resetScores()" class="ml-6 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-semibold">Reset</button>
        </div>
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div class="relative rounded-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 shadow-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reversi</h1>
              <div class="flex gap-2">
                <button (click)="toggleHistory()" 
                        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
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
                        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                  New Game
                </button>
              </div>
            </div>
            
            <div class="game-status mb-6 text-center">
              <p *ngIf="gameState.gameStatus === 'playing'" class="text-lg text-gray-700 dark:text-gray-300">
                Current Player: <span class="font-bold" [class.text-gray-900]="gameState.currentPlayer === 'B'" 
                                              [class.text-gray-500]="gameState.currentPlayer === 'W'">
                  {{ gameState.currentPlayer === 'B' ? 'Black' : 'White' }}
                </span>
              </p>
              <p *ngIf="gameState.gameStatus === 'won'" class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ gameState.winner === 'B' ? 'Black' : 'White' }} wins!
              </p>
              <p *ngIf="gameState.gameStatus === 'draw'" class="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Game ended in a draw!
              </p>
            </div>

            <div class="game-flex-container" [class.history-hidden]="!isHistoryVisible">
              <div class="game-container" [class.expanded]="!isHistoryVisible">
                <div class="reversi-board">
                  <div class="grid grid-cols-8 gap-0.5 bg-green-800 p-2 rounded-lg">
                    <ng-container *ngFor="let row of gameState.board; let rowIndex = index">
                      <ng-container *ngFor="let cell of row; let colIndex = index">
                        <div class="relative aspect-square cell-wrapper">
                          <button class="w-full h-full flex items-center justify-center rounded-md transition-colors duration-200"
                                  [ngClass]="{
                                    'bg-green-700': !cell && !isValidMove(rowIndex, colIndex),
                                    'bg-green-600': !cell && isValidMove(rowIndex, colIndex),
                                    'hover:bg-green-500': !cell && isValidMove(rowIndex, colIndex),
                                    'cursor-not-allowed': !isValidMove(rowIndex, colIndex),
                                    'computer-move': isComputerMove(rowIndex, colIndex),
                                    'history-hover-black': isHoveredMove(rowIndex, colIndex) && hoveredMove?.player === 'B',
                                    'history-hover-white': isHoveredMove(rowIndex, colIndex) && hoveredMove?.player === 'W'
                                  }"
                                  (click)="makeMove(rowIndex, colIndex)"
                                  [disabled]="!isValidMove(rowIndex, colIndex)">
                            <div *ngIf="cell" 
                                 class="w-[90%] h-[90%] rounded-full transition-transform duration-300"
                                 [ngClass]="{
                                   'bg-gray-900': cell === 'B',
                                   'bg-gray-100': cell === 'W',
                                   'scale-110': isComputerMove(rowIndex, colIndex)
                                 }">
                            </div>
                          </button>
                        </div>
                      </ng-container>
                    </ng-container>
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
                  <div *ngFor="let entry of gameService.getGameStateHistory(); let i = index" 
                       class="history-entry"
                       (mouseenter)="onHistoryHover(entry.move)"
                       (mouseleave)="onHistoryHover(undefined)">
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-200">Move #{{ i + 1 }}</div>
                    <div class="text-xs">Player: <span class="font-bold">{{ entry.move?.player === 'B' ? 'Black' : 'White' }}</span></div>
                    <div class="text-xs" *ngIf="entry.move">Move: <span class="font-mono">({{ entry.move.row }},{{ entry.move.col }})</span></div>
                    <div class="text-xs">Game Status: <span class="font-mono">{{ entry.gameStatus }}</span></div>
                    <div class="text-xs">Winner: <span class="font-mono">{{ entry.winner ? (entry.winner === 'B' ? 'Black' : 'White') : '-' }}</span></div>
                    <div class="text-xs mt-1">Score: <span class="font-mono">B:{{ entry.score.black }} W:{{ entry.score.white }}</span></div>
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

    .reversi-board {
      width: 100%;
      max-width: 600px;
      aspect-ratio: 1;
    }

    @keyframes flash {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .computer-move {
      animation: flash 0.5s ease-in-out;
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

    @keyframes historyHoverBlack {
      0% {
        background-color: rgba(17, 24, 39, 0.1);
      }
      50% {
        background-color: rgba(17, 24, 39, 0.3);
      }
      100% {
        background-color: rgba(17, 24, 39, 0.1);
      }
    }

    @keyframes historyHoverWhite {
      0% {
        background-color: rgba(243, 244, 246, 0.1);
      }
      50% {
        background-color: rgba(243, 244, 246, 0.3);
      }
      100% {
        background-color: rgba(243, 244, 246, 0.1);
      }
    }

    .history-hover-black {
      animation: historyHoverBlack 2s ease-in-out infinite;
    }

    .history-hover-white {
      animation: historyHoverWhite 2s ease-in-out infinite;
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
      .reversi-board {
        max-width: 100%;
      }
    }
  `]
})
export class ReversiComponent implements OnInit {
  gameState: GameState;
  lastComputerMove: { row: number; col: number } | null = null;
  hoveredMove: Move | null = null;
  isHistoryVisible: boolean = true;
  copyMessage: string = '';

  // Scoreboard state
  scoreBlack = 0;
  scoreWhite = 0;
  scoreDraw = 0;

  // Sound effects
  private playerBlackMoveSound: HTMLAudioElement;
  private playerWhiteMoveSound: HTMLAudioElement;
  private gameWinSound: HTMLAudioElement;
  private sweepSound: HTMLAudioElement;
  private previousGameStatus: string = 'playing';

  constructor(public gameService: GameService) {
    this.gameState = this.gameService.getInitialState();
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
    });

    // Initialize audio elements
    this.playerBlackMoveSound = new Audio('assets/sounds/click-124467.mp3');
    this.playerWhiteMoveSound = new Audio('assets/sounds/click-21156.mp3');
    this.gameWinSound = new Audio('assets/sounds/applause-8-6256.mp3');
    this.sweepSound = new Audio('assets/sounds/sweep-2637.mp3');

    // Configure audio settings
    this.playerBlackMoveSound.volume = 0.3;
    this.playerWhiteMoveSound.volume = 0.3;
    this.gameWinSound.volume = 0.5;
    this.sweepSound.volume = 0.4;
  }

  ngOnInit() {
    // Initialize game
    this.gameService.resetGame();

    // Load scores from localStorage
    const savedScores = localStorage.getItem('reversi-scoreboard');
    if (savedScores) {
      const { scoreBlack, scoreWhite, scoreDraw } = JSON.parse(savedScores);
      this.scoreBlack = scoreBlack || 0;
      this.scoreWhite = scoreWhite || 0;
      this.scoreDraw = scoreDraw || 0;
    }

    // Subscribe to game state changes
    this.gameService.getGameState().subscribe(state => {
      // Play sounds based on game state changes
      if (state.gameStatus === 'won' && this.previousGameStatus === 'playing') {
        this.playGameWinSound();
      }
      this.previousGameStatus = state.gameStatus;

      // Check for game win or draw and update scoreboard
      if (state.gameStatus === 'won') {
        if (state.winner === 'B') {
          this.scoreBlack++;
        } else if (state.winner === 'W') {
          this.scoreWhite++;
        }
        this.saveScores();
      } else if (state.gameStatus === 'draw') {
        this.scoreDraw++;
        this.saveScores();
      }

      this.gameState = state;
    });
  }

  makeMove(row: number, col: number): void {
    if (this.gameState.currentPlayer === 'B') {
      this.playPlayerBlackMoveSound();
    }
    this.gameService.makeMove(row, col);
  }

  private playSound(sound: HTMLAudioElement): void {
    sound.currentTime = 0;
    sound.play().catch(err => console.error('Error playing sound:', err));
  }

  private playPlayerBlackMoveSound(): void {
    this.playSound(this.playerBlackMoveSound);
  }

  private playPlayerWhiteMoveSound(): void {
    this.playSound(this.playerWhiteMoveSound);
  }

  private playGameWinSound(): void {
    this.playSound(this.gameWinSound);
  }

  private playSweepSound(): void {
    this.playSound(this.sweepSound);
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.lastComputerMove = null;
  }

  isValidMove(row: number, col: number): boolean {
    return this.gameState.validMoves.some(move => move.row === row && move.col === col);
  }

  isComputerMove(row: number, col: number): boolean {
    return this.lastComputerMove?.row === row && this.lastComputerMove?.col === col;
  }

  onHistoryHover(move: Move | undefined): void {
    this.hoveredMove = move || null;
  }

  isHoveredMove(row: number, col: number): boolean {
    if (!this.hoveredMove) return false;
    return this.hoveredMove.row === row && this.hoveredMove.col === col;
  }

  toggleHistory(): void {
    this.isHistoryVisible = !this.isHistoryVisible;
    this.playSweepSound();
  }

  private saveScores() {
    localStorage.setItem('reversi-scoreboard', JSON.stringify({
      scoreBlack: this.scoreBlack,
      scoreWhite: this.scoreWhite,
      scoreDraw: this.scoreDraw
    }));
  }

  resetScores(): void {
    this.scoreBlack = 0;
    this.scoreWhite = 0;
    this.scoreDraw = 0;
    this.saveScores();
  }

  copyGameHistory(): void {
    const history = this.gameService.getGameStateHistory();
    if (!history.length) return;
    const lines = history.map((entry, i) => {
      const move = entry.move ? `Move: (${entry.move.row},${entry.move.col})` : '';
      return [
        `Move #${i + 1}`,
        `Player: ${entry.move?.player === 'B' ? 'Black' : 'White'}`,
        move,
        `Game Status: ${entry.gameStatus}`,
        `Winner: ${entry.winner ? (entry.winner === 'B' ? 'Black' : 'White') : '-'}`,
        `Score: B:${entry.score.black} W:${entry.score.white}`,
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