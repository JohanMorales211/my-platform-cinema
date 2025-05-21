import { Routes } from '@angular/router';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { HomeComponent } from '../home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: 'pelicula/:id', component: MovieDetailComponent },
];