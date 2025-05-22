import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { SeriesService } from '../services/series.service';
import { Movie } from '../movie-data';
import { Series } from '../series-data';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  allMoviesResults: Movie[] = [];
  allSeriesResults: Series[] = [];

  displayedMovies: Movie[] = [];
  displayedSeries: Series[] = [];

  moviesExpanded: boolean = false;
  seriesExpanded: boolean = false;

  readonly initialItemsToShow: number = 12;

  isLoading: boolean = false;
  error: string | null = null;
  currentQuery: string = '';
  private querySub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private seriesService: SeriesService
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.pipe(
      tap(params => {
        this.currentQuery = params.get('q') || '';
        this.resetResultsAndExpansion();
        this.isLoading = true;
        this.error = null;
        if (!this.currentQuery) {
            this.isLoading = false;
        }
      }),
      switchMap(params => {
        const query = params.get('q');
        if (query) {
          return forkJoin({
            movies: this.movieService.searchMovies(query).pipe(
              catchError(() => of([] as Movie[]))
            ),
            series: this.seriesService.searchSeries(query).pipe(
              catchError(() => of([] as Series[]))
            )
          });
        }
        return of({ movies: [] as Movie[], series: [] as Series[] });
      })
    ).subscribe({
      next: (results) => {
        this.allMoviesResults = results.movies;
        this.allSeriesResults = results.series;
        this.updateDisplayedItems();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error general en el stream de búsqueda:', err);
        this.error = 'Ocurrió un error inesperado al procesar la búsqueda.';
        this.isLoading = false;
      }
    });
  }

  private resetResultsAndExpansion(): void {
    this.allMoviesResults = [];
    this.allSeriesResults = [];
    this.displayedMovies = [];
    this.displayedSeries = [];
    this.moviesExpanded = false;
    this.seriesExpanded = false;
  }

  private updateDisplayedItems(): void {
    this.displayedMovies = this.moviesExpanded
      ? this.allMoviesResults
      : this.allMoviesResults.slice(0, this.initialItemsToShow);

    this.displayedSeries = this.seriesExpanded
      ? this.allSeriesResults
      : this.allSeriesResults.slice(0, this.initialItemsToShow);
  }

  toggleMoviesExpansion(): void {
    this.moviesExpanded = !this.moviesExpanded;
    this.updateDisplayedItems();
  }

  toggleSeriesExpansion(): void {
    this.seriesExpanded = !this.seriesExpanded;
    this.updateDisplayedItems();
  }

  ngOnDestroy(): void {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }
}