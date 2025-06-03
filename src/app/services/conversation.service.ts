import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  title?: string;
  entries: ConversationEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private currentConversation = new BehaviorSubject<Conversation>({ entries: [] });

  constructor(private http: HttpClient) {}

  private loadSingleConversation(path: string): Observable<Conversation> {
    return this.http.get(path, { responseType: 'text' }).pipe(
      map(content => {
        const entries: ConversationEntry[] = [];
        const lines = content.split('\n');
        let currentEntry: ConversationEntry | null = null;
        let title: string | undefined;

        // Extract title if it exists
        if (lines[0].startsWith('# ')) {
          title = lines[0].substring(2).trim();
        }

        for (const line of lines) {
          if (line.startsWith('**User**')) {
            if (currentEntry) {
              entries.push(currentEntry);
            }
            currentEntry = { role: 'user', content: '' };
          } else if (line.startsWith('**Cursor**')) {
            if (currentEntry) {
              entries.push(currentEntry);
            }
            currentEntry = { role: 'assistant', content: '' };
          } else if (currentEntry) {
            currentEntry.content += line + '\n';
          }
        }

        if (currentEntry) {
          entries.push(currentEntry);
        }

        return { entries, title };
      }),
      catchError(() => of({ entries: [] }))
    );
  }

  loadConversation(path: string): Observable<Conversation> {
    const basePath = `assets/conversations/${path}.md`;
    
    // Reset the current conversation
    this.currentConversation.next({ entries: [] });
    
    // First try to load the base conversation
    return this.loadSingleConversation(basePath).pipe(
      tap(baseConversation => {
        if (baseConversation.entries.length > 0) {
          this.currentConversation.next(baseConversation);
        }
      }),
      switchMap(baseConversation => {
        // If base conversation is empty, return it immediately
        if (baseConversation.entries.length === 0) {
          return of(baseConversation);
        }

        // Try to load numbered conversations sequentially
        const loadNextConversation = (index: number): Observable<Conversation> => {
          if (index > 10) { // Limit to 10 numbered files
            return of(this.currentConversation.value);
          }

          const numberedPath = `assets/conversations/${path}_${index}.md`;
          return this.loadSingleConversation(numberedPath).pipe(
            switchMap(nextConversation => {
              if (nextConversation.entries.length === 0) {
                // If no more conversations found, return what we have
                return of(this.currentConversation.value);
              }

              // Merge the conversations
              const mergedEntries = [
                ...this.currentConversation.value.entries,
                ...nextConversation.entries
              ];

              // Update the current conversation
              const mergedConversation = {
                entries: mergedEntries,
                title: baseConversation.title
              };
              this.currentConversation.next(mergedConversation);

              // Try to load the next numbered conversation
              return loadNextConversation(index + 1);
            })
          );
        };

        return loadNextConversation(1);
      })
    );
  }

  getCurrentConversation(): Observable<Conversation> {
    return this.currentConversation.asObservable();
  }
} 