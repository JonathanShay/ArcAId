import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { LandingComponent } from './components/landing/landing.component';
import { UltimateTicTacToeComponent } from './components/ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { ReversiComponent } from './components/reversi/reversi.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'about', component: AboutComponent },
  { path: 'games/ultimate-tic-tac-toe', component: UltimateTicTacToeComponent },
  { path: 'games/reversi', component: ReversiComponent },
  { path: '**', redirectTo: '' }
]; 