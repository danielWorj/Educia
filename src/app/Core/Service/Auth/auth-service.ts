import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthData } from '../../Model/Auth/AuthData';
import { edulearnDashboard } from '../../Constant/EndPoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient : HttpClient){

  }

  isAuthenticated(): boolean {
    const id = localStorage.getItem('id');
    return !!id; // Returns true if id exists, false otherwise
  }

  login(request :any):Observable<AuthData>{
    return this.httpClient.post<AuthData>(edulearnDashboard.Auth.login , request); 
  }
}
