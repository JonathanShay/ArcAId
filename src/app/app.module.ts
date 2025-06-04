import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { AboutComponent } from './components/about/about.component';
import { UltimateTicTacToeComponent } from './components/ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { ReversiComponent } from './components/reversi/reversi.component';
import { CheckersComponent } from './components/checkers/checkers.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    AboutComponent,
    UltimateTicTacToeComponent,
    ReversiComponent,
    CheckersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 