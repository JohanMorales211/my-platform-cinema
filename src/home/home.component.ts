import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie, ALL_MOVIES } from '../app/movie-data';
import { KeepHtmlStrongPipe } from '../shared/pipes/keep-html-strong.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KeepHtmlStrongPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  latestMovies: Movie[] = ALL_MOVIES.slice(0, 4);

  featuredDayMovies: Movie[] = ALL_MOVIES.filter(m => ['f1', 'megan-2-0', 'superman'].includes(m.id));
  featuredWeekMovies: Movie[] = ALL_MOVIES.filter(m => ['elio', 'mision-imposible-sentencia-final', 'lilo-y-stitch'].includes(m.id));

  activeTab: 'day' | 'week' = 'day';

  welcomeTextFull: string = "En <strong>Johan Films</strong>, te sumergirás en el emocionante universo del cine. Esta plataforma no solo está dedicada a presentarte los tráilers de las películas más recientes y las selecciones más destacadas; también <strong>nació con la intención de mostrar mis habilidades en el desarrollo front-end y de ser un nuevo proyecto destacado para mi portafolio.</strong> Explora, descubre y prepárate para tu próxima gran aventura cinematográfica.";
  displayedWelcomeText: string = "";

  get currentFeaturedMovies(): Movie[] {
    return this.activeTab === 'day' ? this.featuredDayMovies : this.featuredWeekMovies;
  }

  constructor() {}

  ngOnInit(): void {
    this.displayedWelcomeText = this.welcomeTextFull;
  }

  selectTab(tab: 'day' | 'week') {
    this.activeTab = tab;
  }
}