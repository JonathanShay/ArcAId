import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PieceType, PieceColor } from './models/game.models';

@Component({
  selector: 'app-chess-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="chess-preview">
      <div class="preview-board">
        <div *ngFor="let row of [0,1,2,3,4,5,6,7]; let rowIndex = index" class="row">
          <div *ngFor="let col of [0,1,2,3,4,5,6,7]; let colIndex = index"
               class="square"
               [class.white-square]="(rowIndex + colIndex) % 2 === 0"
               [class.black-square]="(rowIndex + colIndex) % 2 === 1">
            <div *ngIf="getInitialPiece(rowIndex, colIndex)"
                 class="piece"
                 [class.white]="getInitialPiece(rowIndex, colIndex)?.color === 'white'"
                 [class.black]="getInitialPiece(rowIndex, colIndex)?.color === 'black'">
              {{ getPieceSymbol(getInitialPiece(rowIndex, colIndex)) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chess-preview {
      width: 100%;
      aspect-ratio: 1;
      max-width: 300px;
      margin: 0 auto;
    }

    .preview-board {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      width: 100%;
      aspect-ratio: 1;
      border: 2px solid #333;
    }

    .row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
    }

    .square {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .white-square {
      background-color: #f0d9b5;
    }

    .black-square {
      background-color: #b58863;
    }

    .piece {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .piece.white {
      color: #fff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .piece.black {
      color: #000;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
    }
  `]
})
export class ChessPreviewComponent {
  getInitialPiece(row: number, col: number): { type: PieceType; color: PieceColor } | null {
    // Set up initial board position
    if (row === 1) return { type: 'pawn', color: 'black' };
    if (row === 6) return { type: 'pawn', color: 'white' };
    
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    if (row === 0) return { type: pieceOrder[col], color: 'black' };
    if (row === 7) return { type: pieceOrder[col], color: 'white' };
    
    return null;
  }

  getPieceSymbol(piece: { type: PieceType; color: PieceColor } | null): string {
    if (!piece) return '';
    const symbols: Record<PieceType, { white: string; black: string }> = {
      pawn: { white: '♙', black: '♟' },
      rook: { white: '♖', black: '♜' },
      knight: { white: '♘', black: '♞' },
      bishop: { white: '♗', black: '♝' },
      queen: { white: '♕', black: '♛' },
      king: { white: '♔', black: '♚' }
    };
    return symbols[piece.type][piece.color];
  }
} 