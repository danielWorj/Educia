import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Composition } from '../../Model/Evaluation/Composition';
import { edulearnDashboard } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { Question } from '../../Model/Evaluation/Question';
import { ReponsePossible } from '../../Model/Evaluation/ReponsePossible';
import { Evaluation, TentativeEvaluation } from '../../Model/Evaluation/Evaluation';
import { ReponseEleve } from '../../Model/Evaluation/ReponseEleve';
import { TypeEvaluation } from '../../Model/Evaluation/TypeEvaluation';

@Injectable({
  providedIn: 'root',
})
export class EvaluationService {
  constructor(private httpClient : HttpClient) {}
  //Type Evaluation API
  getAllTypeEvaluation():Observable<TypeEvaluation[]>{
    return this.httpClient.get<TypeEvaluation[]>(edulearnDashboard.Evaluation.TypeEvaluation.all);
  }
  createTypeEvaluation(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.TypeEvaluation.create, request);
  }

  //Composition API
  getAllCompositionByEnseignant(id:number):Observable<Composition[]>{
    return this.httpClient.get<Composition[]>(edulearnDashboard.Evaluation.Composition.allbyenseignant + id);
  }

  getAllCompositionByMatiere(id:number):Observable<Composition[]>{
    return this.httpClient.get<Composition[]>(edulearnDashboard.Evaluation.Composition.allbymatiere + id);
  }

  getAllCompositionNonArchivedByEleve(id:number):Observable<Composition[]>{
    return this.httpClient.get<Composition[]>(edulearnDashboard.Evaluation.Composition.allNonArchivedbyEleve + id);
  }

  getAllCompositionNonArchivedByMatiere(id:number):Observable<Composition[]>{
    return this.httpClient.get<Composition[]>(edulearnDashboard.Evaluation.Composition.allNonArchivedbyMatiere + id);
  }

  createComposition(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.Composition.create, request);
  }

  updateComposition(request : any ): Observable<ResponseServer>{
    return this.httpClient.post<ResponseServer>(edulearnDashboard.Evaluation.Composition.update, request);
  }

  deleteComposition(id : number ): Observable<ResponseServer>{
    return this.httpClient.delete<ResponseServer>(edulearnDashboard.Evaluation.Composition.delete + id);
  }

  //Question API
  getAllQuestionByComposition(id:number):Observable<Question[]>{
    return this.httpClient.get<Question[]>(edulearnDashboard.Evaluation.Question.allbycomposition + id);
  }

  createQuestion(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.Question.create, request);
  }

  updateQuestion(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.Question.update, request);
  }

  deleteQuestion(id : number ): Observable<ResponseServer>{
    return this.httpClient.delete<ResponseServer>(edulearnDashboard.Evaluation.Question.delete + id);
  }

  //ReponsePossible API

  getAllReponsePossibleByQuestion(id:number):Observable<ReponsePossible[]>{
    return this.httpClient.get<ReponsePossible[]>(edulearnDashboard.Evaluation.ReponsePossible.allByQuestion + id);
  }

  findReponsePossibleIsTrueByQuestion(id:number):Observable<ReponsePossible>{
    return this.httpClient.get<ReponsePossible>(edulearnDashboard.Evaluation.ReponsePossible.isTruebyQuestion + id);
  }

  createReponsePossible(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.ReponsePossible.create, request);
  }

  updateReponsePossible(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.ReponsePossible.update, request);
  }

  validateReponsePossible(id : number ): Observable<ResponseServer>{
    return this.httpClient.get<ResponseServer>(edulearnDashboard.Evaluation.ReponsePossible.validate + id);
  }

  deleteReponsePossible(id : number ): Observable<ResponseServer>{
    return this.httpClient.get<ResponseServer>(edulearnDashboard.Evaluation.ReponsePossible.delete + id);
  }


  //Tentative Evaluation API

  getAllTentativeEvaluationByEleve(id:number):Observable<Evaluation[]>{
    return this.httpClient.get<Evaluation[]>(edulearnDashboard.Evaluation.TentativeEvaluation.allbyeleve + id);
  }

  findTentativeEvaluationByComposition(id:number):Observable<TentativeEvaluation>{
    return this.httpClient.get<TentativeEvaluation>(edulearnDashboard.Evaluation.TentativeEvaluation.findByComposition + id);
  }

  findTentativeEvaluationByEleveAndMatiere(idE:number , idM:number):Observable<TentativeEvaluation[]>{
    return this.httpClient.get<TentativeEvaluation[]>(edulearnDashboard.Evaluation.TentativeEvaluation.findByEleveAndMatiere + idE+'/'+idM);
  }


  createTentativeEvaluation(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.TentativeEvaluation.create, request);
  }

  updateTentativeEvaluation(request : any ): Observable<number>{
    return this.httpClient.post<number>(edulearnDashboard.Evaluation.TentativeEvaluation.update, request);
  }

  deleteTentativeEvaluation(id : number ): Observable<ResponseServer>{
    return this.httpClient.get<ResponseServer>(edulearnDashboard.Evaluation.TentativeEvaluation.delete + id);
  }

  findNoteFinalForTentativeEvaluation(id : number ): Observable<number>{
    return this.httpClient.get<number>(edulearnDashboard.Evaluation.TentativeEvaluation.noteFinal + id);
  }

  nettoyageTentativeEvaluation(id : number ): Observable<ResponseServer>{
    return this.httpClient.get<ResponseServer>(edulearnDashboard.Evaluation.TentativeEvaluation.nettoyage + id);
  }


  //Reponse Eleve API

  getAllReponseEleveByTentativeEvaluation(id:number):Observable<ReponseEleve[]>{
    return this.httpClient.get<ReponseEleve[]>(edulearnDashboard.Evaluation.ReponseEleve.allbytentative + id);
  }

  findReponseEleveByQuestion(id:number):Observable<ReponseEleve>{
    return this.httpClient.get<ReponseEleve>(edulearnDashboard.Evaluation.ReponseEleve.byquestion + id);
  }

  createReponseEleve(request : any ): Observable<ResponseServer>{
    return this.httpClient.post<ResponseServer>(edulearnDashboard.Evaluation.ReponseEleve.create, request);
  }

  updateReponseEleve(request : any ): Observable<ResponseServer>{
    return this.httpClient.post<ResponseServer>(edulearnDashboard.Evaluation.ReponseEleve.update, request);
  }

  deleteReponseEleve(id : number ): Observable<ResponseServer>{
    return this.httpClient.delete<ResponseServer>(edulearnDashboard.Evaluation.ReponseEleve.delete + id);
  }


}
