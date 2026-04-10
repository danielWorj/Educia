import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {  OffreRepetitionM } from '../../Model/Repetition/OffreRepetition';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { SessionRepetition } from '../../Model/Repetition/SessionRepetition';
import { MatiereRepetition } from '../../Model/Repetition/MatiereRepetition';
import { HoraireRepetition } from '../../Model/Repetition/HoraireRepetition';
import { Matiere } from '../../Model/Academie/Matiere';
import { Enseignant } from '../../Model/Utilisateur/Enseignant/Enseignant';
import { MatiereOffre } from '../../Model/Repetition/MatiereOffre';

@Injectable({
  providedIn: 'root',
})
export class RepetitionService {
  constructor(private http:HttpClient) {}

  //Offre Repetition

  findAllOffreRepetition():Observable<OffreRepetitionM[]> {
    return this.http.get<OffreRepetitionM[]>(edulearnDashboard.OffreRepetition.all);
  }

  findOffreByCode(code :string):Observable<OffreRepetitionM>{
    return this.http.get<OffreRepetitionM>(edulearnDashboard.OffreRepetition.findByCode+code);
  }
  createOffreRepetition(request: any): Observable<number> {
    return this.http.post<number>(edulearnDashboard.OffreRepetition.create, request);
  }
  updateOffreRepetition(request: any): Observable<ResponseServer> {
    return this.http.put<ResponseServer>(edulearnDashboard.OffreRepetition.update, request);
  }
  deleteOffreRepetition(id: number): Observable<ResponseServer> {
    return this.http.delete<ResponseServer>(edulearnDashboard.OffreRepetition.delete + id);
  }

  findOffreRepetitionById(id: number): Observable<OffreRepetitionM> {
    return this.http.get<OffreRepetitionM>(edulearnDashboard.OffreRepetition.findById + id);
  }

  findOffreRepetitionByParentId(parentId: number): Observable<OffreRepetitionM[]> {
    return this.http.get<OffreRepetitionM[]>(edulearnDashboard.OffreRepetition.findByParent + parentId);
  }



  //Session Repetition 

  createSessionRepetition(request: any): Observable<number> {
    return this.http.post<number>(edulearnDashboard.SessionRepetition.create, request);
  }

  updateSessionRepetition(request: any): Observable<number> {
    return this.http.post<number>(edulearnDashboard.SessionRepetition.update, request);
  }
  
  findAllSessionRepetitionByEnseignant(id:number):Observable<SessionRepetition[]> {
    return this.http.get<SessionRepetition[]>(edulearnDashboard.SessionRepetition.findByEnseignant+id);
  }

  //Matiere Repetion 

  findAllMatiereRepetition(id :number):Observable<MatiereRepetition[]> {
    return this.http.get<MatiereRepetition[]>(edulearnDashboard.SessionRepetition.MatiereRepetition.allByRepetition+id);
  }

  createMatiereRepetition(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.SessionRepetition.MatiereRepetition.create, request);
  }

  findAllMatiereByRepetition(id :number):Observable<Matiere[]> {
    return this.http.get<Matiere[]>(edulearnDashboard.SessionRepetition.MatiereRepetition.allmatierebyrepetition+id);
  }

  findAllMatiereByEleve(id :number):Observable<Matiere[]> {
    return this.http.get<Matiere[]>(edulearnDashboard.SessionRepetition.MatiereRepetition.allmatierebyeleve+id);
  }
   //Horaire Repetion 

  findAllHoraireRepetition(id:number):Observable<HoraireRepetition[]> {
    return this.http.get<HoraireRepetition[]>(edulearnDashboard.SessionRepetition.HoraireRepetition.allByRepetition+id);
  }

  createHoraireRepetition(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.SessionRepetition.HoraireRepetition.create, request);
  }



  //Matiere - Offer de repetition review 16/01/2025

  findAllMatiereOffre(id:number):Observable<MatiereOffre[]> {
    return this.http.get<MatiereOffre[]>(edulearnDashboard.OffreRepetition.MatiereOffre.allByOffre+id);
  }

  createMatiereOffre(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.OffreRepetition.MatiereOffre.create, request);
  }
}
