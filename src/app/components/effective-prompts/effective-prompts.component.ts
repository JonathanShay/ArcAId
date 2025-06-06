import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { trigger, transition, style, animate } from '@angular/animations';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { ThemeService } from '../../services/theme.service';
import { catchError, timeout } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Configure marked with syntax highlighting
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

// Configure highlight.js
hljs.configure({
  ignoreUnescapedHTML: true,
  noHighlightRe: /^(no-?highlight)$/i,
  languages: ['typescript', 'javascript', 'html', 'css', 'json', 'bash', 'markdown']
});

interface Snippet {
  title: string;
  content: string;
  filename: string;
  entries?: ConversationEntry[];
}

interface ConversationEntry {
  content: string;
  response?: string;
}

@Component({
  selector: 'app-effective-prompts',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './effective-prompts.component.html',
  styleUrls: ['./effective-prompts.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class EffectivePromptsComponent implements OnInit, OnDestroy {
  snippets: Snippet[] = [];
  loading = true;
  error: string | null = null;
  isDarkMode = false;
  private isLoading = false;
  private destroy$ = new Subject<void>();

  @HostBinding('class.dark') get darkModeClass() {
    return this.isDarkMode;
  }

  constructor(
    private http: HttpClient,
    private themeService: ThemeService
  ) {
    console.log('Component constructor called');
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });
  }

  ngOnInit() {
    console.log('Component initialized');
    if (!this.isLoading && this.snippets.length === 0) {
      this.loadSnippets();
    }
  }

  ngOnDestroy() {
    console.log('Component being destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadSnippets() {
    if (this.isLoading) {
      console.log('Already loading snippets, skipping...');
      return;
    }

    try {
      this.isLoading = true;
      console.log('Starting to load snippets...');
      const filename = 'effective-prompting.md';
      const url = `assets/effective-prompting/${filename}`;
      console.log('Attempting to fetch from:', url);

      const response = await fetch(url);
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const content = await response.text();
      console.log('Successfully loaded content, length:', content.length);
      console.log('Content preview:', content.substring(0, 100));
      
      const title = this.extractTitle(content);
      console.log('Extracted title:', title);
      
      if (this.snippets.length === 0) {
        const entries = this.parseConversation(content);
        this.snippets = [{ title, content, filename, entries }];
        console.log('Snippets array updated:', this.snippets);
      } else {
        console.log('Snippets already loaded, skipping update');
      }
    } catch (error) {
      console.error('Error in loadSnippets:', error);
      this.error = 'Failed to load content. Please try refreshing the page.';
    } finally {
      this.loading = false;
      this.isLoading = false;
      console.log('Loading complete');
    }
  }

  private extractTitle(content: string): string {
    const firstLine = content.split('\n')[0];
    const title = firstLine.replace(/^#\s+/, '');
    console.log('Extracting title from:', firstLine);
    console.log('Extracted title:', title);
    return title;
  }

  private parseConversation(content: string): ConversationEntry[] {
    console.log('Parsing conversation content');
    const entries: ConversationEntry[] = [];
    let currentEntry: ConversationEntry | null = null;
    let currentContent: string[] = [];
    let isUserSection = false;
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('**User**')) {
        if (currentEntry) {
          currentEntry.content = currentContent.join('\n').trim();
          entries.push(currentEntry);
        }
        currentEntry = { content: '' };
        currentContent = [];
        isUserSection = true;
      } else if (line.includes('**Cursor**')) {
        if (currentEntry) {
          currentEntry.content = currentContent.join('\n').trim();
          if (isUserSection) {
            entries.push(currentEntry);
          }
          currentEntry = { content: '' };
          currentContent = [];
          isUserSection = false;
        }
      } else if (currentEntry) {
        currentContent.push(line);
      }
    }
    
    if (currentEntry && currentContent.length > 0) {
      currentEntry.content = currentContent.join('\n').trim();
      entries.push(currentEntry);
    }
    
    // Pair up entries for responses
    for (let i = 0; i < entries.length - 1; i += 2) {
      entries[i].response = entries[i + 1].content;
    }
    
    console.log('Parsed entries:', entries);
    return entries;
  }
}
