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

  login(request :any):Observable<AuthData>{
    return this.httpClient.post<AuthData>(edulearnDashboard.Auth.login , request); 
  }
}
