import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameDiscoveryService } from '../../services/game-discovery.service';
import { GameMetadata } from '../../services/models/game-metadata.model';
import { UltimateTicTacToePreviewComponent } from '../ultimate-tic-tac-toe/components/ultimate-tic-tac-toe-preview.component';
import { ReversiPreviewComponent } from '../reversi/reversi-preview.component';
import { CheckersPreviewComponent } from '../checkers/checkers-preview.component';
import { ChessPreviewComponent } from '../chess/chess-preview.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    UltimateTicTacToePreviewComponent, 
    ReversiPreviewComponent,
    CheckersPreviewComponent,
    ChessPreviewComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div class="px-4 py-6 sm:px-0">
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div class="relative rounded-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-gray-800/80 shadow-lg">
            <!-- Games Section -->
            <div class="px-6 pt-12 sm:px-12 lg:px-16">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Available Games
              </h2>
              <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div *ngFor="let game of games" class="relative group">
                  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div class="relative rounded-lg p-6 bg-white dark:bg-gray-800">
                    <ng-container *ngIf="game.title === 'Ultimate Tic-Tac-Toe'; else reversiPreview">
                      <app-ultimate-tic-tac-toe-preview></app-ultimate-tic-tac-toe-preview>
                    </ng-container>
                    <ng-template #reversiPreview>
                      <ng-container *ngIf="game.title === 'Reversi'; else checkersPreview">
                        <app-reversi-preview></app-reversi-preview>
                      </ng-container>
                    </ng-template>
                    <ng-template #checkersPreview>
                      <ng-container *ngIf="game.title === 'Checkers'; else chessPreview">
                        <app-checkers-preview></app-checkers-preview>
                      </ng-container>
                    </ng-template>
                    <ng-template #chessPreview>
                      <ng-container *ngIf="game.title === 'Chess'; else gameImage">
                        <app-chess-preview></app-chess-preview>
                      </ng-container>
                    </ng-template>
                    <ng-template #gameImage>
                      <img [src]="game.thumbnail" [alt]="game.title" class="w-full h-48 object-cover rounded-lg mb-4">
                    </ng-template>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">{{ game.title }}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4">{{ game.description }}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span *ngFor="let tag of game.tags" 
                            class="px-2 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full">
                        {{ tag }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Difficulty: {{ game.difficulty }}</span>
                      <span>{{ game.estimatedPlaytime }}</span>
                    </div>
                    <a [routerLink]="game.route" 
                       class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200">
                      Play Now
                      <svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mission Statement -->
            <div class="px-6 pt-12 sm:px-12 lg:px-16">
              <div class="text-center">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  The Arc<span class="text-purple-600 dark:text-purple-400 font-extrabold font-serif">AI</span>d Project
                </h2>
                <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Our mission is to push the boundaries of AI-assisted development by letting Cursor write 100% of the code. 
                  This is an experiment in understanding the capabilities and limitations of AI pair programming.
                </p>
                <div class="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p class="text-lg text-indigo-700 dark:text-indigo-300">
                    "While this project takes an extreme approach, it's important to understand that Cursor was designed 
                    to be a collaborative tool that enhances human creativity, not replace it. The following sections 
                    explain how Cursor is meant to be used in real-world development."
                  </p>
                </div>
              </div>
            </div>

            <!-- Hero Section -->
            <div class="px-6 py-12 sm:px-12 lg:px-16">
              <div class="text-center">
                <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span class="block">Your AI Pair Programmer</span>
                  <span class="block text-indigo-600 dark:text-indigo-400">That Empowers Your Creativity</span>
                </h1>
                <p class="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                  Cursor isn't here to replace you – it's here to amplify your capabilities. 
                  Focus on what matters: solving complex problems, architecting elegant solutions, 
                  and bringing your creative vision to life.
                </p>
              </div>

              <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Feature 1 -->
                <div class="relative rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20"></div>
                  <div class="relative">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Focus on Architecture</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-300">
                      Let Cursor handle the boilerplate while you focus on system design and architecture decisions.
                    </p>
                  </div>
                </div>

                <!-- Feature 2 -->
                <div class="relative rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20"></div>
                  <div class="relative">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Accelerate Development</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-300">
                      Write code faster with AI assistance that understands your context and coding style.
                    </p>
                  </div>
                </div>

                <!-- Feature 3 -->
                <div class="relative rounded-lg p-6 bg-white dark:bg-gray-800">
                  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20"></div>
                  <div class="relative">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Learn and Grow</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-300">
                      Use Cursor as a learning tool to understand new patterns and best practices.
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-12 text-center">
                <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-6 py-3 border border-gray-800 dark:border-gray-900 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200">
                  Experience Cursor
                  <svg class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  games: GameMetadata[] = [];

  constructor(private gameDiscoveryService: GameDiscoveryService) {}

  ngOnInit(): void {
    this.gameDiscoveryService.getGames().subscribe(games => {
      this.games = games;
    });
  }
} 