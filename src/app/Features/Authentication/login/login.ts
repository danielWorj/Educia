import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { AuthService } from '../../../Core/Service/Auth/auth-service';
import { AuthData } from '../../../Core/Model/Auth/AuthData';
import { ActivatedRoute , Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   loginForm !:FormGroup; 
  constructor(private fb : FormBuilder ,
     private authService : AuthService , 
     private router: Router, 
     private route:ActivatedRoute){

    this.loginForm = this.fb.group({
      email : new FormControl(), 
      password : new FormControl()
    }); 
  }

  
  roleRoutes: Record<number, string> = {
    1: '/admin/admin-dashboard',
    2: '/admin/admin-enseignants', 
    3: '/portail/dasboard',
    4: 'admin/admin-parents'
  };


  //1- ADMIN
  //2-ENSEIGNANT
  //3-PARENT
  //4-ELEVE

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

           console.log(data);


          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          console.log('Return URL:', returnUrl);
          const defaultRoute = this.roleRoutes[data.role] ?? '/landing-page';
          const safeUrl = returnUrl?.startsWith('/') ? returnUrl : defaultRoute;
          this.router.navigateByUrl(safeUrl);
        

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
