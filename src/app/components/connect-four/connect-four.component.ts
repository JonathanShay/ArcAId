import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameState, Player } from './models/game.models';

@Component({
  selector: 'app-connect-four',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-board">
        <div class="board-header">
          <div *ngFor="let col of [0,1,2,3,4,5,6]" 
               class="column-header"
               (click)="makeMove(col)"
               [class.valid-move]="isValidMove(col)">
            <div class="arrow">▼</div>
          </div>
        </div>
        <div class="board">
          <div *ngFor="let row of gameState.board; let rowIndex = index" class="row">
            <div *ngFor="let cell of row; let colIndex = index" 
                 class="cell"
                 [class.red]="cell === 'R'"
                 [class.yellow]="cell === 'Y'"
                 [class.last-move]="isLastMove(rowIndex, colIndex)">
            </div>
          </div>
        </div>
      </div>

      <div class="game-controls">
        <div class="status">
          <ng-container [ngSwitch]="gameState.gameStatus">
            <div *ngSwitchCase="'playing'">
              Current Player: 
              <span [class.red]="gameState.currentPlayer === 'R'"
                    [class.yellow]="gameState.currentPlayer === 'Y'">
                {{ gameState.currentPlayer === 'R' ? 'Red' : 'Yellow' }}
              </span>
            </div>
            <div *ngSwitchCase="'won'">
              Winner: 
              <span [class.red]="gameState.winner === 'R'"
                    [class.yellow]="gameState.winner === 'Y'">
                {{ gameState.winner === 'R' ? 'Red' : 'Yellow' }}
              </span>
            </div>
            <div *ngSwitchCase="'draw'">Game ended in a draw!</div>
          </ng-container>
        </div>

        <div class="buttons">
          <button (click)="resetGame()">New Game</button>
          <button (click)="undoMove()" [disabled]="!canUndo()">Undo</button>
          <button (click)="copyGameHistory()">Copy Game History</button>
        </div>

        <div class="computer-settings">
          <label>
            <input type="checkbox" 
                   [checked]="isComputerPlayer" 
                   (change)="toggleComputerPlayer($event)">
            Play against computer
          </label>
          <select [value]="computerPlayer" 
                  (change)="setComputerPlayer($event)"
                  [disabled]="!isComputerPlayer">
            <option value="R">Red</option>
            <option value="Y">Yellow</option>
          </select>
        </div>
      </div>

      <div class="game-history" *ngIf="gameStateHistory.length > 1">
        <h3>Game History</h3>
        <div class="history-entries">
          <div *ngFor="let entry of gameStateHistory.slice(1); let i = index" 
               class="history-entry"
               [class.current]="i === gameStateHistory.length - 2">
            Move {{i + 1}}: 
            <span [class.red]="entry.move?.player === 'R'"
                  [class.yellow]="entry.move?.player === 'Y'">
              {{entry.move?.player === 'R' ? 'Red' : 'Yellow'}}
            </span>
            in column {{entry.move?.column! + 1}}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      gap: 2rem;
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .game-board {
      flex: 1;
      max-width: 600px;
    }

    .board-header {
      display: flex;
      justify-content: space-around;
      margin-bottom: 0.5rem;
    }

    .column-header {
      width: 60px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .column-header:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .column-header.valid-move:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .arrow {
      color: #666;
      font-size: 1.2rem;
    }

    .board {
      background-color: #2196F3;
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .row {
      display: flex;
      justify-content: space-around;
    }

    .cell {
      width: 60px;
      height: 60px;
      background-color: white;
      border-radius: 50%;
      margin: 5px;
      transition: background-color 0.3s;
    }

    .cell.red {
      background-color: #f44336;
    }

    .cell.yellow {
      background-color: #ffeb3b;
    }

    .cell.last-move {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .game-controls {
      width: 300px;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: bold;
    }

    .buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #2196F3;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #1976D2;
    }

    button:disabled {
      background-color: #BDBDBD;
      cursor: not-allowed;
    }

    .computer-settings {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .computer-settings label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .computer-settings select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #BDBDBD;
    }

    .game-history {
      width: 300px;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .history-entries {
      max-height: 400px;
      overflow-y: auto;
    }

    .history-entry {
      padding: 0.5rem;
      border-bottom: 1px solid #E0E0E0;
    }

    .history-entry.current {
      background-color: #E3F2FD;
    }

    .red {
      color: #f44336;
    }

    .yellow {
      color: #ffeb3b;
    }
  `]
})
export class ConnectFourComponent implements OnInit {
  gameState: GameState;
  gameStateHistory: { state: GameState; move: { column: number; player: Player } | null }[] = [];
  isComputerPlayer: boolean = false;
  computerPlayer: Player = 'Y';

  constructor(private gameService: GameService) {
    this.gameState = {
      board: Array(6).fill(null).map(() => Array(7).fill(null)),
      currentPlayer: 'R',
      gameStatus: 'playing',
      winner: null,
      lastMove: null,
      validMoves: Array.from({ length: 7 }, (_, i) => i)
    };
  }

  ngOnInit(): void {
    this.gameService.getGameState().subscribe(state => {
      this.gameState = state;
    });

    this.gameStateHistory = this.gameService.getGameStateHistory();
  }

  makeMove(column: number): void {
    this.gameService.makeMove(column);
  }

  isValidMove(column: number): boolean {
    return this.gameState.validMoves.includes(column);
  }

  isLastMove(row: number, col: number): boolean {
    const lastMove = this.gameState.lastMove;
    if (!lastMove) return false;

    // Find the row where the last piece was placed
    let lastRow = 0;
    while (lastRow < 6 && this.gameState.board[lastRow][lastMove.column] === null) {
      lastRow++;
    }
    lastRow--;

    return row === lastRow && col === lastMove.column;
  }

  resetGame(): void {
    this.gameService.resetGame();
  }

  undoMove(): void {
    this.gameService.undoMove();
  }

  canUndo(): boolean {
    return this.gameService.canUndo();
  }

  copyGameHistory(): void {
    const historyString = this.gameService.getGameHistoryString();
    navigator.clipboard.writeText(historyString)
      .then(() => alert('Game history copied to clipboard!'))
      .catch(err => console.error('Failed to copy game history:', err));
  }

  toggleComputerPlayer(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isComputerPlayer = checkbox.checked;
    this.gameService.setComputerEnabled(this.isComputerPlayer);
  }

  setComputerPlayer(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.computerPlayer = select.value as Player;
    this.gameService.setComputerPlayer(this.computerPlayer);
  }
} 