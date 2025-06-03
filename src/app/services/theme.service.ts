import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.next(savedTheme === 'dark');
    } else {
      this.isDarkMode.next(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.updateTheme();
  }

  toggleTheme() {
    this.isDarkMode.next(!this.isDarkMode.value);
    this.updateTheme();
  }

  private updateTheme() {
    const isDark = this.isDarkMode.value;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
} 