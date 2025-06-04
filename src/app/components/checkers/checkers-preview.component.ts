import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkers-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Checkers</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">Preview</p>
      </div>
      <div class="preview-board">
        <div class="board-row" *ngFor="let row of previewBoard; let rowIndex = index">
          <div class="cell" 
               *ngFor="let cell of row; let colIndex = index"
               [class.dark]="(rowIndex + colIndex) % 2 === 1">
            <div class="piece" 
                 *ngIf="cell"
                 [class.black]="cell === 'B'"
                 [class.red]="cell === 'W'">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-card {
      border: 2px solid #e0e7ef;
    }
    .preview-board {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      gap: 1px;
      background: #666;
      padding: 1px;
      width: 100%;
      aspect-ratio: 1;
    }

    .board-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 1px;
    }

    .cell {
      aspect-ratio: 1;
      background: #f0d9b5;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cell.dark {
      background: #b58863;
    }

    .piece {
      width: 80%;
      height: 80%;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .piece.black {
      background: #333;
    }

    .piece.red {
      background: #c41e3a;
    }
  `]
})
export class CheckersPreviewComponent {
  // Create a simplified preview board with just the initial piece positions
  previewBoard = [
    [null, 'B', null, 'B', null, 'B', null, 'B'],
    ['B', null, 'B', null, 'B', null, 'B', null],
    [null, 'B', null, 'B', null, 'B', null, 'B'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['W', null, 'W', null, 'W', null, 'W', null],
    [null, 'W', null, 'W', null, 'W', null, 'W'],
    ['W', null, 'W', null, 'W', null, 'W', null]
  ];
} 