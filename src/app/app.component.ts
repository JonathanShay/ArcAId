import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavComponent],
  template: `
    <div class="app-container sheen">
      <app-nav></app-nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: transparent;
    }

    .dark .app-container {
      background: linear-gradient(to right, #1f2937, #111827);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  title = 'ArcAId';
} 