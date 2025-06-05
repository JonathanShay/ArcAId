import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connect-four-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <div class="preview-board">
        <div class="board">
          <div *ngFor="let row of previewBoard" class="row">
            <div *ngFor="let cell of row" 
                 class="cell"
                 [class.red]="cell === 'R'"
                 [class.yellow]="cell === 'Y'">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }

    .preview-board {
      width: 100%;
      max-width: 300px;
    }

    .board {
      background-color: #2196F3;
      padding: 5px;
      border-radius: 5px;
    }

    .row {
      display: flex;
      justify-content: space-around;
    }

    .cell {
      width: 30px;
      height: 30px;
      background-color: white;
      border-radius: 50%;
      margin: 2px;
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
    [null, null, 'R', 'Y', 'R', null, null],
    [null, 'Y', 'R', 'Y', 'R', 'Y', null]
  ];
} 