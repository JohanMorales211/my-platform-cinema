import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Movie } from './movie-data';

interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
    profile_sizes: string[];
  };
}

interface TmdbMovieResult {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbActor[] };
}

interface TmdbMovieListResponse {
  page: number;
  results: TmdbMovieResult[];
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


@Injectable({
  providedIn: 'root'
})
export class MovieService {
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

  constructor(private http: HttpClient) {
    this.loadConfiguration().subscribe();
  }

  private loadConfiguration(): Observable<TmdbConfiguration> {
    if (this.configLoaded) {
      return of(null as any);
    }
    const url = `${this.baseUrl}/configuration`;
    return this.http.get<TmdbConfiguration>(url, this.httpOptions).pipe(
      tap(config => {
        this.imageBaseUrl = config.images.secure_base_url || config.images.base_url;
        this.posterSize = config.images.poster_sizes.includes('w500') ? 'w500' : config.images.poster_sizes[3] || 'original';
        this.backdropSize = config.images.backdrop_sizes.includes('w1280') ? 'w1280' : config.images.backdrop_sizes[2] || 'original';
        this.configLoaded = true;
        console.log('TMDB Configuration Loaded:', { baseUrl: this.imageBaseUrl, posterSize: this.posterSize });
      }),
      catchError(err => {
        console.error('Error loading TMDB configuration:', err);
        return of(null as any);
      })
    );
  }

  private ensureConfigLoaded<T>(requestFn: () => Observable<T>): Observable<T> {
    if (this.configLoaded) {
      return requestFn();
    } else {
      return this.loadConfiguration().pipe(
        switchMap(() => requestFn())
      );
    }
  }

  private mapTmdbMovieToAppMovie(tmdbMovie: TmdbMovieResult): Movie {
    return {
      id: tmdbMovie.id.toString(),
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 'N/A',
      posterUrl: tmdbMovie.poster_path ? `${this.imageBaseUrl}${this.posterSize}${tmdbMovie.poster_path}` : 'assets/images/placeholder_poster.png',
      backdropUrl: tmdbMovie.backdrop_path ? `${this.imageBaseUrl}${this.backdropSize}${tmdbMovie.backdrop_path}` : undefined,
      ratingPercentage: tmdbMovie.vote_average ? Math.round(tmdbMovie.vote_average * 10) : undefined,
      ratingOutOf10: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : undefined,
      duration: tmdbMovie.runtime ? `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}min` : undefined,
      description: tmdbMovie.overview,
      genres: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
      actors: tmdbMovie.credits?.cast ? tmdbMovie.credits.cast.slice(0, 10).map(actor => actor.name) : [],
      trailerUrl: this.extractTrailerUrl(tmdbMovie.videos?.results)
    };
  }

  private extractTrailerUrl(videos?: TmdbVideo[]): string | undefined {
    if (!videos || videos.length === 0) return undefined;
    const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official) ||
                    videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined;
  }

  getPopularMovies(page: number = 1, limit: number = 8): Observable<Movie[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams()
        .set('language', 'es-ES')
        .set('page', page.toString());
      const url = `${this.baseUrl}/movie/popular`;
      return this.http.get<TmdbMovieListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => response.results.slice(0, limit).map(m => this.mapTmdbMovieToAppMovie(m))),
        catchError(this.handleError<Movie[]>('getPopularMovies', []))
      );
    });
  }

  getTrendingMovies(timeWindow: 'day' | 'week', page: number = 1, limit: number = 5): Observable<Movie[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams()
        .set('language', 'es-ES')
        .set('page', page.toString());
      const url = `${this.baseUrl}/trending/movie/${timeWindow}`;
      return this.http.get<TmdbMovieListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => response.results.slice(0, limit).map(m => this.mapTmdbMovieToAppMovie(m))),
        catchError(this.handleError<Movie[]>('getTrendingMovies', []))
      );
    });
  }

  getMovieDetails(id: string): Observable<Movie | undefined> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams()
        .set('language', 'es-ES')
        .set('append_to_response', 'videos,credits');
      const url = `${this.baseUrl}/movie/${id}`;
      return this.http.get<TmdbMovieResult>(url, { ...this.httpOptions, params }).pipe(
        map(response => this.mapTmdbMovieToAppMovie(response)),
        catchError(this.handleError<Movie | undefined>(`getMovieDetails id=${id}`))
      );
    });
  }

  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    return this.ensureConfigLoaded(() => {
      if (!query.trim()) {
        return of([]);
      }
      const params = new HttpParams()
        .set('query', query)
        .set('language', 'es-ES')
        .set('page', page.toString())
        .set('include_adult', 'false');
      const url = `${this.baseUrl}/search/movie`;
      return this.http.get<TmdbMovieListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => response.results.map(m => this.mapTmdbMovieToAppMovie(m))),
        catchError(this.handleError<Movie[]>('searchMovies', []))
      );
    });
  }
  
  getHomeMoviesData(): Observable<{ popular: Movie[], trendingDay: Movie[], trendingWeek: Movie[] }> {
    return this.ensureConfigLoaded(() => {
      return forkJoin({
        popular: this.getPopularMovies(1, 8),
        trendingDay: this.getTrendingMovies('day', 1, 5),
        trendingWeek: this.getTrendingMovies('week', 1, 5)
      }).pipe(
        catchError(err => {
          console.error('Error fetching home movies data', err);
          return of({ popular: [], trendingDay: [], trendingWeek: [] });
        })
      );
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}