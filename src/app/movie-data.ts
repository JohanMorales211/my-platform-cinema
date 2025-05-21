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
    year: 2025,
    posterUrl: 'assets/images/movies/como_entrenar_a_tu_dragon.png',
    backdropUrl: 'assets/images/movies/como_entrenar_a_tu_dragon.png',
    ratingPercentage: 90,
    duration: '1h 37min',
    description: 'En la escarpada Isla Mema, donde vikingos y dragones han sido enemigos acérrimos, el ingenioso pero subestimado Hipo Horrendo Abadejo III, hijo del jefe Estoico el Vasto, desafía siglos de tradición al forjar una amistad inesperada con Chimuelo, un temido dragón Furia Nocturna. Este vínculo improbable revela la verdadera naturaleza de los dragones, desafiando los cimientos de la sociedad vikinga. Con la ayuda de la feroz Astrid y el peculiar herrero Bocón, Hipo se enfrenta a un mundo dividido por el miedo; a medida que surge una antigua amenaza que pone en peligro a ambos bandos, la amistad de Hipo con Chimuelo se convierte en la clave para forjar un nuevo futuro, volando más allá de los límites de sus mundos y redefiniendo lo que significa ser un héroe y un líder.',
    genres: ['Animación', 'Aventura', 'Familiar', 'Fantasía'],
    actors: ['Mason Thames', 'Nico Parker', 'Gerard Butler', 'Nick Frost', 'Julian Dennison', 'Gabriel Howell', 'Bronwyn James', 'Harry Trevaldwyn', 'Ruth Codd', 'Peter Serafinowicz', 'Murray McArthur'],
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
    ratingPercentage: 98,
    duration: '2h 43min',
    description: 'Ethan Hunt y su equipo del FMI se embarcan en su misión más peligrosa hasta la fecha: localizar una nueva y aterradora arma que amenaza a toda la humanidad antes de que caiga en las manos equivocadas.',
    genres: ['Acción', 'Aventura', 'Thriller'],
    actors: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson', 'Vanessa Kirby'],
    trailerUrl: 'https://www.youtube.com/embed/Zk8gDi2ef9Y'
  },
  {
    id: 'lilo-y-stitch',
    title: 'Lilo y Stitch',
    year: 2025,
    posterUrl: 'assets/images/movies/lilo_y_stitch.png',
    backdropUrl: 'assets/images/movies/lilo_y_stitch.png',
    ratingPercentage: 75,
    duration: '1h 48min',
    description: 'Una niña hawaiana solitaria adopta una "mascota" aparentemente inocente que resulta ser un peligroso experimento genético alienígena que se ha estrellado en la Tierra, y forja con él una familia poco convencional, conocida como Ohana.',
    genres: ['Aventura', 'Comedia', 'Ciencia ficción', 'Familiar'],
    actors: ['Maia Kealoha', 'Chris Sanders', 'Sydney Agudong', 'Zach Galifianakis', 'Billy Magnussen', 'Courtney B. Vance', 'Tia Carrere', 'Amy Hill', 'Kaipo Dudoit', 'Hannah Waddingham'],
    trailerUrl: 'https://www.youtube.com/embed/9JIyINjMfcc'
  },
  {
    id: 'f1',
    title: 'F1',
    originalTitle: 'F1',
    year: 2025,
    posterUrl: 'assets/images/movies/f1.jpeg',
    backdropUrl: 'assets/images/movies/f1.jpeg',
    duration: '2h 33min',
    description: 'Un ex piloto de Fórmula 1, Sonny Hayes, regresa al deporte tras un terrible accidente en los años 90. Treinta años después, su antiguo compañero de equipo, ahora dueño de un equipo de F1 en apuros, lo convence de volver para mentorizar a un joven y prometedor piloto, Joshua Pearce, y competir contra los titanes del deporte.',
    genres: ['Acción', 'Drama', 'Deporte'],
    actors: ['Brad Pitt', 'Damson Idris', 'Kerry Condon', 'Tobias Menzies', 'Javier Bardem'],
    trailerUrl: 'https://www.youtube.com/embed/aw8YyC4B1EA'
  },
  {
    id: 'megan-2-0',
    title: 'M3gan 2.0',
    year: 2025,
    posterUrl: 'assets/images/movies/megan_2_0.jpeg',
    backdropUrl: 'assets/images/movies/megan_2_0.jpeg',
    ratingPercentage: 75,
    duration: '1h 59min',
    description: 'Dos años después de los eventos de la primera película, la creadora de M3GAN, Gemma, se ha convertido en una reconocida autora y defensora de la regulación de la inteligencia artificial. Sin embargo, la tecnología subyacente de M3GAN ha sido robada y utilizada para crear un arma militar avanzada, Amelia, que amenaza con un levantamiento de IA. Ante esta nueva amenaza, Gemma y su ahora adolescente sobrina Cady deben recurrir a una resucitada y mejorada M3GAN, más rápida, fuerte y letal, para enfrentarse a Amelia y salvar a la humanidad.',
    genres: ['Terror', 'Ciencia Ficción', 'Thriller', 'Acción'],
    actors: ['Allison Williams', 'Violet McGraw', 'Jenna Davis (voz)', 'Amie Donald (cuerpo)', 'Ivanna Sakhno', 'Jemaine Clement', 'Aristotle Athari', 'Timm Sharp'],
    trailerUrl: 'https://www.youtube.com/embed/IYLHdEzsk1s'
  },
  {
    id: 'superman',
    title: 'Superman',
    originalTitle: 'Superman',
    year: 2025,
    posterUrl: 'assets/images/movies/superman.jpeg',
    backdropUrl: 'assets/images/movies/superman.jpeg',
    duration: '2h 20min',
    description: 'La película sigue el viaje de Superman para reconciliar su herencia kryptoniana con su educación humana como Clark Kent, un joven reportero. Mientras se establece como un símbolo de esperanza en un mundo que a menudo ve la verdad y la justicia como anticuadas, debe equilibrar su vida como superhéroe y su rol como periodista, interactuando con personajes clave como Lois Lane y enfrentándose a nuevos desafíos.',
    genres: ['Acción', 'Aventura', 'Ciencia Ficción', 'Fantasía'],
    actors: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult', 'Edi Gathegi', 'Anthony Carrigan', 'Nathan Fillion', 'Isabela Merced', 'María Gabriela de Faría', 'Skyler Gisondo', 'Sara Sampaio', 'Pruitt Taylor Vince', 'Neva Howell', 'Wendell Pierce', 'Frank Grillo'],
    trailerUrl: 'https://www.youtube.com/embed/Wskajz4fm5M'
  }
];