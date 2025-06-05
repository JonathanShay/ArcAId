import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessComponent } from './chess.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ChessComponent
  ],
  exports: [ChessComponent]
})
export class ChessModule { } 