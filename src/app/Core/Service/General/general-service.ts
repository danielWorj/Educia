import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Section } from '../../Model/Academie/Section';
import { StatusEnseignant } from '../../Model/Utilisateur/Enseignant/StatusEnseignant';
import { Diplome } from '../../Model/Utilisateur/Enseignant/Diplome';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { ProfilEnseignant } from '../../Model/Utilisateur/Enseignant/ProfilEnseignant';
import { Filiere } from '../../Model/Academie/Filiere';
import { Niveau } from '../../Model/Academie/Niveau';
import { Matiere } from '../../Model/Academie/Matiere';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { CategorieMatiere } from '../../Model/Academie/CategorieMatiere';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {

  constructor(private http :HttpClient) { }

  //Section
  findAllSections():Observable<Section[]> {
    return this.http.get<Section[]>(edulearnDashboard.General.Section.all);
  }

  createSection(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.Section.create, request);
  }

  updateSection(request:any):Observable<ResponseServer>{
    return this.http.put<ResponseServer>(edulearnDashboard.General.Section.update, request);
  }

  deleteSection(idSection:number):Observable<ResponseServer>{ 
    return this.http.delete<ResponseServer>(edulearnDashboard.General.Section.delete + idSection);
  }

  //Filiere
  findAllFiliere():Observable<Filiere[]> {
    return this.http.get<Filiere[]>(edulearnDashboard.General.Filiere.all);
  }

  findAllFiliereBySection(id :number):Observable<Filiere[]> {
    return this.http.get<Filiere[]>(edulearnDashboard.General.Filiere.allBySection+id);
  }

  createFiliere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.Filiere.create, request);
  }

  deleteFiliere(idFiliere:any):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(edulearnDashboard.General.Filiere.delete+idFiliere);
  }


  //Niveau
  findAllNiveau():Observable<Niveau[]> {
    return this.http.get<Niveau[]>(edulearnDashboard.General.Niveau.all);
  }

  findAllNiveauBySection(id :number):Observable<Niveau[]> {
    return this.http.get<Niveau[]>(edulearnDashboard.General.Niveau.allBySection+id);
  }

  createNiveau(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.Niveau.create, request);
  }
  //Profil Enseignant
  findAllProfilEnseignants():Observable<ProfilEnseignant[]> {
    return this.http.get<ProfilEnseignant[]>(edulearnDashboard.General.ProfilEnseignant.all); 
  }

  createProfilEnseignant(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.ProfilEnseignant.create, request);
  }

  deleteProfilEnseignant(idProfilEnseignant:number):Observable<ResponseServer>{
    return this.http.delete<ResponseServer>(edulearnDashboard.General.ProfilEnseignant.delete + idProfilEnseignant);
  }

  //Status Enseignant
  findAllStatusEnseignants():Observable<StatusEnseignant[]> {
    return this.http.get<StatusEnseignant[]>(edulearnDashboard.General.StatusEnseignant.all); 
  }

  createStatusEnseignant(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.StatusEnseignant.create, request);
  }
  deleteStatusEnseignant(idStatusEnseignant:number):Observable<ResponseServer>{
    return this.http.delete<ResponseServer>(edulearnDashboard.General.StatusEnseignant.delete + idStatusEnseignant);
  }

  //Profil Enseignant 
  findAllDiplomes():Observable<Diplome[]> {
    return this.http.get<any[]>(edulearnDashboard.General.Diplome.all); 
  }

  createDiplome(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.Diplome.create, request);
  }

  deleteDiplome(idDiplome:number):Observable<ResponseServer>{
    return this.http.delete<ResponseServer>(edulearnDashboard.General.Diplome.delete + idDiplome);
  }


  //Matiere
  findAllMatiere():Observable<Matiere[]> {
    return this.http.get<Matiere[]>(edulearnDashboard.General.Matiere.all); 
  }

  findAllMatiereBySection(id:number):Observable<Matiere[]> {
    return this.http.get<Matiere[]>(edulearnDashboard.General.Matiere.allBySection+id); 
  }

  createMatiere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.Matiere.create, request);
  }

  deleteMatiere(idMatiere:number):Observable<ResponseServer>{
    return this.http.delete<ResponseServer>(edulearnDashboard.General.Matiere.delete + idMatiere);
  }

  //categorie matiere 
  findAllCategorieMatiere():Observable<CategorieMatiere[]> {
    return this.http.get<CategorieMatiere[]>(edulearnDashboard.General.CategorieMatiere.all);
  }

  findAllCategorieMatiereBySection(id :number):Observable<CategorieMatiere[]> {
    return this.http.get<CategorieMatiere[]>(edulearnDashboard.General.CategorieMatiere.allBySection+id);
  }

  createCategorieMatiere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(edulearnDashboard.General.CategorieMatiere.create, request);
  }

  deleteCategorieMatiere(idMatiere:number):Observable<ResponseServer>{
    return this.http.delete<ResponseServer>(edulearnDashboard.General.CategorieMatiere.delete + idMatiere);
  }
  
}
