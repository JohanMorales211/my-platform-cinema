import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Movie, ALL_MOVIES } from '../movie-data';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css'
})  
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie: Movie | undefined;
  trailerSafeUrl: SafeResourceUrl | undefined;
  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const movieId = params.get('id');
      if (movieId) {
        this.movie = ALL_MOVIES.find(m => m.id === movieId);
        if (!this.movie) {
          console.error('Película no encontrada con ID:', movieId);
          this.trailerSafeUrl = undefined;
        } else {
          if (this.movie.trailerUrl) {
            this.trailerSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.movie.trailerUrl);
          } else {
            this.trailerSafeUrl = undefined;
          }
        }
      } else {
        this.trailerSafeUrl = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
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