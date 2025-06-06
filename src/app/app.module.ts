import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { AboutComponent } from './components/about/about.component';
import { UltimateTicTacToeComponent } from './components/ultimate-tic-tac-toe/ultimate-tic-tac-toe.component';
import { ReversiComponent } from './components/reversi/reversi.component';
import { CheckersComponent } from './components/checkers/checkers.component';
import { ChessComponent } from './components/chess/chess.component';
import { ConnectFourComponent } from './components/connect-four/connect-four.component';
import { ConnectFourPreviewComponent } from './components/connect-four/connect-four-preview.component';
import { ConversationSnippetsComponent } from './components/conversation-snippets/conversation-snippets.component';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    AboutComponent,
    UltimateTicTacToeComponent,
    ReversiComponent,
    CheckersComponent,
    ChessComponent,
    ConnectFourComponent,
    ConnectFourPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    ConversationSnippetsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 