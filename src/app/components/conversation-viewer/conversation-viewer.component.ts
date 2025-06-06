import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConversationService, Conversation } from '../../services/conversation.service';
import { MarkdownModule } from 'ngx-markdown';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

// Configure marked with Prism.js syntax highlighting
marked.use(markedHighlight({
  langPrefix: 'language-',
  highlight(code: string, lang: string) {
    const language = Prism.languages[lang] ? lang : 'plaintext';
    return Prism.highlight(code, Prism.languages[language], language);
  }
}));

@Component({
  selector: 'app-conversation-viewer',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity backdrop-blur-sm"></div>

      <!-- Modal panel -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          <!-- Close button -->
          <div class="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              class="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              (click)="close()"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>

          <!-- Error state -->
          <div *ngIf="error" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No conversation found</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">There is no conversation available for this page.</p>
          </div>

          <!-- Content -->
          <div *ngIf="!isLoading && !error && conversation" class="mt-3 text-center sm:mt-0 sm:text-left">
            <h3 *ngIf="conversation.title" class="text-2xl font-semibold leading-6 text-gray-900 dark:text-white mb-6">
              {{ conversation.title }}
            </h3>
            
            <div class="space-y-6">
              <ng-container *ngFor="let entry of conversation.entries; let i = index">
                <div *ngIf="i % 2 === 0" class="space-y-0">
                  <!-- User prompt -->
                  <div class="relative rounded-t-lg p-4 transition-all duration-300 border-b-0 border"
                       [ngClass]="{
                         'bg-indigo-50 dark:bg-gray-900 border-indigo-100 dark:border-gray-900': true
                       }">
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 flex items-center justify-center shadow-sm">
                          <span class="text-white text-sm font-medium">U</span>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          User
                        </div>
                        <div class="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                          <markdown [data]="entry.content" [lineNumbers]="true"></markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Cursor response -->
                  <div *ngIf="conversation.entries[i + 1]" class="relative rounded-b-lg p-4 transition-all duration-300 border"
                       [ngClass]="{
                         'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-900': true
                       }">
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 flex items-center justify-center shadow-sm">
                          <span class="text-white text-sm font-medium">C</span>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Cursor
                        </div>
                        <div class="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                          <div class="max-h-[20em] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-900">
                            <markdown [data]="conversation.entries[i + 1].content" [lineNumbers]="true"></markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `:host ::ng-deep .prose pre {
      margin: 0 !important;
      padding: 1rem !important;
      background-color: transparent !important;
      max-height: 20em !important;
      overflow-y: auto !important;
      scrollbar-width: thin;
      scrollbar-color: #818cf8 #f8fafc;
    }

    /* Hide horizontal rules */
    :host ::ng-deep .prose hr {
      display: none !important;
    }

    /* Webkit scrollbar styling */
    :host ::ng-deep .prose pre::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    :host ::ng-deep .prose pre::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 4px;
    }

    :host ::ng-deep .prose pre::-webkit-scrollbar-thumb {
      background: #818cf8;
      border-radius: 4px;
      border: 2px solid #f8fafc;
      transition: background-color 0.2s ease;
    }

    :host ::ng-deep .prose pre::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }

    /* Dark mode scrollbar styling */
    :host ::ng-deep .dark .prose pre {
      scrollbar-color: #818cf8 #1e1b4b;
    }

    :host ::ng-deep .dark .prose pre::-webkit-scrollbar-track {
      background: #1e1b4b;
    }

    :host ::ng-deep .dark .prose pre::-webkit-scrollbar-thumb {
      background: #818cf8;
      border: 2px solid #1e1b4b;
    }

    :host ::ng-deep .dark .prose pre::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }

    /* Response container scrollbar styling */
    :host ::ng-deep .prose .max-h-\[20em\] {
      scrollbar-width: thin;
      scrollbar-color: #818cf8 #f8fafc;
    }

    :host ::ng-deep .prose .max-h-\[20em\]::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    :host ::ng-deep .prose .max-h-\[20em\]::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 4px;
    }

    :host ::ng-deep .prose .max-h-\[20em\]::-webkit-scrollbar-thumb {
      background: #818cf8;
      border-radius: 4px;
      border: 2px solid #f8fafc;
      transition: background-color 0.2s ease;
    }

    :host ::ng-deep .prose .max-h-\[20em\]::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }

    /* Dark mode response container scrollbar styling */
    :host ::ng-deep .dark .prose .max-h-\[20em\] {
      scrollbar-color: #818cf8 #1e1b4b;
    }

    :host ::ng-deep .dark .prose .max-h-\[20em\]::-webkit-scrollbar-track {
      background: #1e1b4b;
    }

    :host ::ng-deep .dark .prose .max-h-\[20em\]::-webkit-scrollbar-thumb {
      background: #818cf8;
      border: 2px solid #1e1b4b;
    }

    :host ::ng-deep .dark .prose .max-h-\[20em\]::-webkit-scrollbar-thumb:hover {
      background: #6366f1;
    }

    :host ::ng-deep .prose pre code {
      padding: 0 !important;
      background-color: transparent !important;
    }

    /* Dark mode adjustments for Prism.js */
    :host ::ng-deep .dark .prose pre {
      background-color: #2d2d2d !important;
    }

    :host ::ng-deep .dark .prose pre code {
      color: #ccc !important;
    }

    /* Prism.js syntax highlighting */
    :host ::ng-deep .token.comment,
    :host ::ng-deep .token.prolog,
    :host ::ng-deep .token.doctype,
    :host ::ng-deep .token.cdata {
      color: #8e908c;
    }

    :host ::ng-deep .token.namespace {
      opacity: .7;
    }

    :host ::ng-deep .token.string,
    :host ::ng-deep .token.attr-value {
      color: #718c00;
    }

    :host ::ng-deep .token.punctuation,
    :host ::ng-deep .token.operator {
      color: #8e908c;
    }

    :host ::ng-deep .token.entity,
    :host ::ng-deep .token.url,
    :host ::ng-deep .token.symbol,
    :host ::ng-deep .token.number,
    :host ::ng-deep .token.boolean,
    :host ::ng-deep .token.variable,
    :host ::ng-deep .token.constant,
    :host ::ng-deep .token.property,
    :host ::ng-deep .token.regex,
    :host ::ng-deep .token.inserted {
      color: #f5871f;
    }

    :host ::ng-deep .token.atrule,
    :host ::ng-deep .token.keyword,
    :host ::ng-deep .token.attr-name {
      color: #8959a8;
    }

    :host ::ng-deep .token.language-autohotkey,
    :host ::ng-deep .token.language-autohotkey .token.string {
      color: #718c00;
    }

    :host ::ng-deep .token.function,
    :host ::ng-deep .token.deleted {
      color: #c82829;
    }

    :host ::ng-deep .token.tag,
    :host ::ng-deep .token.selector,
    :host ::ng-deep .token.important {
      color: #c82829;
    }

    :host ::ng-deep .token.important,
    :host ::ng-deep .token.bold {
      font-weight: bold;
    }

    :host ::ng-deep .token.italic {
      font-style: italic;
    }

    /* Dark mode syntax highlighting */
    :host ::ng-deep .dark .token.comment,
    :host ::ng-deep .dark .token.prolog,
    :host ::ng-deep .dark .token.doctype,
    :host ::ng-deep .dark .token.cdata {
      color: #969896;
    }

    :host ::ng-deep .dark .token.string,
    :host ::ng-deep .dark .token.attr-value {
      color: #b5bd68;
    }

    :host ::ng-deep .dark .token.punctuation,
    :host ::ng-deep .dark .token.operator {
      color: #969896;
    }

    :host ::ng-deep .dark .token.entity,
    :host ::ng-deep .dark .token.url,
    :host ::ng-deep .dark .token.symbol,
    :host ::ng-deep .dark .token.number,
    :host ::ng-deep .dark .token.boolean,
    :host ::ng-deep .dark .token.variable,
    :host ::ng-deep .dark .token.constant,
    :host ::ng-deep .dark .token.property,
    :host ::ng-deep .dark .token.regex,
    :host ::ng-deep .dark .token.inserted {
      color: #f5871f;
    }

    :host ::ng-deep .dark .token.atrule,
    :host ::ng-deep .dark .token.keyword,
    :host ::ng-deep .dark .token.attr-name {
      color: #b294bb;
    }

    :host ::ng-deep .dark .token.function,
    :host ::ng-deep .dark .token.deleted {
      color: #cc6666;
    }

    :host ::ng-deep .dark .token.tag,
    :host ::ng-deep .dark .token.selector,
    :host ::ng-deep .dark .token.important {
      color: #cc6666;
    }`
  ]
})
export class ConversationViewerComponent implements OnInit {
  isOpen = false;
  isLoading = false;
  error = false;
  conversation: Conversation | null = null;

  constructor(
    private conversationService: ConversationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to conversation updates
    this.conversationService.getCurrentConversation().subscribe(conversation => {
      this.conversation = conversation;
      this.error = conversation.entries.length === 0;
    });
  }

  open() {
    console.log('Opening conversation viewer');
    this.isOpen = true;
    this.loadConversation();
  }

  close() {
    console.log('Closing conversation viewer');
    this.isOpen = false;
    this.conversation = null;
    this.error = false;
  }

  private loadConversation() {
    console.log('Loading conversation');
    this.isLoading = true;
    this.error = false;

    // Get the current route path
    const path = this.router.url === '/' ? 'root' : this.router.url.substring(1);
    console.log('Current path:', path);

    this.conversationService.loadConversation(path).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading conversation:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }
} 