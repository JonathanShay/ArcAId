# Move available games section to top
_Exported on 6/4/2025 at 12:57:54 EDT from Cursor (0.50.7)_

---

**User**

On the main landing page lets move the "Available Games" section to the top of the page.

---

**Cursor**

I'll help you move the "Available Games" section to the top of the landing page. First, let me search for the relevant code.


Let me help you move the "Available Games" section to the top of the landing page. I'll edit the landing component to reorder the sections.


```typescript
// ... existing code ...
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
                      <ng-container *ngIf="game.title === 'Reversi'; else gameImage">
                        <app-reversi-preview></app-reversi-preview>
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
                      <span>{{ game.estimatedPlayTime }}</span>
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
// ... existing code ...
```

I've moved the "Available Games" section to the top of the landing page, placing it before the Mission Statement section. The games section now appears first when users visit the page, making it more prominent and immediately accessible. The layout and styling of the games section remain the same, just in a new position.

Is there anything else you'd like me to adjust about the landing page layout?

---

**User**

Let's commit this change

---

**Cursor**

I'll help you commit the change to move the "Available Games" section to the top of the landing page.


I've committed the changes to move the "Available Games" section to the top of the landing page. The commit has been created with the message "Move Available Games section to top of landing page". The changes have been successfully saved to your repository.

Is there anything else you'd like me to help you with?

