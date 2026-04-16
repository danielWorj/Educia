import { Component } from '@angular/core';
import { AnimationsService } from '../../../Core/Service/AnimationsJs/animation-service';
import { DevenirRepetiteur } from "./Formulaire/devenir-repetiteur/devenir-repetiteur";
import { TrouverRepetiteur } from "./Formulaire/trouver-repetiteur/trouver-repetiteur";

@Component({
  selector: 'app-home',
  imports: [DevenirRepetiteur, TrouverRepetiteur],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private animationService : AnimationsService){ 

  }
  // ngAfterViewInit() {
  //   this.animationService.initReveal();
  //   this.animationService.initCounters();
  //   this.animationService.initProgressBars();
  // }
}
