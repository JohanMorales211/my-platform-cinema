import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Series } from './series-data';

interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
    profile_sizes: string[];
  };
}

interface TmdbTvResult {
  id: number;
  name: string;
  original_name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbActor[] };
}

interface TmdbTvListResponse {
  page: number;
  results: TmdbTvResult[];
  total_pages: number;
  total_results: number;
}

interface TmdbVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  id: string;
}

interface TmdbActor {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbTvGenre {
  id: number;
  name: string;
}
interface TmdbTvGenreResponse {
  genres: TmdbTvGenre[];
}


export interface PopularSeriesResponse {
  series: Series[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjc4NzJlNTFhMDY0MzJkODVhNzNhNjFjYTVlNzE4MiIsIm5iZiI6MTc0Nzg2NTM0NS41MDMsInN1YiI6IjY4MmU0ZjAxOTdhOTVkZjA0YjFjMWM4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0tXhZMXCrtWsm8nl8oTfrI-or2M04zR8fLrLX7RIpVo';

  private httpOptions = {
    headers: new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    })
  };

  private imageBaseUrl: string = 'https://image.tmdb.org/t/p/';
  private posterSize: string = 'w500';
  private backdropSize: string = 'w1280';
  private configLoaded: boolean = false;
  private configuration$: Observable<TmdbConfiguration | null>;

  constructor(private http: HttpClient) {
    this.configuration$ = this.http.get<TmdbConfiguration>(`${this.baseUrl}/configuration`, this.httpOptions).pipe(
      tap(config => {
        if (config && config.images) {
          this.imageBaseUrl = config.images.secure_base_url || config.images.base_url;
          this.posterSize = config.images.poster_sizes.includes('w500') ? 'w500' : (config.images.poster_sizes[3] || 'original');
          this.backdropSize = config.images.backdrop_sizes.includes('w1280') ? 'w1280' : (config.images.backdrop_sizes[2] || 'original');
          this.configLoaded = true;
        } else {
          console.warn('TMDB Configuration response is not as expected for SeriesService, using defaults.');
        }
      }),
      catchError(err => {
        console.error('Error loading TMDB configuration for SeriesService:', err);
        return of(null);
      }),
    );
    this.configuration$.subscribe();
  }

  private ensureConfigLoaded<T>(requestFn: () => Observable<T>): Observable<T> {
    if (this.configLoaded) {
      return requestFn();
    } else {
      return this.configuration$.pipe(
        switchMap(config => {
          if (!config) {
             console.error('TMDB configuration not loaded for SeriesService. API calls might use default image paths or fail.');
          }
          return requestFn();
        })
      );
    }
  }

  private mapTmdbTvToAppSeries(tmdbTv: TmdbTvResult): Series | null {

    const posterPath = tmdbTv.poster_path
        ? `${this.imageBaseUrl}${this.posterSize}${tmdbTv.poster_path}`
        : 'assets/images/placeholder_poster.png';

    const backdropPath = tmdbTv.backdrop_path ? `${this.imageBaseUrl}${this.backdropSize}${tmdbTv.backdrop_path}` : undefined;

    return {
      id: tmdbTv.id.toString(),
      title: tmdbTv.name,
      originalTitle: tmdbTv.original_name,
      firstAirYear: tmdbTv.first_air_date ? new Date(tmdbTv.first_air_date).getFullYear() : 'N/A',
      posterUrl: posterPath,
      backdropUrl: backdropPath,
      ratingPercentage: tmdbTv.vote_average ? Math.round(tmdbTv.vote_average * 10) : undefined,
      ratingOutOf10: tmdbTv.vote_average ? tmdbTv.vote_average.toFixed(1) : undefined,
      numberOfSeasons: tmdbTv.number_of_seasons,
      numberOfEpisodes: tmdbTv.number_of_episodes,
      description: tmdbTv.overview || 'Descripción no disponible.',
      genres: tmdbTv.genres ? tmdbTv.genres.map(g => g.name) : [],
      actors: tmdbTv.credits?.cast ? tmdbTv.credits.cast.slice(0, 10).map(actor => actor.name) : [],
      trailerUrl: this.extractTrailerUrl(tmdbTv.videos?.results)
    };
  }

