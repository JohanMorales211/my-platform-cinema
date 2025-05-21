export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number | string;
  posterUrl: string;
  backdropUrl?: string;
  ratingPercentage?: number;
  ratingOutOf10?: string;
  duration?: string;
  description: string;
  genres: string[];
  actors: string[];
  trailerUrl?: string;
}

export const ALL_MOVIES: Movie[] = [
  {
    id: 'como-entrenar-a-tu-dragon',
    title: 'Cómo entrenar a tu dragón',
    year: 2010,
    posterUrl: 'assets/images/movies/como_entrenar_a_tu_dragon.png',
    backdropUrl: 'assets/images/movies/como_entrenar_a_tu_dragon.png',
    ratingPercentage: 90,
    duration: '1h 38min',
    description: 'Un joven vikingo marginado llamado Hipo aspira a seguir la tradición de su tribu de convertirse en un cazador de dragones. Después de capturar a su primer dragón, y con la oportunidad de finalmente ganarse la aceptación de la tribu, se da cuenta de que ya no quiere matar al dragón y en su lugar se hace amigo de él.',
    genres: ['Animación', 'Aventura', 'Familiar'],
    actors: ['Jay Baruchel', 'Gerard Butler', 'Craig Ferguson', 'America Ferrera'],
    trailerUrl: 'https://www.youtube.com/embed/liGB1ssYn38'
  },
  {
    id: 'elio',
    title: 'Elio',
    year: 2025,
    posterUrl: 'assets/images/movies/elio.png',
    backdropUrl: 'assets/images/movies/elio.png',
    ratingPercentage: undefined,
    duration: 'N/A',
    description: 'Elio es un niño de once años que es transportado accidentalmente a través de la galaxia y confundido con el embajador intergaláctico de la Tierra.',
    genres: ['Animación', 'Aventura', 'Ciencia Ficción'],
    actors: ['Yonas Kibreab', 'America Ferrera', 'Jameela Jamil', 'Brad Garrett'],
    trailerUrl: 'https://www.youtube.com/embed/TN8QGXCpBLg'
  },
  {
    id: 'mision-imposible-sentencia-final',
    title: 'Misión Imposible: Sentencia final',
    originalTitle: 'Mission: Impossible – Dead Reckoning Part One',
    year: 2023,
    posterUrl: 'assets/images/movies/mision_imposible_sentencia_final.jpeg',
    backdropUrl: 'assets/images/movies/mision_imposible_sentencia_final.jpeg',
    ratingPercentage: 78,
    duration: '2h 43min',
    description: 'Ethan Hunt y su equipo del FMI se embarcan en su misión más peligrosa hasta la fecha: localizar una nueva y aterradora arma que amenaza a toda la humanidad antes de que caiga en las manos equivocadas.',
    genres: ['Acción', 'Aventura', 'Thriller'],
    actors: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg'],
    trailerUrl: 'https://www.youtube.com/embed/Zk8gDi2ef9Y'
  },
  {
    id: 'lilo-y-stitch',
    title: 'Lilo y Stitch',
    year: 2002,
    posterUrl: 'assets/images/movies/lilo_y_stitch.png',
    backdropUrl: 'assets/images/movies/lilo_y_stitch.png',
    ratingPercentage: 85,
    duration: '1h 25min',
    description: 'Una niña hawaiana solitaria adopta una "mascota" aparentemente inocente que resulta ser un peligroso experimento genético alienígena que se ha estrellado en la Tierra.',
    genres: ['Animación', 'Aventura', 'Comedia'],
    actors: ['Daveigh Chase', 'Chris Sanders', 'Tia Carrere', 'David Ogden Stiers'],
    trailerUrl: 'https://www.youtube.com/embed/9JIyINjMfcc'
  },
  {
    id: 'f1',
    title: 'F1',
    year: 2025,
    posterUrl: 'assets/images/movies/f1.jpeg',
    backdropUrl: 'assets/images/movies/f1.jpeg',
    ratingOutOf10: '8.1/10',
    duration: '2h 10min',
    description: 'Un ex piloto de Fórmula 1 regresa al deporte para asociarse con un novato contra los titanes del deporte.',
    genres: ['Drama', 'Deporte'],
    actors: ['Brad Pitt', 'Damson Idris', 'Kerry Condon', 'Tobias Menzies'],
    trailerUrl: 'https://www.youtube.com/embed/aw8YyC4B1EA'
  },
  {
    id: 'megan-2-0',
    title: 'M3gan 2.0',
    year: 2025,
    posterUrl: 'assets/images/movies/megan_2_0.jpeg',
    backdropUrl: 'assets/images/movies/megan_2_0.jpeg',
    ratingOutOf10: '6.8/10',
    duration: '1h 45min',
    description: 'Secuela de la exitosa película de terror M3GAN.',
    genres: ['Terror', 'Ciencia Ficción', 'Thriller'],
    actors: ['Allison Williams', 'Violet McGraw', 'Jenna Davis (voz)']
  },
  {
    id: 'superman',
    title: 'Superman',
    year: 2025,
    posterUrl: 'assets/images/movies/superman.jpeg',
    backdropUrl: 'assets/images/movies/superman.jpeg',
    ratingOutOf10: '7.9/10',
    duration: '2h 30min',
    description: 'La película sigue el viaje de Superman para reconciliar su herencia kryptoniana con su educación humana como Clark Kent de Smallville, Kansas.',
    genres: ['Acción', 'Aventura', 'Ciencia Ficción'],
    actors: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult']
  }
];