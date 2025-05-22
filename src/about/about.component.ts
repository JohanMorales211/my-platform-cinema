import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeepHtmlStrongPipe } from '../shared/pipes/keep-html-strong.pipe'; // Asegúrate que la ruta es correcta

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, KeepHtmlStrongPipe],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  pageTitle: string = "¿Quién Soy y Por Qué Esto?";
  welcomeText: string = `
    <p>Esta plataforma no solo está dedicada a presentarte los tráilers de las películas más recientes y las selecciones más destacadas; también <strong>nació con la intención de mostrar mis habilidades en el desarrollo front-end y de ser un nuevo proyecto destacado para mi portafolio.</strong></p>
    <p>Mi nombre es Johan Morales, y soy un apasionado Ingeniero de Software con un gran interés por crear experiencias de usuario atractivas y funcionales. Filmix es un reflejo de mi dedicación y amor por la tecnología.</p>
    <p>Aquí podrás explorar, descubrir y, con suerte, encontrar inspiración para tu próxima gran aventura cinematográfica. ¡Gracias por visitar!</p>
  `;
  portfolioLink: string = "https://johanmorales211.github.io/portafolio-personal/";
  portfolioButtonText: string = "Mi Portafolio Personal";

  constructor() { }
}