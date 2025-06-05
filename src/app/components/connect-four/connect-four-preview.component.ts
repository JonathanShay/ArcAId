import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connect-four-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <div class="board">
        <div class="row" *ngFor="let row of previewBoard">
          <div class="cell" *ngFor="let cell of row" [class.red]="cell === 'R'" [class.yellow]="cell === 'Y'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0;
      margin-bottom: 1rem;
    }
    .board {
      width: 100%;
      aspect-ratio: 7/6;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background-color: #2196F3;
      padding: 4px;
      border-radius: 4px;
      max-width: 100%;
    }
    .row {
      display: flex;
      gap: 2px;
      flex: 1;
    }
    .cell {
      flex: 1;
      aspect-ratio: 1;
      background-color: white;
      border-radius: 50%;
    }
    .cell.red {
      background-color: #f44336;
    }
    .cell.yellow {
      background-color: #ffeb3b;
    }
  `]
})
export class ConnectFourPreviewComponent {
  previewBoard = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, 'R', 'Y', null, null],
    [null, null, 'Y', 'R', 'R', 'Y', null],
    [null, 'R', 'Y', 'Y', 'R', 'R', 'Y']
  ];
} 