import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';

@Component({
  selector: 'app-reversi',
  template: `
    <div class="game-flex-container">
      <div class="game-container">
        <div class="reversi-board" #gameBoard>
          <!-- Game board content -->
        </div>
      </div>
      <div class="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg p-2 overflow-hidden transition-all duration-300 flex flex-col"
           [style.height]="boardHeight + 'px'"
           [class.opacity-0]="!isHistoryVisible"
           [class.w-0]="!isHistoryVisible"
           [class.p-0]="!isHistoryVisible">
        <div class="flex items-center justify-between mb-2 flex-shrink-0">
          <h2 class="text-lg font-semibold">Game History</h2>
          <div class="flex items-center">
            <button (click)="copyGameHistory()" class="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Copy History
            </button>
            <span *ngIf="copyMessage" class="ml-3 text-green-600 dark:text-green-400 font-semibold">{{ copyMessage }}</span>
          </div>
        </div>
        <div class="overflow-y-auto flex-grow">
          <!-- History content -->
        </div>
      </div>
    </div>
  `,
  styles: [`
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
export class ReversiComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameBoard') gameBoard!: ElementRef;
  boardHeight = 600;
  isHistoryVisible = true;
  copyMessage = '';
  private resizeObserver: ResizeObserver | undefined;

  constructor() {
    console.log('ReversiComponent constructor called');
  }

  ngOnInit() {
    console.log('ReversiComponent ngOnInit called');
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
      this.resizeObserver = new ResizeObserver(entries => {
        console.log('ResizeObserver triggered');
        
        for (const entry of entries) {
          const newHeight = entry.contentRect.height;
          console.log('Resize detected:', {
            newHeight,
            currentHeight: this.boardHeight,
            contentRect: entry.contentRect
          });
          
          if (newHeight !== this.boardHeight) {
            console.log('Updating height from', this.boardHeight, 'to', newHeight);
            this.boardHeight = newHeight;
          }
        }
      });
      
      // Start observing the game board
      this.resizeObserver.observe(this.gameBoard.nativeElement);
      console.log('Started observing game board element');
    } else {
      console.warn('Game board element not found');
    }
  }

  ngOnDestroy() {
    console.log('ReversiComponent ngOnDestroy called');
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      console.log('ResizeObserver disconnected');
    }
  }

  copyGameHistory() {
    // Implementation of copy game history
  }
} 