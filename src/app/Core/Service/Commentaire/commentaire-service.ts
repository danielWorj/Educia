import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commentaire } from '../../Model/Commentaire/Commentaire';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';

@Injectable({
  providedIn: 'root',
})
export class CommentaireService {
  constructor(private http:HttpClient){

  }

  getAllCommentaireByEnseignant(id:number):Observable<Commentaire[]>{
    return this.http.get<Commentaire[]>(edulearnDashboard.Commentaire.allByEnseignant+id); 
  }

  getAllCommentaireByParent(id:number):Observable<Commentaire[]>{
    return this.http.get<Commentaire[]>(edulearnDashboard.Commentaire.allByParent+id); 
  }

  createCommentaire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.Commentaire.create, request); 
  }

  updateCommentaire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.Commentaire.update, request); 
  }
}
