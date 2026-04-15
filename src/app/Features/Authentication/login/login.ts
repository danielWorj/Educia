import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../../Core/Service/Auth/auth-service';
import { AuthData } from '../../../Core/Model/Auth/AuthData';
import { Router } from 'express';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   loginForm !:FormGroup; 
  constructor(private fb : FormBuilder , private authService : AuthService , private router: Router){

    this.loginForm = this.fb.group({
      email : new FormControl(), 
      password : new FormControl()
    }); 
  }

  loginD(){
  //  this.statutConnection.emit(true);
 

    const formData: FormData = new FormData(); 

    formData.append("auth", JSON.stringify(this.loginForm.value)); 

    console.log(this.loginForm.value); 

    this.authService.login(formData).subscribe({
      next: (data: AuthData) => {
        if (data.id != 0) {
        
          // Stocker l'id et le role
          localStorage.setItem('id', `${data.id}`); 
          localStorage.setItem('role', `${data.role}`); 
          
          // Mapping rôle -> route
          let dashboardRoute: string;
          
          switch(data.role) {
            case 1:
              dashboardRoute = '/dashboard-admin';
              break;
            case 2:
              dashboardRoute = '/dashboard-enseignant';
              break;
            case 3:
              dashboardRoute = '/dashboard-parent';
              break;
            case 4:
              dashboardRoute = '/dashboard-eleve';
              break;
            default:
              dashboardRoute = '/login';
          }
          
          // Redirection
          this.router.navigate([dashboardRoute]);
        } else {
          alert('identifiant incorrect'); 
        }
      }, 
      error: () => {
        console.log('Erreur de connexion');
      }
    });
  }
}
