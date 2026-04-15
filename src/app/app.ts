import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('educia');

  //Test
  constructor() {
    this.initialiseIdToTest();
  }

  initialiseIdToTest(){
    localStorage.setItem('id', '1');
  }
}
