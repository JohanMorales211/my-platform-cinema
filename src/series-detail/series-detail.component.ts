import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Series } from '../app/series-data';
import { SeriesService } from '../app/services/series.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './series-detail.component.html',
  styleUrls: ['./series-detail.component.css']
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  series: Series | undefined;
  trailerSafeUrl: SafeResourceUrl | undefined;
  isLoading: boolean = true;
  error: string | null = null;

  private routeSub: Subscription | undefined;
  private seriesSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private sanitizer: DomSanitizer,
    private seriesService: SeriesService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const seriesId = params.get('id');
      if (seriesId) {
        this.isLoading = true;
        this.error = null;
        this.series = undefined;
        this.trailerSafeUrl = undefined;

        this.seriesSub?.unsubscribe();

        this.seriesSub = this.seriesService.getSeriesDetails(seriesId).subscribe({
          next: seriesData => {
            if (seriesData) {
              this.series = seriesData;
              if (this.series.trailerUrl) {
                this.trailerSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.series.trailerUrl);
              }
            } else {
              this.error = `No se encontraron detalles para la serie con ID: ${seriesId}.`;
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching series details component:', err);
            this.error = `Error al cargar los detalles de la serie.`;
            this.isLoading = false;
          }
        });
      } else {
        this.error = 'ID de serie no proporcionado en la ruta.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.seriesSub?.unsubscribe();
  }

  getBackgroundImageStyle(): { [key: string]: string } {
    if (this.series && this.series.backdropUrl) {
      return {
        'background-image': `linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 1)), url(${this.series.backdropUrl})`
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