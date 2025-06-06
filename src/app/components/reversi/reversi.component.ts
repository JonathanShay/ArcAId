import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from './services/game.service';
import { GameState, Move, Player, DifficultyLevel } from './models/game.models';
import { PersistenceService } from '../../services/persistence.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-reversi',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

        <div class="overall-scoreboard bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 mb-6 shadow-lg">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Overall Scoreboard</h2>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">Black Wins</div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ scoreboard.black }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">White Wins</div>
              <div class="text-2xl font-bold text-gray-500 dark:text-gray-300">{{ scoreboard.white }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 dark:text-gray-400">Draws</div>
              <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ scoreboard.draws }}</div>
            </div>
          </div>
        </div>

        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div class="relative rounded-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 shadow-lg p-6">
            <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reversi</h1>
              <div class="flex flex-wrap gap-2 items-center">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 dark:text-gray-300">Difficulty:</span>
                  <select [(ngModel)]="gameState.difficulty" 
                          (change)="onDifficultyChange($event)"
                          class="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
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
            
            <div class="game-stats flex justify-center gap-8 mb-6 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time: {{ formatTime(gameState.gameTime) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Moves: {{ gameState.moveCount }}</span>
              </div>
            </div>

            <div class="game-status mb-6 text-center">
              <p *ngIf="gameState.gameStatus === 'playing'" class="text-lg text-gray-700 dark:text-gray-200">
                Current Player: <span class="font-bold" [class.text-gray-900]="gameState.currentPlayer === 'B'" 
                                              [class.text-gray-500]="gameState.currentPlayer === 'W'"
                                              [class.dark:text-white]="gameState.currentPlayer === 'B'"
                                              [class.dark:text-gray-300]="gameState.currentPlayer === 'W'">
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

            <div class="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 transition-all duration-300">
              <div class="flex items-start justify-center">
                <div class="w-full max-w-[600px] aspect-square" #gameBoard>
                  <div class="grid grid-cols-8 gap-0.5 bg-green-800 p-2 rounded-lg h-full">
                    <ng-container *ngFor="let row of gameState.board; let rowIndex = index">
                      <ng-container *ngFor="let cell of row; let colIndex = index">
                        <div class="relative aspect-square">
                          <button class="w-full h-full flex items-center justify-center rounded-md transition-colors duration-200"
                                  [ngClass]="{
                                    'bg-green-700': !cell && !isValidMove(rowIndex, colIndex),
                                    'bg-green-600': !cell && isValidMove(rowIndex, colIndex),
                                    'hover:bg-green-500': !cell && isValidMove(rowIndex, colIndex),
                                    'cursor-not-allowed': !isValidMove(rowIndex, colIndex),
                                    'computer-move': isComputerMove(rowIndex, colIndex),
                                    'history-hover-black': isHoveredMove(rowIndex, colIndex) && hoveredMove?.player === 'B',
                                    'history-hover-white': isHoveredMove(rowIndex, colIndex) && hoveredMove?.player === 'W',
                                    'last-move': isLastMove(rowIndex, colIndex)
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
              <div class="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg p-2 overflow-hidden transition-all duration-300 flex flex-col"
                   [style]="'height: ' + boardHeight + 'px !important; max-height: ' + boardHeight + 'px !important; min-height: ' + boardHeight + 'px !important'"
                   [class.opacity-0]="!isHistoryVisible"
                   [class.w-0]="!isHistoryVisible"
                   [class.p-0]="!isHistoryVisible"
                   #historyPanel>
                <div class="flex items-center justify-between mb-2 flex-shrink-0">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Game History</h2>
                  <div class="flex items-center">
                    <button (click)="copyGameHistory()" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-semibold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Copy History
                    </button>
                    <span *ngIf="copyMessage" class="ml-3 text-green-600 dark:text-green-400 font-semibold">{{ copyMessage }}</span>
                  </div>
                </div>
                <div class="overflow-y-auto flex-grow">
                  <div *ngFor="let entry of gameService.getGameStateHistory(); let i = index" 
                       class="mb-2 pb-2 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                       (mouseenter)="onHistoryHover(entry.move)"
                       (mouseleave)="onHistoryHover(undefined)">
                    <div class="font-mono text-xs text-gray-700 dark:text-gray-100">Move #{{ i + 1 }}</div>
                    <div class="text-xs text-gray-700 dark:text-gray-100">Player: <span class="font-bold">{{ entry.move?.player === 'B' ? 'Black' : 'White' }}</span></div>
                    <div class="text-xs text-gray-700 dark:text-gray-100" *ngIf="entry.move">Move: <span class="font-mono">({{ entry.move.row }},{{ entry.move.col }})</span></div>
                    <div class="text-xs text-gray-700 dark:text-gray-100">Game Status: <span class="font-mono">{{ entry.gameStatus }}</span></div>
                    <div class="text-xs text-gray-700 dark:text-gray-100">Winner: <span class="font-mono">{{ entry.winner ? (entry.winner === 'B' ? 'Black' : 'White') : '-' }}</span></div>
                    <div class="text-xs text-gray-700 dark:text-gray-100 mt-1">Score: <span class="font-mono">B:{{ entry.score.black }} W:{{ entry.score.white }}</span></div>
                    <hr class="my-2 border-gray-300 dark:border-gray-600" />
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

    .last-move {
      position: relative;
    }

    .last-move::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 0.375rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.05);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
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
  `]
})
export class ReversiComponent implements OnInit, AfterViewInit {
  @ViewChild('gameBoard') gameBoard!: ElementRef;
  @ViewChild('historyPanel') historyPanel!: ElementRef;
  boardHeight = 600;
  gameState: GameState;
  lastComputerMove: { row: number; col: number } | null = null;
  lastPlayerMove: { row: number; col: number } | null = null;
  hoveredMove: Move | null = null;
  isHistoryVisible: boolean = true;
  copyMessage: string = '';
  scoreboard: { black: number; white: number; draws: number } = { black: 0, white: 0, draws: 0 };
  private previousGameStatus: string = 'playing';

  constructor(
    public gameService: GameService,
    private persistenceService: PersistenceService,
    private soundService: SoundService
  ) {
    console.log('ReversiComponent constructor called');
    this.gameState = this.gameService.getInitialState();
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
    });
    this.loadScoreboard();
  }

  ngOnInit() {
    console.log('ReversiComponent ngOnInit called');
    // Initialize game with saved difficulty
    const savedDifficulty = this.persistenceService.getDifficulty();
    this.gameService.setDifficulty(savedDifficulty);
    this.gameService.resetGame();

    // Load scoreboard from persistence and ensure all values are numbers
    const savedScoreboard = this.persistenceService.getScoreboard();
    this.scoreboard = {
      black: Number(savedScoreboard.black) || 0,
      white: Number(savedScoreboard.white) || 0,
      draws: Number(savedScoreboard.draws) || 0
    };

    // Subscribe to game state changes
    this.gameService.getGameState().subscribe(state => {
      // Play sounds based on game state changes
      if (state.gameStatus === 'won' && this.previousGameStatus === 'playing') {
        this.soundService.playSound('gameWin');
        // Update scoreboard when game is won
        if (state.winner === 'B') {
          this.scoreboard.black = (this.scoreboard.black || 0) + 1;
        } else if (state.winner === 'W') {
          this.scoreboard.white = (this.scoreboard.white || 0) + 1;
        }
        this.persistenceService.saveScoreboard(this.scoreboard);
      } else if (state.gameStatus === 'draw' && this.previousGameStatus === 'playing') {
        this.scoreboard.draws = (this.scoreboard.draws || 0) + 1;
        this.persistenceService.saveScoreboard(this.scoreboard);
      }

      // Play white player's move sound when computer makes a move
      if (state.lastComputerMove) {
        this.soundService.playSound('playerWhiteMove');
        this.lastComputerMove = state.lastComputerMove;
      }

      this.previousGameStatus = state.gameStatus;
      this.gameState = state;
    });
  }

  ngAfterViewInit() {
    console.log('ReversiComponent ngAfterViewInit called');
    
    if (this.gameBoard) {
      console.log('Game board element found');
      
      // Log initial dimensions
      const board = this.gameBoard.nativeElement;
      console.log('Initial board dimensions:', {
        offsetWidth: board.offsetWidth,
        offsetHeight: board.offsetHeight,
        clientWidth: board.clientWidth,
        clientHeight: board.clientHeight
      });

      // Create a ResizeObserver to watch for size changes
      const resizeObserver = new ResizeObserver(entries => {
        console.log('ResizeObserver triggered');
        
        for (const entry of entries) {
          // Since the game board is a square, use its width as the height
          const newHeight = entry.contentRect.width;
          console.log('Game board dimensions:', {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            newHeight,
            currentHeight: this.boardHeight
          });
          
          if (newHeight !== this.boardHeight) {
            console.log('Updating height from', this.boardHeight, 'to', newHeight);
            this.boardHeight = newHeight;
            
            // Log history panel dimensions after update
            setTimeout(() => {
              if (this.historyPanel) {
                const panel = this.historyPanel.nativeElement;
                console.log('History panel dimensions:', {
                  offsetHeight: panel.offsetHeight,
                  clientHeight: panel.clientHeight,
                  styleHeight: panel.style.height
                });
              }
            });
          }
        }
      });
      
      // Start observing the game board
      resizeObserver.observe(this.gameBoard.nativeElement);
      console.log('Started observing game board element');
    } else {
      console.warn('Game board element not found');
    }
  }

  makeMove(row: number, col: number): void {
    if (this.gameState.currentPlayer === 'B') {
      this.soundService.playSound('playerBlackMove');
      this.lastPlayerMove = { row, col };
    }
    this.gameService.makeMove(row, col);
  }

  resetGame(): void {
    // Don't reset difficulty when resetting game
    this.gameService.resetGame();
    this.lastComputerMove = null;
    this.lastPlayerMove = null;
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
    this.soundService.playSound('sweep');
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

  onDifficultyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const difficulty = select.value as DifficultyLevel;
    this.gameService.setDifficulty(difficulty);
    this.persistenceService.saveDifficulty(difficulty);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  isLastMove(row: number, col: number): boolean {
    return (this.lastPlayerMove?.row === row && this.lastPlayerMove?.col === col) ||
           (this.lastComputerMove?.row === row && this.lastComputerMove?.col === col);
  }

  resetScores(): void {
    this.scoreboard = { black: 0, white: 0, draws: 0 };
    this.persistenceService.resetScoreboard();
  }

  loadScoreboard(): void {
    // Implement the logic to load the scoreboard from persistence
  }
} 