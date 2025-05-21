import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Movie, ALL_MOVIES } from '../app/movie-data';
import { KeepHtmlStrongPipe } from '../shared/pipes/keep-html-strong.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, KeepHtmlStrongPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  latestMovies: Movie[] = ALL_MOVIES.slice(0, 4);

  featuredDayMovies: Movie[] = ALL_MOVIES.filter(m => ['f1', 'megan-2-0', 'superman'].includes(m.id));
  featuredWeekMovies: Movie[] = ALL_MOVIES.filter(m => ['elio', 'mision-imposible-sentencia-final', 'lilo-y-stitch'].includes(m.id));

  activeTab: 'day' | 'week' = 'day';

  welcomeTextFull: string = "En <strong>Johan Films</strong>, te sumergirás en el emocionante universo del cine. Nuestra plataforma está dedicada a presentarte los tráilers de las películas más recientes y las selecciones más destacadas. Explora, descubre y prepárate para tu próxima gran aventura cinematográfica.";
  displayedWelcomeText: string = "";
  private typingInterval: any;
  private typingSpeed: number = 5;

  get currentFeaturedMovies(): Movie[] {
    return this.activeTab === 'day' ? this.featuredDayMovies : this.featuredWeekMovies;
  }

  constructor() {}

  ngOnInit(): void {
    this.startTypingAnimation();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  startTypingAnimation(): void {
    let charIndex = 0;
    this.displayedWelcomeText = "";

    let currentTextSegment = "";
    let inTag = false;

    this.typingInterval = setInterval(() => {
      if (charIndex < this.welcomeTextFull.length) {
        const char = this.welcomeTextFull.charAt(charIndex);
        currentTextSegment += char;

        if (char === '<') {
          inTag = true;
        } else if (char === '>') {
          inTag = false;
        }

        if (!inTag || (inTag && char === '>')) {
            this.displayedWelcomeText = currentTextSegment;
        } else if (!inTag) {
             this.displayedWelcomeText = currentTextSegment;
        }

        charIndex++;
      } else {
        clearInterval(this.typingInterval);
        this.displayedWelcomeText = this.welcomeTextFull;
      }
    }, this.typingSpeed);
  }

  selectTab(tab: 'day' | 'week') {
    this.activeTab = tab;
  }
}