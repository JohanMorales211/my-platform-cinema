import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Movie } from '../app/movie-data';
import { MovieService, PopularMoviesResponse } from '../app/movie.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  readonly maxPageLimit: number = 50;

  isLoadingLatest: boolean = true;
  isLoadingFeaturedDay: boolean = true;
  isLoadingFeaturedWeek: boolean = true;

  errorLatest: string | null = null;
  errorFeatured: string | null = null;

  activeTab: 'day' | 'week' = 'day';

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
    this.subscriptions.add(
      this.activatedRoute.queryParamMap.pipe(take(1)).subscribe(params => {
        const pageFromQuery = params.get('page');
        if (pageFromQuery) {
          const pageNum = parseInt(pageFromQuery, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            this.currentPageLatest = pageNum;
          }
        }
        this.loadLatestMovies(this.currentPageLatest);
      })
    );
    this.loadFeaturedMovies();
  }

  loadLatestMovies(page: number): void {
    this.isLoadingLatest = true;
    this.errorLatest = null;
    const latestSub = this.movieService.getPopularMovies(page, this.moviesPerPage).subscribe({
      next: (data: PopularMoviesResponse) => {
        this.latestMovies = data.movies;
        this.currentPageLatest = data.currentPage;
        this.totalPagesLatest = Math.min(data.totalPages, 500);
        this.totalPagesLatest = Math.min(this.totalPagesLatest, this.maxPageLimit);
        this.totalResultsLatest = data.totalResults;
        this.isLoadingLatest = false;

        const currentQueryPage = this.activatedRoute.snapshot.queryParamMap.get('page');
        if (currentQueryPage !== page.toString() || !currentQueryPage && page !== 1) {
            this.updateUrlWithPageQuery(page);
        }
      },
      error: (err) => {
        console.error('Error al cargar últimas películas:', err);
        this.errorLatest = 'No se pudieron cargar las películas.';
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
            if (data.trendingDay.length === 0 && data.trendingWeek.length === 0) {
                console.warn("Listas de películas destacadas están vacías.");
            }
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
      this.loadLatestMovies(this.currentPageLatest - 1);
    }
  }

  goToNextPageLatest(): void {
    if (this.currentPageLatest < this.totalPagesLatest && this.currentPageLatest < this.maxPageLimit) {
      this.loadLatestMovies(this.currentPageLatest + 1);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}