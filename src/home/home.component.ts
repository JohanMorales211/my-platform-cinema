import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationExtras, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Movie } from '../app/movie-data';
import { MovieService, PopularMoviesResponse, TmdbGenre } from '../app/services/movie.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  latestMovies: Movie[] = [];
  featuredDayMovies: Movie[] = [];
  featuredWeekMovies: Movie[] = [];

  currentPageLatest: number = 1;
  totalPagesLatest: number = 0;
  totalResultsLatest: number = 0;
  moviesPerPage: number = 12;
  readonly maxPageLimit: number = 500;

  isLoadingLatest: boolean = true;
  isLoadingFeaturedDay: boolean = true;
  isLoadingFeaturedWeek: boolean = true;
  isLoadingGenres: boolean = true;

  errorLatest: string | null = null;
  errorFeatured: string | null = null;
  errorGenres: string | null = null;

  activeTab: 'day' | 'week' = 'day';

  availableGenres: TmdbGenre[] = [];
  selectedGenre: string = '';
  availableYears: number[] = [];
  selectedYear: string = '';

  private subscriptions = new Subscription();

  get currentFeaturedMovies(): Movie[] {
    return this.activeTab === 'day' ? this.featuredDayMovies : this.featuredWeekMovies;
  }

  get isLoadingFeatured(): boolean {
    return this.activeTab === 'day' ? this.isLoadingFeaturedDay : this.isLoadingFeaturedWeek;
  }

  constructor(
    private movieService: MovieService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToQueryParams();
    this.loadFeaturedMovies();
  }

  loadInitialData(): void {
    this.isLoadingGenres = true;
    this.errorGenres = null;
    this.subscriptions.add(
      this.movieService.getMovieGenres().subscribe({
        next: genres => {
          this.availableGenres = genres;
          this.isLoadingGenres = false;
        },
        error: err => {
          console.error('Error al cargar géneros:', err);
          this.errorGenres = 'No se pudieron cargar los géneros.';
          this.isLoadingGenres = false;
        }
      })
    );
    this.populateYears();
  }

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 1950;
    this.availableYears = [];
    for (let year = currentYear + 1; year >= startYear; year--) {
      this.availableYears.push(year);
    }
  }

  subscribeToQueryParams(): void {
    this.subscriptions.add(
      this.activatedRoute.queryParamMap.subscribe(params => {
        const pageFromQuery = params.get('page');
        const genreFromQuery = params.get('genre');
        const yearFromQuery = params.get('year');

        const newPage = pageFromQuery ? parseInt(pageFromQuery, 10) : 1;
        const newGenre = genreFromQuery || '';
        const newYear = yearFromQuery || '';

        if (newPage !== this.currentPageLatest || newGenre !== this.selectedGenre || newYear !== this.selectedYear) {
            this.currentPageLatest = (isNaN(newPage) || newPage < 1) ? 1 : newPage;
            this.selectedGenre = newGenre;
            this.selectedYear = newYear;
        }
        this.loadLatestMovies(this.currentPageLatest, this.selectedGenre, this.selectedYear);
      })
    );
  }

  loadLatestMovies(page: number, genreId?: string, year?: string): void {
    this.isLoadingLatest = true;
    this.errorLatest = null;

    const yearParam = year ? parseInt(year, 10) : undefined;

    const latestSub = this.movieService.getPopularMovies(
      page,
      this.moviesPerPage,
      genreId || undefined,
      yearParam
    ).subscribe({
      next: (data: PopularMoviesResponse) => {
        this.latestMovies = data.movies;
        this.currentPageLatest = data.currentPage;
        this.totalPagesLatest = data.totalPages;
        this.totalResultsLatest = data.totalResults;
        this.isLoadingLatest = false;
      },
      error: (err) => {
        console.error('Error al cargar últimas películas:', err);
        this.errorLatest = 'No se pudieron cargar las películas.';
        this.isLoadingLatest = false;
      }
    });
    this.subscriptions.add(latestSub);
  }

  onFiltersChanged(): void {
    this.updateUrlWithPageAndFilters(1, this.selectedGenre, this.selectedYear);
  }

  clearFilters(): void {
    this.selectedGenre = '';
    this.selectedYear = '';
    this.updateUrlWithPageAndFilters(1);
  }

  private updateUrlWithPageAndFilters(page: number, genre?: string, year?: string): void {
    const queryParams: Params = {};
    if (page > 1) queryParams['page'] = page;
    if (genre) queryParams['genre'] = genre;
    if (year) queryParams['year'] = year;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: '',
      replaceUrl: true
    });
  }

  loadFeaturedMovies(): void {
    this.isLoadingFeaturedDay = true;
    this.isLoadingFeaturedWeek = true;
    this.errorFeatured = null;
    const featuredSub = this.movieService.getHomeMoviesData().subscribe({
        next: (data) => {
            this.featuredDayMovies = data.trendingDay;
            this.featuredWeekMovies = data.trendingWeek;
            this.isLoadingFeaturedDay = false;
            this.isLoadingFeaturedWeek = false;
        },
        error: (err) => {
            console.error('Error al cargar películas destacadas:', err);
            this.errorFeatured = 'No se pudieron cargar las películas destacadas.';
            this.isLoadingFeaturedDay = false;
            this.isLoadingFeaturedWeek = false;
        }
    });
    this.subscriptions.add(featuredSub);
  }

  selectTab(tab: 'day' | 'week') {
    this.activeTab = tab;
  }

  goToPreviousPageLatest(): void {
    if (this.currentPageLatest > 1) {
      this.updateUrlWithPageAndFilters(this.currentPageLatest - 1, this.selectedGenre, this.selectedYear);
    }
  }

  goToNextPageLatest(): void {
    if (this.currentPageLatest < this.totalPagesLatest && this.currentPageLatest < this.maxPageLimit) {
      this.updateUrlWithPageAndFilters(this.currentPageLatest + 1, this.selectedGenre, this.selectedYear);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}