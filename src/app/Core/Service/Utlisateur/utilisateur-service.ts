import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enseignant } from '../../Model/Utilisateur/Enseignant/Enseignant';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { Eleve } from '../../Model/Utilisateur/Eleve/Eleve';
import { Parent } from '../../Model/Utilisateur/Parents';

@Injectable({
  providedIn: 'root',
})
export class UtilisateurService {
  constructor(private http :HttpClient){}

  //NEW METHODS 
  publicationOffre(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>("http://localhost:8080/edulearn/api/repetition/new/offre/create", request);
  }

  //Enseignant related methods
  findAllEnseignants():Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(edulearnDashboard.Enseignant.all);
  }

  findAllEnseignantsBySection(idSection: number):Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${edulearnDashboard.Enseignant.allBySection}${idSection}`);
  }

  findAllEnseignantsByStatus(status: string):Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${edulearnDashboard.Enseignant.allByStatus}${status}`);
  }

  findAllEnseignantsByProfil(idProfil: number):Observable<Enseignant[]> {
    return this.http.get<Enseignant[]>(`${edulearnDashboard.Enseignant.allByProfil}${idProfil}`);
  }
  countEnseignants():Observable<number> {
    return this.http.get<number>(edulearnDashboard.Enseignant.count);
  }

  createEnseignant(request: any): Observable<number> {
    return this.http.post<number>(edulearnDashboard.Enseignant.create, request);
  }

  changeStatus(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(edulearnDashboard.Enseignant.changestatus+id);
  }

  findEnseignantById(id: number): Observable<Enseignant> {
    return this.http.get<Enseignant>(`${edulearnDashboard.Enseignant.findById}${id}`);
  }

  changeStatusEnseignant(id: number, ids: number): Observable<ResponseServer> {
    return this.http.get<ResponseServer>(edulearnDashboard.Enseignant.changestatus+id+'/'+ids);
  }


   deleteEnseignant(id:number):Observable<ResponseServer> {
    return this.http.get<ResponseServer>(edulearnDashboard.Enseignant.delete+id);
  }


  //Parent related methods
  createParent(request:any): Observable<number> {
    return this.http.post<number>(`${edulearnDashboard.Parent.create}`, request);
  }

  changeStatusParent(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(edulearnDashboard.Parent.changestatus+id);
  }

  findParentById(id: number): Observable<Parent> {
    return this.http.get<Parent>(`${edulearnDashboard.Parent.findById}${id}`);
  }


  findAllParent():Observable<Parent[]> {
    return this.http.get<Parent[]>(`${edulearnDashboard.Parent.all}`);
  }

  deleteParent(id:number):Observable<ResponseServer> {
    return this.http.get<ResponseServer>(edulearnDashboard.Parent.delete+id);
  }

  




  //Eleve 
   createEleve(request:any): Observable<number> {
    return this.http.post<number>(`${edulearnDashboard.Eleve.create}`, request);
  }
  
  findAllEleveByParent(id: number):Observable<Eleve[]> {
    return this.http.get<Eleve[]>(`${edulearnDashboard.Eleve.allByParent}${id}`);
  }

  countEleveByParent(id: number):Observable<number> {
    return this.http.get<number>(`${edulearnDashboard.Eleve.countByParent}${id}`);
  }
}
