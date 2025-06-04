import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellState } from './models/game.models';

@Component({
  selector: 'app-reversi-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reversi-preview-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Reversi</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">Preview</p>
      </div>
      <div class="reversi-preview-board">
        <div class="grid grid-cols-8 gap-0.5 bg-green-800 p-2 rounded-lg">
          <ng-container *ngFor="let row of previewBoard; let i = index">
            <ng-container *ngFor="let cell of row; let j = index">
              <div class="aspect-square">
                <div class="w-full h-full flex items-center justify-center">
                  <div *ngIf="cell" 
                       class="w-[90%] h-[90%] rounded-full"
                       [ngClass]="{
                         'bg-gray-900': cell === 'B',
                         'bg-gray-100': cell === 'W'
                       }">
                  </div>
                </div>
              </div>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reversi-preview-card {
      border: 2px solid #e0e7ef;
    }
    .reversi-preview-board {
      width: 100%;
      aspect-ratio: 1;
    }
  `]
})
export class ReversiPreviewComponent {
  // A static, visually interesting preview state
  previewBoard: CellState[][] = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 'W', 'B', null, null, null],
    [null, null, null, 'B', 'W', null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
  ];
} 