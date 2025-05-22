import { Routes } from '@angular/router';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { HomeComponent } from '../home/home.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MaintenanceComponent } from '../maintenance/maintenance.component'; // Mantener si la usas para otras cosas
import { AboutComponent } from '../about/about.component';

// ¡NUEVAS IMPORTACIONES! Asegúrate de que estas rutas sean correctas según donde creaste las carpetas `series` y `series-detail`
// Si las creaste directamente bajo `src/` (hermanas de `home`, `app`, `about`):
import { SeriesComponent } from '../series/series.component';
import { SeriesDetailComponent } from '../series-detail/series-detail.component';


export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'inicio', redirectTo: '/home', pathMatch: 'full' },
  { path: 'quien-soy', component: AboutComponent },
  { path: 'pelicula/:id', component: MovieDetailComponent },
  { path: 'search', component: SearchResultsComponent },
  { path: 'series', component: SeriesComponent },
  { path: 'series/:id', component: SeriesDetailComponent },

  { path: '**', redirectTo: '/home' }
];