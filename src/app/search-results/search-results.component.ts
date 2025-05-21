import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../movie.service';
import { Movie } from '../movie-data';
import { Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  currentQuery: string = '';
  private querySub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.pipe(
      tap(params => {
        this.currentQuery = params.get('q') || '';
        this.movies = [];
        this.isLoading = true;
        this.error = null;
      }),
      switchMap(params => {
        const query = params.get('q');
        if (query) {
          return this.movieService.searchMovies(query);
        }
        return [];
      })
    ).subscribe({
      next: (moviesData) => {
        this.movies = moviesData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching movies:', err);
        this.error = 'Error al realizar la búsqueda.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }
}