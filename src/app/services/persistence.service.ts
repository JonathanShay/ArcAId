import { Injectable } from '@angular/core';
import { DifficultyLevel } from '../components/reversi/models/game.models';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private readonly SCOREBOARD_KEY = 'reversi_scoreboard';
  private readonly DIFFICULTY_KEY = 'reversi_difficulty';

  constructor() {}

  saveScoreboard(scoreboard: { black: number; white: number; draws: number }): void {
    localStorage.setItem(this.SCOREBOARD_KEY, JSON.stringify(scoreboard));
  }

  getScoreboard(): { black: number; white: number; draws: number } {
    const saved = localStorage.getItem(this.SCOREBOARD_KEY);
    return saved ? JSON.parse(saved) : { black: 0, white: 0, draws: 0 };
  }

  resetScoreboard(): void {
    localStorage.removeItem(this.SCOREBOARD_KEY);
  }

  saveDifficulty(difficulty: DifficultyLevel): void {
    localStorage.setItem(this.DIFFICULTY_KEY, difficulty);
  }

  getDifficulty(): DifficultyLevel {
    return (localStorage.getItem(this.DIFFICULTY_KEY) as DifficultyLevel) || 'medium';
  }
} 