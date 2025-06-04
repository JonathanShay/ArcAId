import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardPreviewComponent } from './board-preview.component';
import { SmallBoard } from '../models/game.models';

@Component({
  selector: 'app-ultimate-tic-tac-toe-preview',
  standalone: true,
  imports: [CommonModule, BoardPreviewComponent],
  template: `
    <div class="utt-preview-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-md mx-auto">
      <div class="text-center mb-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Ultimate Tic-Tac-Toe</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">Preview</p>
      </div>
      <div class="utt-preview-board grid grid-cols-3 gap-2">
        <ng-container *ngFor="let boardRow of previewBoards; let i = index">
          <ng-container *ngFor="let board of boardRow; let j = index">
            <app-board-preview [board]="board" [winner]="board.winner"></app-board-preview>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .utt-preview-card {
      border: 2px solid #e0e7ef;
    }
    .utt-preview-board {
      width: 100%;
      aspect-ratio: 1;
    }
    app-board-preview {
      width: 100%;
      aspect-ratio: 1;
      min-width: 0;
    }
  `]
})
export class UltimateTicTacToePreviewComponent {
  // A static, visually interesting preview state
  previewBoards: SmallBoard[][] = [
    [
      { cells: [["X", null, "O"], [null, "X", null], [null, null, "O"]], winner: "X", isActive: false },
      { cells: [[null, null, null], [null, "O", null], [null, null, null]], winner: null, isActive: false },
      { cells: [["O", null, null], [null, "O", null], [null, null, "X"]], winner: "O", isActive: false }
    ],
    [
      { cells: [[null, null, null], [null, null, null], [null, null, null]], winner: null, isActive: false },
      { cells: [["X", "O", "X"], ["O", "X", "O"], ["X", "O", "X"]], winner: "draw", isActive: false },
      { cells: [[null, null, null], [null, null, null], [null, null, null]], winner: null, isActive: false }
    ],
    [
      { cells: [[null, null, null], [null, null, null], [null, null, null]], winner: null, isActive: false },
      { cells: [[null, null, null], [null, null, null], [null, null, null]], winner: null, isActive: false },
      { cells: [["X", null, null], [null, "O", null], [null, null, "X"]], winner: null, isActive: false }
    ]
  ];
} 