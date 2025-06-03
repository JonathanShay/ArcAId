import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GameMetadata {
  title: string;
  description: string;
  thumbnail: string;
  route: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedPlayTime: string;
}

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
    // For now, we'll manually register the Ultimate Tic-Tac-Toe game
    const games: GameMetadata[] = [
      {
        title: 'Ultimate Tic-Tac-Toe',
        description: 'A strategic twist on the classic game of Tic-Tac-Toe. Play on a 3x3 grid of 3x3 boards!',
        thumbnail: 'assets/images/ultimate-tic-tac-toe-thumbnail.png',
        route: '/games/ultimate-tic-tac-toe',
        tags: ['strategy', 'board-game', 'multiplayer'],
        difficulty: 'medium',
        estimatedPlayTime: '10-15 minutes'
      }
    ];

    this.games.next(games);
  }

  getGames(): Observable<GameMetadata[]> {
    return this.games.asObservable();
  }

  getGameByRoute(route: string): GameMetadata | undefined {
    return this.games.value.find(game => game.route === route);
  }
} 