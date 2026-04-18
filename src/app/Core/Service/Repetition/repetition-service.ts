import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { Matiere } from '../../Model/Academie/Matiere';
import { Enseignant } from '../../Model/Utilisateur/Enseignant/Enseignant';
import { MatiereOffre } from '../../Model/Repetition/MatiereOffre';
import { Offre } from '../../Model/Repetition/Offre';

@Injectable({
  providedIn: 'root',
})
export class RepetitionService {
  constructor(private http:HttpClient) {}

  //Offre Repetition

  findAllOffre():Observable<Offre[]>{
    return this.http.get<Offre[]>(edulearnDashboard.OffreRepetition.all);
  }
  createOffre(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.OffreRepetition.createnew, request);
  }

  //CANDIDATURE 
  findAllCandidature():Observable<Offre[]>{
    return this.http.get<Offre[]>(edulearnDashboard.OffreRepetition.Candidature.all);
  }
  createCandidature(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.OffreRepetition.Candidature.create, request);
  }
  updateCandidature(request: any): Observable<ResponseServer> {
    return this.http.post<ResponseServer>(edulearnDashboard.OffreRepetition.Candidature.update, request);
  }
  deleteCandidature(id:number): Observable<ResponseServer> {
    return this.http.get<ResponseServer>(edulearnDashboard.OffreRepetition.Candidature.delete+id);
  }


  //MATIERE OFFRE
  findAllMatiereOffre(id:number):Observable<MatiereOffre[]>{
    return this.http.get<MatiereOffre[]>(edulearnDashboard.OffreRepetition.MatiereOffre.allByOffre+id);
  }
}
