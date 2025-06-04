import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmallBoard } from '../models/game.models';

@Component({
  selector: 'app-board-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board-preview" [ngClass]="{
      'border-indigo-600': winner === 'X',
      'border-amber-500': winner === 'O',
      'border-gray-300': !winner
    }">
      <div class="grid-container">
        <ng-container *ngFor="let cellRow of board.cells; let cellRowIndex = index">
          <ng-container *ngFor="let cell of cellRow; let cellColIndex = index">
            <div class="cell"
                 [class.text-indigo-600]="cell === 'X'"
                 [class.text-amber-500]="cell === 'O'">
              {{ cell }}
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      margin: 0;
      padding: 0;
    }

    .board-preview {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
      border-width: 2px;
      border-radius: 0.5rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .border-indigo-600 {
      border-color: #4f46e5 !important;
    }
    .border-amber-500 {
      border-color: #f59e0b !important;
    }
    .border-gray-300 {
      border-color: #d1d5db !important;
    }

    .grid-container {
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 0.5px;
      margin: 0;
      padding: 0;
    }

    .cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      aspect-ratio: 1;
      margin: 0;
      padding: 0;
    }
  `]
})
export class BoardPreviewComponent implements OnInit {
  @Input() board!: SmallBoard;
  @Input() winner: string | null = null;

  ngOnInit() {
    console.log('BoardPreview received board:', {
      cells: this.board.cells.map(row => row.map(cell => cell)),
      winner: this.board.winner,
      isActive: this.board.isActive
    });
  }
} 