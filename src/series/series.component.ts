import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Series } from '../app/series-data';
import { SeriesService, PopularSeriesResponse, TmdbTvGenre } from '../app/series.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnInit, OnDestroy {
  latestSeries: Series[] = [];
  featuredDaySeries: Series[] = [];
  featuredWeekSeries: Series[] = [];

  currentPageLatest: number = 1;
  totalPagesLatest: number = 0;
  totalResultsLatest: number = 0;
  
  seriesPerPage: number = 12;
  readonly maxPageLimit: number = 50;

  isLoadingLatest: boolean = true;
  isLoadingFeaturedDay: boolean = true;
  isLoadingFeaturedWeek: boolean = true;
  isLoadingGenres: boolean = true;

  errorLatest: string | null = null;
  errorFeatured: string | null = null;
  errorGenres: string | null = null;

  activeTab: 'day' | 'week' = 'day';

  availableGenres: TmdbTvGenre[] = [];
  selectedGenre: string = '';
  availableYears: number[] = [];
  selectedYear: string = '';

  private subscriptions = new Subscription();

  get currentFeaturedSeries(): Series[] {
    return this.activeTab === 'day' ? this.featuredDaySeries : this.featuredWeekSeries;
  }

  get isLoadingFeatured(): boolean {
    return this.activeTab === 'day' ? this.isLoadingFeaturedDay : this.isLoadingFeaturedWeek;
  }

  constructor(
    private seriesService: SeriesService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInitialDataForFilters();
    this.subscribeToQueryParams();
    this.loadFeaturedSeries();
  }

  loadInitialDataForFilters(): void {
    this.isLoadingGenres = true;
    this.errorGenres = null;
    this.subscriptions.add(
      this.seriesService.getSeriesGenres().subscribe({
        next: genres => {
          this.availableGenres = genres;
          this.isLoadingGenres = false;
        },
        error: err => {
          console.error('Error al cargar géneros de series:', err);
          this.errorGenres = 'No se pudieron cargar los géneros.';
          this.isLoadingGenres = false;
        }
      })
    );
    this.populateYears();
  }

  populateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = 1940;
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
        
        this.currentPageLatest = (isNaN(newPage) || newPage < 1) ? 1 : newPage;
        this.selectedGenre = genreFromQuery || '';
        this.selectedYear = yearFromQuery || '';
        
        this.loadLatestSeries(this.currentPageLatest, this.selectedGenre, this.selectedYear);
      })
    );
  }

  loadLatestSeries(page: number, genreId?: string, year?: string): void {
    this.isLoadingLatest = true;
    this.errorLatest = null;
    
    const yearParam = year ? parseInt(year, 10) : undefined;

    const latestSub = this.seriesService.getPopularSeries(page, genreId || undefined, yearParam).subscribe({ 
      next: (data: PopularSeriesResponse) => {
        this.latestSeries = data.series.slice(0, this.seriesPerPage);

        console.log('SeriesComponent: Series recibidas de TMDB (filtradas/populares):', data.series.length);
        console.log('SeriesComponent: Series mostradas en pantalla (después de slice a', this.seriesPerPage, '):', this.latestSeries.length);
        if (this.latestSeries.length === 0 && data.series.length > 0) {
            console.warn('SeriesComponent: La lista de series se vació después del slice. Original:', data.series.length, 'Mostradas:', this.latestSeries.length);
        }


        this.currentPageLatest = data.currentPage;
        this.totalPagesLatest = Math.min(data.totalPages, 500, this.maxPageLimit);
        this.totalResultsLatest = data.totalResults;
        this.isLoadingLatest = false;
      },
      error: (err) => {
        console.error('Error al cargar últimas series:', err);
        this.errorLatest = 'No se pudieron cargar las series.';
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

  loadFeaturedSeries(): void {
    this.isLoadingFeaturedDay = true;
    this.isLoadingFeaturedWeek = true;
    this.errorFeatured = null;
    const featuredSub = this.seriesService.getHomeSeriesData().subscribe({ 
        next: (data) => {
            this.featuredDaySeries = data.trendingDay;
            this.featuredWeekSeries = data.trendingWeek;
            this.isLoadingFeaturedDay = false;
            this.isLoadingFeaturedWeek = false;
        },
        error: (err) => {
            console.error('Error al cargar series destacadas:', err);
            this.errorFeatured = 'No se pudieron cargar las series destacadas.';
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