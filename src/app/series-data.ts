export interface Series {
  id: string;
  title: string;
  originalTitle?: string;
  firstAirYear: number | string;
  posterUrl: string;
  backdropUrl?: string;
  ratingPercentage?: number;
  ratingOutOf10?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  description: string;
  genres: string[];
  actors: string[];
  trailerUrl?: string;
}