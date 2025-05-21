import { Routes } from '@angular/router';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { HomeComponent } from '../home/home.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MaintenanceComponent } from '../maintenance/maintenance.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'inicio', redirectTo: '/home', pathMatch: 'full' },
  { path: 'pelicula/:id', component: MovieDetailComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'series-en-mantenimiento', component: MaintenanceComponent },
  { path: '**', redirectTo: '/home' }
];