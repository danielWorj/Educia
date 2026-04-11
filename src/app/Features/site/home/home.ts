import { Component } from '@angular/core';
import { AnimationsService } from '../../../Core/Service/AnimationsJs/animation-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private animationService : AnimationsService){ 

  }
  ngAfterViewInit() {
    this.animationService.initReveal();
    this.animationService.initCounters();
    this.animationService.initProgressBars();
  }
}
