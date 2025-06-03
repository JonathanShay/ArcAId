import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'about', component: AboutComponent }
]; 