  private extractTrailerUrl(videos?: TmdbVideo[]): string | undefined {
    if (!videos || videos.length === 0) return undefined;
    const officialTrailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official);
    if (officialTrailer) return `https://www.youtube.com/embed/${officialTrailer.key}`;
    const anyTrailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
    return anyTrailer ? `https://www.youtube.com/embed/${anyTrailer.key}` : undefined;
  }

  getSeriesGenres(): Observable<TmdbTvGenre[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams().set('language', 'es-ES');
      const url = `${this.baseUrl}/genre/tv/list`;
      return this.http.get<TmdbTvGenreResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => response.genres || []),
        catchError(this.handleError<TmdbTvGenre[]>('getSeriesGenres', []))
      );
    });
  }

  getPopularSeries(
    page: number = 1,
    genreId?: string,
    year?: number
  ): Observable<PopularSeriesResponse> {
    return this.ensureConfigLoaded(() => {
      let params = new HttpParams()
        .set('language', 'es-ES')
        .set('page', page.toString());

      let url = `${this.baseUrl}/tv/popular`;

      if (genreId || year) {
        url = `${this.baseUrl}/discover/tv`;
        params = params.set('sort_by', 'popularity.desc');
        if (genreId) {
          params = params.set('with_genres', genreId);
        }
        if (year) {
          params = params.set('first_air_date_year', year.toString());
        }
      }

      return this.http.get<TmdbTvListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => {
          const series = response.results
            .map(s => this.mapTmdbTvToAppSeries(s))
            .filter((s): s is Series => s !== null);

          return {
            series: series,
            currentPage: response.page,
            totalPages: Math.min(response.total_pages, 500),
            totalResults: response.total_results
          };
        }),
        catchError(this.handleError<PopularSeriesResponse>('getPopularSeries', { series: [], currentPage: 1, totalPages: 0, totalResults: 0 }))
      );
    });
  }

  getTrendingSeries(timeWindow: 'day' | 'week', page: number = 1, limit: number = 5): Observable<Series[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams().set('language', 'es-ES').set('page', page.toString());
      const url = `${this.baseUrl}/trending/tv/${timeWindow}`;
      return this.http.get<TmdbTvListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response =>
          response.results
            .map(s => this.mapTmdbTvToAppSeries(s))
            .filter((s): s is Series => s !== null)
            .slice(0, limit)
        ),
        catchError(this.handleError<Series[]>('getTrendingSeries', []))
      );
    });
  }

  getSeriesDetails(id: string): Observable<Series | undefined> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams().set('language', 'es-ES').set('append_to_response', 'videos,credits');
      const url = `${this.baseUrl}/tv/${id}`;
      return this.http.get<TmdbTvResult>(url, { ...this.httpOptions, params }).pipe(
        map(response => {
          const series = this.mapTmdbTvToAppSeries(response);
          return series || undefined;
        }),
        catchError(this.handleError<Series | undefined>(`getSeriesDetails id=${id}`))
      );
    });
  }

  searchSeries(query: string, page: number = 1): Observable<Series[]> {
    return this.ensureConfigLoaded(() => {
      if (!query.trim()) {
        return of([]);
      }
      const params = new HttpParams()
        .set('query', query)
        .set('language', 'es-ES')
        .set('page', page.toString())
        .set('include_adult', 'false');
      const url = `${this.baseUrl}/search/tv`;
      return this.http.get<TmdbTvListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response =>
          response.results
            .map(s => this.mapTmdbTvToAppSeries(s))
            .filter((s): s is Series => s !== null)
        ),
        catchError(this.handleError<Series[]>('searchSeries', []))
      );
    });
  }

  getHomeSeriesData(): Observable<{ trendingDay: Series[], trendingWeek: Series[] }> {
    return this.ensureConfigLoaded(() => {
      return forkJoin({
        trendingDay: this.getTrendingSeries('day', 1, 5),
        trendingWeek: this.getTrendingSeries('week', 1, 5)
      }).pipe(
        catchError(err => {
          console.error('Error fetching home series data (trending)', err);
          return of({ trendingDay: [], trendingWeek: [] });
        })
      );
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: Status ${error.status || 'unknown'} ${error.statusText || 'unknown error'}`);
      if (error.error && typeof error.error === 'object') {
        console.error('Error details:', JSON.stringify(error.error, null, 2));
      } else if (error.message) {
        console.error('Error message:', error.message);
      } else {
        console.error('Full error object:', JSON.stringify(error, null, 2));
      }
      return of(result as T);
    };
  }
}