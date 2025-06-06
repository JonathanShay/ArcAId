import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { LandingComponent } from './components/landing/landing.component';
import { UltimateTicTacToeComponent } from './components/ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { ReversiComponent } from './components/reversi/reversi.component';
import { CheckersComponent } from './components/checkers/checkers.component';
import { ChessComponent } from './components/chess/chess.component';
import { ConnectFourComponent } from './components/connect-four/connect-four.component';
import { EffectivePromptsComponent } from './components/effective-prompts/effective-prompts.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'about', component: AboutComponent },
  { path: 'games/ultimate-tic-tac-toe', component: UltimateTicTacToeComponent },
  { path: 'games/reversi', component: ReversiComponent },
  { path: 'games/checkers', component: CheckersComponent },
  { path: 'games/chess', component: ChessComponent },
  { path: 'games/connect-four', component: ConnectFourComponent },
  { path: 'effective-prompts', component: EffectivePromptsComponent },
  { path: '**', redirectTo: '' }
]; 