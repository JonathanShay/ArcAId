import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameState, Piece, PieceType, PieceColor } from './models/game.models';

@Component({
  selector: 'app-chess',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chess-container">
      <div class="game-status">
        <h2>{{ getStatusMessage() }}</h2>
      </div>

      <div class="game-board-and-history">
        <div class="board-section">
          <div class="captured-pieces">
            <div class="white-captured">
              <div *ngFor="let piece of getCapturedPieces('white')" class="captured-piece white">
                <i [class]="getPieceClass(piece)"></i>
              </div>
            </div>
            <div class="black-captured">
              <div *ngFor="let piece of getCapturedPieces('black')" class="captured-piece black">
                <i [class]="getPieceClass(piece)"></i>
              </div>
            </div>
          </div>

          <div class="chessboard">
            <div *ngFor="let row of [0,1,2,3,4,5,6,7]; let rowIndex = index" class="row">
              <div *ngFor="let col of [0,1,2,3,4,5,6,7]; let colIndex = index"
                   class="square"
                   [class.white-square]="(rowIndex + colIndex) % 2 === 0"
                   [class.black-square]="(rowIndex + colIndex) % 2 === 1"
                   [class.selected]="isSelected(rowIndex, colIndex)"
                   [class.valid-move]="isValidMoveTarget(rowIndex, colIndex)"
                   [class.last-move]="isLastMove(rowIndex, colIndex)"
                   [class.check]="isCheck(rowIndex, colIndex)"
                   (click)="onSquareClick(rowIndex, colIndex)">
                <div *ngIf="getPieceAt(rowIndex, colIndex)"
                     class="piece"
                     [class.white]="getPieceAt(rowIndex, colIndex)?.color === 'white'"
                     [class.black]="getPieceAt(rowIndex, colIndex)?.color === 'black'">
                  <i [class]="getPieceClass(getPieceAt(rowIndex, colIndex))"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="game-controls">
            <button (click)="toggleComputerPlayer()" 
                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
              <span>{{ isComputerPlayer ? 'Disable' : 'Enable' }} Computer</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clip-rule="evenodd" />
              </svg>
            </button>
            <button (click)="resetGame()">New Game</button>
            <button (click)="undoMove()" [disabled]="!canUndo()">Undo Move</button>
            <button (click)="copyGameHistory()" class="copy-history-btn">
              <i class="fas fa-copy"></i> Copy History
            </button>
          </div>
        </div>

        <div class="history-panel">
          <h3>Game History</h3>
          <div class="history-entries">
            <div *ngFor="let entry of gameHistory; let i = index" class="history-entry">
              <div class="move-number">{{ i + 1 }}.</div>
              <div class="move-details">
                <div class="move-info">
                  <span class="player">{{ entry.player === 'white' ? 'White' : 'Black' }}</span>
                  <span class="piece">{{ getPieceSymbol(entry.piece) }}</span>
                  <span class="from">{{ getSquareNotation(entry.from) }}</span>
                  <span class="to">{{ getSquareNotation(entry.to) }}</span>
                  <span *ngIf="entry.captured" class="capture">
                    (captured {{ getPieceSymbol(entry.captured) }})
                  </span>
                  <span *ngIf="entry.promotion" class="promotion">
                    (promoted to {{ getPieceSymbol({ type: entry.promotion, color: entry.player, hasMoved: true }) }})
                  </span>
                </div>
                <div class="board-state">
                  <div *ngFor="let row of entry.boardState" class="board-row">
                    <div *ngFor="let piece of row" class="board-cell">
                      <i *ngIf="piece" [class]="getPieceClass(piece)"></i>
                    </div>
                  </div>
                </div>
                <div class="game-status" [class.check]="entry.isCheck" [class.checkmate]="entry.isCheckmate">
                  {{ entry.status }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showPromotionDialog" class="promotion-dialog">
        <h3>Choose a piece to promote to:</h3>
        <div class="promotion-options">
          <div *ngFor="let piece of promotionPieces"
               class="promotion-piece"
               [class.white]="gameState?.currentPlayer === 'white'"
               [class.black]="gameState?.currentPlayer === 'black'"
               (click)="promotePawn(piece)">
            <i [class]="getPieceClass({ type: piece, color: gameState?.currentPlayer || 'white', hasMoved: true })"></i>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chess-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .game-board-and-history {
      display: flex;
      gap: 20px;
      width: 100%;
    }

    .board-section {
      flex: 1;
      max-width: 600px;
    }

    .history-panel {
      flex: 1;
      max-width: 500px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      overflow-y: auto;
      max-height: 800px;
    }

    .history-entries {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .history-entry {
      display: flex;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .move-number {
      font-weight: bold;
      min-width: 30px;
    }

    .move-details {
      flex: 1;
    }

    .move-info {
      margin-bottom: 8px;
    }

    .player {
      font-weight: bold;
      margin-right: 8px;
    }

    .board-state {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      width: 100%;
      max-width: 200px;
      margin: 8px 0;
      border: 1px solid #ddd;
    }

    .board-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
    }

    .board-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: #f0f0f0;
    }

    .board-cell:nth-child(odd) {
      background: #e0e0e0;
    }

    .game-status {
      font-size: 0.9rem;
      color: #666;
    }

    .game-status.check {
      color: #dc3545;
    }

    .game-status.checkmate {
      color: #dc3545;
      font-weight: bold;
    }

    .copy-history-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      background-color: #4a5568;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .copy-history-btn:hover {
      background-color: #2d3748;
    }

    .chess-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .game-status {
      margin-bottom: 20px;
      text-align: center;
    }

    .captured-pieces {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 20px;
    }

    .white-captured, .black-captured {
      display: flex;
      gap: 5px;
    }

    .captured-piece {
      font-size: 1.5rem;
      opacity: 0.7;
    }

    .chessboard {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      width: 100%;
      max-width: 600px;
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
      font-size: 2.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
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

    .piece.white i {
      color: #fff;
      filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
    }

    .piece.black i {
      color: #000;
      filter: drop-shadow(1px 1px 2px rgba(255, 255, 255, 0.5));
    }

    .selected {
      background-color: rgba(144, 238, 144, 0.5) !important;
    }

    .valid-move {
      position: relative;
    }

    .valid-move::after {
      content: '';
      position: absolute;
      width: 25%;
      height: 25%;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
    }

    .last-move {
      background-color: rgba(255, 255, 0, 0.3) !important;
    }

    .check {
      background-color: rgba(255, 0, 0, 0.3) !important;
    }

    .game-controls {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }

    .game-controls button {
      padding: 8px 16px;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      background-color: #4a5568;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .game-controls button:hover {
      background-color: #2d3748;
    }

    .game-controls button:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    .promotion-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .promotion-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .promotion-piece {
      font-size: 2rem;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .promotion-piece:hover {
      background-color: #f0f0f0;
    }
  `]
})
export class ChessComponent implements OnInit {
  gameState: GameState | null = null;
  selectedSquare: { row: number; col: number } | null = null;
  validMoves: { row: number; col: number }[] = [];
  showPromotionDialog = false;
  promotionMove: { from: { row: number; col: number }; to: { row: number; col: number } } | null = null;
  promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];
  isComputerPlayer: boolean = false;
  gameHistory: Array<{
    player: PieceColor;
    piece: Piece;
    from: { row: number; col: number };
    to: { row: number; col: number };
    captured: Piece | null;
    promotion: PieceType | null;
    boardState: (Piece | null)[][];
    status: string;
    isCheck: boolean;
    isCheckmate: boolean;
  }> = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
      this.updateValidMoves();
      this.updateGameHistory(state);
    });
  }

  getPieceAt(row: number, col: number): Piece | null {
    return this.gameState?.board[row]?.[col] || null;
  }

  getPieceClass(piece: Piece | null): string {
    if (!piece) return '';
    const icons: Record<PieceType, string> = {
      pawn: 'fa-solid fa-chess-pawn',
      rook: 'fa-solid fa-chess-rook',
      knight: 'fa-solid fa-chess-knight',
      bishop: 'fa-solid fa-chess-bishop',
      queen: 'fa-solid fa-chess-queen',
      king: 'fa-solid fa-chess-king'
    };
    return icons[piece.type];
  }

  onSquareClick(row: number, col: number): void {
    if (this.showPromotionDialog) return;

    const piece = this.getPieceAt(row, col);
    
    // If a square is already selected
    if (this.selectedSquare) {
      // If clicking on a valid move target
      if (this.isValidMoveTarget(row, col)) {
        this.makeMove(row, col);
      } else {
        // If clicking on another piece of the same color, select it instead
        if (piece?.color === this.gameState?.currentPlayer) {
          this.selectedSquare = { row, col };
          this.updateValidMoves();
        } else {
          // Otherwise, deselect the current piece
          this.selectedSquare = null;
          this.validMoves = [];
        }
      }
    } else {
      // If no square is selected, select the clicked piece if it's the current player's piece
      if (piece?.color === this.gameState?.currentPlayer) {
        this.selectedSquare = { row, col };
        this.updateValidMoves();
      }
    }
  }

  private makeMove(row: number, col: number): void {
    if (!this.selectedSquare || !this.gameState) return;

    const piece = this.getPieceAt(this.selectedSquare.row, this.selectedSquare.col);
    if (!piece) return;

    if (piece.type === 'pawn' && (row === 0 || row === 7)) {
      this.promotionMove = {
        from: this.selectedSquare,
        to: { row, col }
      };
      this.showPromotionDialog = true;
    } else {
      this.gameService.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
      this.selectedSquare = null;
      this.validMoves = [];
    }
  }

  promotePawn(pieceType: PieceType): void {
    if (!this.promotionMove || !this.gameState) return;

    this.gameService.makeMove(
      this.promotionMove.from.row,
      this.promotionMove.from.col,
      this.promotionMove.to.row,
      this.promotionMove.to.col,
      pieceType
    );

    this.showPromotionDialog = false;
    this.promotionMove = null;
    this.selectedSquare = null;
    this.validMoves = [];
  }

  private updateValidMoves(): void {
    if (!this.selectedSquare || !this.gameState) {
      this.validMoves = [];
      return;
    }

    const { row, col } = this.selectedSquare;
    const piece = this.getPieceAt(row, col);
    if (!piece) {
      this.validMoves = [];
      return;
    }

    this.validMoves = this.gameService.getValidMoves(row, col);
  }

  isSelected(row: number, col: number): boolean {
    return this.selectedSquare?.row === row && this.selectedSquare?.col === col;
  }

  isValidMoveTarget(row: number, col: number): boolean {
    return this.validMoves.some(move => move.row === row && move.col === col);
  }

  isLastMove(row: number, col: number): boolean {
    if (!this.gameState?.lastMove) return false;
    const { from, to } = this.gameState.lastMove;
    return (from.row === row && from.col === col) || (to.row === row && to.col === col);
  }

  isCheck(row: number, col: number): boolean {
    const piece = this.getPieceAt(row, col);
    return piece?.type === 'king' && this.gameState?.status === 'check';
  }

  getPieceSymbol(piece: Piece | null): string {
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

  getCapturedPieces(color: PieceColor): Piece[] {
    return this.gameState?.capturedPieces.filter(piece => piece.color === color) || [];
  }

  getStatusMessage(): string {
    if (!this.gameState) return '';
    switch (this.gameState.status) {
      case 'check':
        return `${this.gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check`;
      case 'checkmate':
        return `Checkmate! ${this.gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins`;
      case 'stalemate':
        return 'Stalemate! The game is a draw';
      case 'draw':
        return 'The game is a draw';
      default:
        return `${this.gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s turn`;
    }
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.selectedSquare = null;
    this.validMoves = [];
    this.showPromotionDialog = false;
    this.promotionMove = null;
    this.gameHistory = [];
  }

  undoMove(): void {
    this.gameService.undoMove();
    this.selectedSquare = null;
    this.validMoves = [];
  }

  canUndo(): boolean {
    return this.gameService.canUndo();
  }

  toggleComputerPlayer(): void {
    this.isComputerPlayer = !this.isComputerPlayer;
    this.gameService.setComputerPlayer(this.isComputerPlayer);
  }

  private updateGameHistory(state: GameState): void {
    if (state.lastMove) {
      const { from, to, promotion } = state.lastMove;
      const piece = state.board[to.row][to.col];
      if (piece) {
        const captured = state.capturedPieces[state.capturedPieces.length - 1] || null;
        this.gameHistory.push({
          player: piece.color,
          piece: piece,
          from: from,
          to: to,
          captured: captured,
          promotion: promotion || null,
          boardState: state.board.map(row => [...row]),
          status: state.status,
          isCheck: state.status === 'check',
          isCheckmate: state.status === 'checkmate'
        });
      }
    }
  }

  getSquareNotation(pos: { row: number; col: number }): string {
    const files = 'abcdefgh';
    const ranks = '87654321';
    return `${files[pos.col]}${ranks[pos.row]}`;
  }

  copyGameHistory(): void {
    const historyText = this.gameHistory.map((entry, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      const movePrefix = index % 2 === 0 ? `${moveNumber}.` : '...';
      const pieceSymbol = this.getPieceSymbol(entry.piece);
      const from = this.getSquareNotation(entry.from);
      const to = this.getSquareNotation(entry.to);
      const capture = entry.captured ? `x${this.getPieceSymbol(entry.captured)}` : '';
      const promotion = entry.promotion ? `=${this.getPieceSymbol({ type: entry.promotion, color: entry.player, hasMoved: true })}` : '';
      const check = entry.isCheck ? '+' : '';
      const checkmate = entry.isCheckmate ? '#' : '';
      const status = entry.status !== 'playing' ? ` (${entry.status})` : '';
      
      return `${movePrefix} ${pieceSymbol}${from}${capture}${to}${promotion}${check}${checkmate}${status}`;
    }).join('\n');

    navigator.clipboard.writeText(historyText).then(() => {
      // You could add a toast notification here
      console.log('Game history copied to clipboard');
    });
  }
} 