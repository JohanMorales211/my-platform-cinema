import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Movie } from '../movie-data';

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

interface TmdbVideoListResponse {
  id: number;
  results: TmdbVideo[];
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

export interface TmdbGenre {
  id: number;
  name: string;
}
interface TmdbGenreResponse {
  genres: TmdbGenre[];
}

export interface PopularMoviesResponse {
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
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
  private configuration$: Observable<TmdbConfiguration | null>;

  constructor(private http: HttpClient) {
    this.configuration$ = this.http.get<TmdbConfiguration>(`${this.baseUrl}/configuration`, this.httpOptions).pipe(
      tap(config => {
        if (config && config.images) {
          this.imageBaseUrl = config.images.secure_base_url || config.images.base_url;
          this.posterSize = config.images.poster_sizes.includes('w500') ? 'w500'
            : (config.images.poster_sizes.length > 3 ? config.images.poster_sizes[3] : 'original');
          this.backdropSize = config.images.backdrop_sizes.includes('w1280') ? 'w1280'
            : (config.images.backdrop_sizes.length > 2 ? config.images.backdrop_sizes[2] : 'original');
          this.configLoaded = true;
        } else {
          console.warn('TMDB Configuration response is not as expected, using defaults.');
        }
      }),
      catchError(err => {
        console.error('Error loading TMDB configuration:', err);
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
            console.error('TMDB configuration not loaded. API calls might use default image paths or fail.');
          }
          return requestFn();
        })
      );
    }
  }

  private mapTmdbMovieToAppMovie(tmdbMovie: TmdbMovieResult): Movie | null {
    if (!tmdbMovie.id || !tmdbMovie.title ) {
        return null;
    }

    const posterPath = tmdbMovie.poster_path
      ? `${this.imageBaseUrl}${this.posterSize}${tmdbMovie.poster_path}`
      : 'assets/images/placeholder_poster.png';

    const backdropPath = tmdbMovie.backdrop_path
      ? `${this.imageBaseUrl}${this.backdropSize}${tmdbMovie.backdrop_path}`
      : undefined;

    return {
      id: tmdbMovie.id.toString(),
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 'N/A',
      posterUrl: posterPath,
      backdropUrl: backdropPath,
      ratingPercentage: tmdbMovie.vote_average ? Math.round(tmdbMovie.vote_average * 10) : undefined,
      ratingOutOf10: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : undefined,
      duration: tmdbMovie.runtime ? `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}min` : undefined,
      description: tmdbMovie.overview || 'Descripción no disponible.',
      genres: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
      actors: tmdbMovie.credits?.cast ? tmdbMovie.credits.cast.slice(0, 10).map(actor => actor.name) : [],
      trailerUrl: this.extractTrailerUrl(tmdbMovie.videos?.results)
    };
  }

  private extractTrailerUrl(videos?: TmdbVideo[]): string | undefined {
    if (!videos || videos.length === 0) return undefined;
    const officialTrailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official);
    if (officialTrailer) return `https://www.youtube.com/embed/${officialTrailer.key}`;
    const anyTrailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');
    return anyTrailer ? `https://www.youtube.com/embed/${anyTrailer.key}` : undefined;
  }

  getPopularMovies(
    page: number = 1,
    limit: number = 12,
    genreId?: string,
    year?: number
  ): Observable<PopularMoviesResponse> {
    return this.ensureConfigLoaded(() => {
      let params = new HttpParams()
        .set('language', 'es-ES')
        .set('page', page.toString());

      let url = `${this.baseUrl}/movie/popular`;

      if (genreId || year) {
        url = `${this.baseUrl}/discover/movie`;
        params = params.set('sort_by', 'popularity.desc');
        if (genreId) {
          params = params.set('with_genres', genreId);
        }
        if (year) {
          params = params.set('primary_release_year', year.toString());
        }
      }

      return this.http.get<TmdbMovieListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => {
          const movies = response.results
            .map(m => this.mapTmdbMovieToAppMovie(m))
            .filter((movie): movie is Movie => movie !== null);

          return {
            movies: movies.slice(0, limit),
            currentPage: response.page,
            totalPages: Math.min(response.total_pages, 500),
            totalResults: response.total_results
          };
        }),
        catchError(this.handleError<PopularMoviesResponse>('getPopularMovies', { movies: [], currentPage: 1, totalPages: 0, totalResults: 0 }))
      );
    });
  }

  getMovieGenres(): Observable<TmdbGenre[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams().set('language', 'es-ES');
      const url = `${this.baseUrl}/genre/movie/list`;
      return this.http.get<TmdbGenreResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response => response.genres || []),
        catchError(this.handleError<TmdbGenre[]>('getMovieGenres', []))
      );
    });
  }

  getTrendingMovies(timeWindow: 'day' | 'week', page: number = 1, limit: number = 5): Observable<Movie[]> {
    return this.ensureConfigLoaded(() => {
      const params = new HttpParams().set('language', 'es-ES').set('page', page.toString());
      const url = `${this.baseUrl}/trending/movie/${timeWindow}`;
      return this.http.get<TmdbMovieListResponse>(url, { ...this.httpOptions, params }).pipe(
        map(response =>
          response.results
            .map(m => this.mapTmdbMovieToAppMovie(m))
            .filter((movie): movie is Movie => movie !== null)
            .slice(0, limit)
        ),
        catchError(this.handleError<Movie[]>('getTrendingMovies', []))
      );
    });
  }

  getMovieDetails(id: string): Observable<Movie | undefined> {
    return this.ensureConfigLoaded(() => {
      const spanishParams = new HttpParams()
        .set('language', 'es-ES')
        .set('append_to_response', 'videos,credits,genres');
      const spanishDetailsUrl = `${this.baseUrl}/movie/${id}`;

      return this.http.get<TmdbMovieResult>(spanishDetailsUrl, { ...this.httpOptions, params: spanishParams }).pipe(
        switchMap(tmdbMovieInSpanish => {
          let movie = this.mapTmdbMovieToAppMovie(tmdbMovieInSpanish);

          if (!movie) {
            return of(undefined);
          }

          if (movie.trailerUrl) {
            return of(movie);
          } else {
            const videosUrl = `${this.baseUrl}/movie/${id}/videos`;
            const englishVideoParams = new HttpParams();


            return this.http.get<TmdbVideoListResponse>(videosUrl, { ...this.httpOptions, params: englishVideoParams }).pipe(
              map(englishVideoResponse => {
                const englishTrailerUrl = this.extractTrailerUrl(englishVideoResponse.results);
                if (englishTrailerUrl) {
                  movie!.trailerUrl = englishTrailerUrl;
                }
                return movie;
              }),
              catchError(err => {
                console.warn(`Error fetching videos in default/English language for movie ${id}. Returning movie with original (es-ES) details:`, err);
                return of(movie);
              })
            );
          }
        }),
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
        map(response =>
          response.results
            .map(m => this.mapTmdbMovieToAppMovie(m))
            .filter((movie): movie is Movie => movie !== null)
        ),
        catchError(this.handleError<Movie[]>('searchMovies', []))
      );
    });
  }

  getHomeMoviesData(): Observable<{ trendingDay: Movie[], trendingWeek: Movie[] }> {
    return this.ensureConfigLoaded(() => {
      return forkJoin({
        trendingDay: this.getTrendingMovies('day', 1, 5),
        trendingWeek: this.getTrendingMovies('week', 1, 5)
      }).pipe(
        catchError(err => {
          console.error('Error fetching home movies data (trending)', err);
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