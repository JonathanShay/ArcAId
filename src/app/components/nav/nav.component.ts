import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConversationViewerComponent } from '../conversation-viewer/conversation-viewer.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, ConversationViewerComponent],
  template: `
    <nav class="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-all duration-300 ease-in-out backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" 
                 class="relative text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300 ease-in-out hover:scale-105 group">
                <span class="relative">
                  Arc<span class="text-purple-600 dark:text-purple-400 font-extrabold font-serif">AI</span>d
                  <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 transition-all duration-300 ease-in-out group-hover:w-full"></span>
                </span>
              </a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Snippets Button -->
            <a routerLink="/effective-prompts"
               class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all duration-300 ease-in-out group"
               title="View effective prompts">
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </a>

            <!-- About Button -->
            <a routerLink="/about"
               class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all duration-300 ease-in-out group"
               title="Learn more about this project">
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>

            <!-- Conversation Viewer Button -->
            <button
              (click)="conversationViewer.open()"
              class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all duration-300 ease-in-out group"
              title="View the conversation that generated this content"
            >
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>

            <!-- Theme Toggle Button -->
            <button
              (click)="themeService.toggleTheme()"
              class="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all duration-300 ease-in-out group"
              title="Toggle between light and dark mode"
            >
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg
                *ngIf="(themeService.isDarkMode$ | async)"
                class="w-6 h-6 transition-all duration-300 ease-in-out transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
              <svg
                *ngIf="!(themeService.isDarkMode$ | async)"
                class="w-6 h-6 transition-all duration-300 ease-in-out transform group-hover:-rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <app-conversation-viewer #conversationViewer></app-conversation-viewer>
  `,
  styles: []
})
export class NavComponent {
  constructor(public themeService: ThemeService) {}
} 