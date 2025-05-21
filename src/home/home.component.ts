import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie, ALL_MOVIES } from '../app/movie-data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  latestMovies: Movie[] = ALL_MOVIES.slice(0, 4);

  featuredDayMovies: Movie[] = ALL_MOVIES.filter(m => ['f1', 'megan-2-0', 'superman'].includes(m.id));
  featuredWeekMovies: Movie[] = ALL_MOVIES.filter(m => ['elio', 'mision-imposible-sentencia-final', 'lilo-y-stitch'].includes(m.id));

  activeTab: 'day' | 'week' = 'day';

  get currentFeaturedMovies(): Movie[] {
    return this.activeTab === 'day' ? this.featuredDayMovies : this.featuredWeekMovies;
  }

  constructor() {}

  selectTab(tab: 'day' | 'week') {
    this.activeTab = tab;
  }
}