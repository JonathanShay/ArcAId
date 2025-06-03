import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationViewerComponent } from '../conversation-viewer/conversation-viewer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ConversationViewerComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300 ease-in-out">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl animate-fade-in">
            <span class="block">The 100% AI</span>
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Development Experiment
            </span>
          </h1>
          <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
            This project pushes the boundaries of AI-assisted development by letting Cursor write every single line of code.
            It's an exploration of what's possible when we let AI take the wheel completely.
          </p>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <!-- Left Column -->
          <div class="space-y-8">
            <div class="relative group">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div class="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Experiment</h2>
                <p class="text-gray-600 dark:text-gray-300">
                  ArcAId is a bold experiment in AI-driven development. By letting Cursor write 100% of the code,
                  we're exploring the current capabilities and limitations of AI pair programming. This project
                  serves as both a demonstration and a learning experience.
                </p>
              </div>
            </div>

            <div class="relative group">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div class="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Process</h2>
                <p class="text-gray-600 dark:text-gray-300">
                  Every line of code, every component, and every feature in this project was written by Cursor.
                  The development process involved providing clear instructions and requirements, then letting
                  Cursor handle the implementation details. The results have been fascinating and insightful.
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            <div class="relative group">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div class="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Learnings</h2>
                <ul class="space-y-4 text-gray-600 dark:text-gray-300">
                  <li class="flex items-start">
                    <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>AI can handle complex architectural decisions and implement them effectively</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Modern design patterns and best practices are consistently applied</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Code quality and maintainability are maintained at a high standard</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="relative group">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div class="relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Future</h2>
                <p class="text-gray-600 dark:text-gray-300">
                  While this project demonstrates the impressive capabilities of AI in development,
                  it's important to note that Cursor is designed to be a collaborative tool that enhances
                  human creativity, not replace it. The future of development lies in the synergy between
                  human expertise and AI assistance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-16 text-center">
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div class="relative p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Explore?</h2>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Check out the conversation that generated this content and see how Cursor built this project
                from scratch.
              </p>
              <button (click)="conversationViewer.open()" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                View Conversation
                <svg class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-conversation-viewer #conversationViewer></app-conversation-viewer>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.8s ease-out forwards;
    }

    .animate-fade-in-delay {
      animation: fadeIn 0.8s ease-out 0.2s forwards;
      opacity: 0;
    }
  `]
})
export class AboutComponent {} 