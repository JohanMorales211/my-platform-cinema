import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie } from '../app/movie-data';
import { KeepHtmlStrongPipe } from '../shared/pipes/keep-html-strong.pipe';
import { MovieService } from '../app/movie.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KeepHtmlStrongPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  latestMovies: Movie[] = [];
  featuredDayMovies: Movie[] = [];
  featuredWeekMovies: Movie[] = [];

  isLoadingLatest: boolean = true;
  isLoadingFeaturedDay: boolean = true;
  isLoadingFeaturedWeek: boolean = true;

  errorLatest: string | null = null;
  errorFeatured: string | null = null;

  activeTab: 'day' | 'week' = 'day';

  welcomeTextFull: string = "En <strong>Johan Films</strong>, te sumergirás en el emocionante universo del cine. Esta plataforma no solo está dedicada a presentarte los tráilers de las películas más recientes y las selecciones más destacadas; también <strong>nació con la intención de mostrar mis habilidades en el desarrollo front-end y de ser un nuevo proyecto destacado para mi portafolio.</strong> Explora, descubre y prepárate para tu próxima gran aventura cinematográfica.";
  displayedWelcomeText: string = "";

  private subscriptions = new Subscription();

  get currentFeaturedMovies(): Movie[] {
    return this.activeTab === 'day' ? this.featuredDayMovies : this.featuredWeekMovies;
  }

  get isLoadingFeatured(): boolean {
    return this.activeTab === 'day' ? this.isLoadingFeaturedDay : this.isLoadingFeaturedWeek;
  }

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.displayedWelcomeText = this.welcomeTextFull;
    this.loadAllMoviesForHome();
  }

  loadAllMoviesForHome(): void {
    this.isLoadingLatest = true;
    this.isLoadingFeaturedDay = true;
    this.isLoadingFeaturedWeek = true;
    this.errorLatest = null;
    this.errorFeatured = null;

    const homeMoviesSub = this.movieService.getHomeMoviesData().subscribe({
      next: (data) => {
        this.latestMovies = data.popular;
        this.featuredDayMovies = data.trendingDay;
        this.featuredWeekMovies = data.trendingWeek;
        
        this.isLoadingLatest = false;
        this.isLoadingFeaturedDay = false;
        this.isLoadingFeaturedWeek = false;

        if (data.popular.length === 0 && data.trendingDay.length === 0 && data.trendingWeek.length === 0) {
            console.warn("Todas las listas de películas para el home están vacías.");
        }
      },
      error: (err) => {
        console.error('Error general al cargar datos para el home:', err);
        this.errorLatest = 'No se pudieron cargar las películas.';
        this.errorFeatured = 'No se pudieron cargar las películas destacadas.';
        this.isLoadingLatest = false;
        this.isLoadingFeaturedDay = false;
        this.isLoadingFeaturedWeek = false;
      }
    });
    this.subscriptions.add(homeMoviesSub);
  }

  selectTab(tab: 'day' | 'week') {
    this.activeTab = tab;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}