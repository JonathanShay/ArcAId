import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameMetadata } from './models/game-metadata.model';

@Injectable({
  providedIn: 'root'
})
export class GameDiscoveryService {
  private games = new BehaviorSubject<GameMetadata[]>([]);

  constructor() {
    // Games will be automatically discovered and registered
    this.discoverGames();
  }

  private discoverGames(): void {
    // In a real implementation, this would scan for game components
    // For now, we'll manually register the games
    const games: GameMetadata[] = [
      {
        id: 'ultimate-tic-tac-toe',
        title: 'Ultimate Tic-Tac-Toe',
        description: 'A strategic twist on the classic game of Tic-Tac-Toe. Play on a 3x3 grid of Tic-Tac-Toe boards.',
        thumbnail: 'assets/images/ultimate-tic-tac-toe.png',
        route: '/games/ultimate-tic-tac-toe',
        tags: ['strategy', 'classic', 'multiplayer'],
        difficulty: 'medium',
        estimatedPlaytime: '10-15 minutes'
      },
      {
        id: 'reversi',
        title: 'Reversi',
        description: 'A classic strategy game where players take turns placing pieces on the board, flipping opponent pieces.',
        thumbnail: 'assets/images/reversi.png',
        route: '/games/reversi',
        tags: ['strategy', 'classic', 'multiplayer'],
        difficulty: 'medium',
        estimatedPlaytime: '15-20 minutes'
      },
      {
        id: 'checkers',
        title: 'Checkers',
        description: 'A classic board game where players move their pieces diagonally and capture opponent pieces by jumping over them.',
        thumbnail: 'assets/images/checkers.png',
        route: '/games/checkers',
        tags: ['strategy', 'classic', 'multiplayer'],
        difficulty: 'easy',
        estimatedPlaytime: '10-15 minutes'
      },
      {
        id: 'chess',
        title: 'Chess',
        description: 'The classic game of strategy and tactics. Play against a friend or challenge yourself against the computer.',
        thumbnail: 'assets/images/chess.png',
        route: '/games/chess',
        tags: ['strategy', 'classic', 'multiplayer'],
        difficulty: 'hard',
        estimatedPlaytime: '30-60 minutes'
      },
      {
        id: 'connect-four',
        title: 'Connect Four',
        description: 'A classic vertical strategy game where players try to connect four of their pieces in a row.',
        thumbnail: 'preview',
        route: '/games/connect-four',
        tags: ['strategy', 'classic', 'multiplayer'],
        difficulty: 'easy',
        estimatedPlaytime: '5-10 minutes'
      }
    ];

    this.games.next(games);
  }

  getGames(): Observable<GameMetadata[]> {
    return this.games.asObservable();
  }

  getGameById(id: string): GameMetadata | undefined {
    return this.games.value.find(game => game.id === id);
  }
} 