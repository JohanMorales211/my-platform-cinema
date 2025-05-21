import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Movie } from '../movie-data';
import { MovieService } from '../movie.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: Movie | undefined;
  trailerSafeUrl: SafeResourceUrl | undefined;
  isLoading: boolean = true;
  error: string | null = null;

  private routeSub: Subscription | undefined;
  private movieSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private sanitizer: DomSanitizer,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const movieId = params.get('id');
      if (movieId) {
        this.isLoading = true;
        this.error = null;
        this.movie = undefined;
        this.trailerSafeUrl = undefined;

        this.movieSub?.unsubscribe();

        this.movieSub = this.movieService.getMovieDetails(movieId).subscribe({
          next: movieData => {
            if (movieData) {
              this.movie = movieData;
              if (this.movie.trailerUrl) {
                this.trailerSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.movie.trailerUrl);
              }
            } else {
              this.error = `No se encontraron detalles para la película con ID: ${movieId}.`;
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching movie details component:', err);
            this.error = `Error al cargar los detalles de la película.`;
            this.isLoading = false;
          }
        });
      } else {
        this.error = 'ID de película no proporcionado en la ruta.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.movieSub?.unsubscribe();
  }

  getBackgroundImageStyle(): { [key: string]: string } {
    if (this.movie && this.movie.backdropUrl) {
      return {
        'background-image': `linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 1)), url(${this.movie.backdropUrl})`
      };
    }
    return {
      'background-color': 'var(--dark-background)'
    };
  }

  goBack(): void {
    this.location.back();
  }
}