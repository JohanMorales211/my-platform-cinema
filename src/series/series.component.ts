import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Series } from '../app/series-data';
import { SeriesService, PopularSeriesResponse } from '../app/series.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  errorLatest: string | null = null;
  errorFeatured: string | null = null;

  activeTab: 'day' | 'week' = 'day';

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
    this.subscriptions.add(
      this.activatedRoute.queryParamMap.pipe(take(1)).subscribe(params => {
        const pageFromQuery = params.get('page');
        if (pageFromQuery) {
          const pageNum = parseInt(pageFromQuery, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            this.currentPageLatest = pageNum;
          }
        }
        this.loadLatestSeries(this.currentPageLatest);
      })
    );
    this.loadFeaturedSeries();
  }

  loadLatestSeries(page: number): void {
    this.isLoadingLatest = true;
    this.errorLatest = null;
    
    const latestSub = this.seriesService.getPopularSeries(page).subscribe({ 
      next: (data: PopularSeriesResponse) => {
        this.latestSeries = data.series.slice(0, this.seriesPerPage);

        console.log('SeriesComponent: Series recibidas de TMDB (originales y válidas):', data.series.length);
        console.log('SeriesComponent: Series mostradas en pantalla (después de slice a', this.seriesPerPage, '):', this.latestSeries.length);
        if (this.latestSeries.length === 0) {
            console.warn('SeriesComponent: La lista de series populares está vacía o todas fueron filtradas por el servicio/slice.');
        }

        this.currentPageLatest = data.currentPage;
        this.totalPagesLatest = Math.min(data.totalPages, 500);
        this.totalPagesLatest = Math.min(this.totalPagesLatest, this.maxPageLimit);
        this.totalResultsLatest = data.totalResults;
        this.isLoadingLatest = false;

        const currentQueryPage = this.activatedRoute.snapshot.queryParamMap.get('page');
        if (currentQueryPage !== page.toString() || (!currentQueryPage && page !== 1)) {
            this.updateUrlWithPageQuery(page);
        }
      },
      error: (err) => {
        console.error('Error al cargar últimas series:', err);
        this.errorLatest = 'No se pudieron cargar las series.';
        this.isLoadingLatest = false;
      }
    });
    this.subscriptions.add(latestSub);
  }

  private updateUrlWithPageQuery(page: number): void {
    const navigationExtras: NavigationExtras = {
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    };
    this.router.navigate([], navigationExtras);
  }

  loadFeaturedSeries(): void {
    this.isLoadingFeaturedDay = true;
    this.isLoadingFeaturedWeek = true;
    this.errorFeatured = null;
    const featuredSub = this.seriesService.getHomeSeriesData().subscribe({ 
        next: (data) => {
            console.log('SeriesComponent: Series destacadas del día:', data.trendingDay.length, 'series.');
            console.log('SeriesComponent: Series destacadas de la semana:', data.trendingWeek.length, 'series.');

            this.featuredDaySeries = data.trendingDay;
            this.featuredWeekSeries = data.trendingWeek;
            this.isLoadingFeaturedDay = false;
            this.isLoadingFeaturedWeek = false;
            if (data.trendingDay.length === 0 && data.trendingWeek.length === 0) {
                console.warn("Listas de series destacadas están vacías.");
            }
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
      this.loadLatestSeries(this.currentPageLatest - 1);
    }
  }

  goToNextPageLatest(): void {
    if (this.currentPageLatest < this.totalPagesLatest && this.currentPageLatest < this.maxPageLimit) {
      this.loadLatestSeries(this.currentPageLatest + 1);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}