import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-guide',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './guide.html',
  styleUrl: './guide.css',
})
export class Guide {

  role = signal<number>(0); 
  @Output() continueToLogin = new EventEmitter<boolean>(); 

  constructor(private router: Router){
    this.role.set(parseInt(sessionStorage.getItem('role')!)); 

      console.log('role :', this.role()); 


    if (this.role()==2) {
      console.log('Role : 2 Enseignant'); 
    }else if(this.role()==3){
      console.log('Role : 3 Parent'); 
    }
  }

  boutonContinuer(){
    // let dashboardRoute = 'auth'; 
    // this.router.navigate([dashboardRoute]);
    this.continueToLogin.emit(true); 

  }

}
