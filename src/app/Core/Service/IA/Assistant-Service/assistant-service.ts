import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { edulearnDashboard } from '../../../Constant/EndPoints';
import { ScoreMatch } from '../../../Model/IA/ScoreMatch';
import { MatchingResult } from '../../../Model/IA/MatchingResult';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  constructor(private http:HttpClient){}

  findAssistance():Observable<any>{
    return this.http.get(
      'http://localhost:8080/edulearn/api/ia/assistant', { 
      responseType: 'text' 
    }); 
  }

  findAssistanceTextuelle(prompt :any):Observable<any>{
     return this.http.post(
      'http://localhost:8080/edulearn/api/ia/assistant-textuel',
      prompt
      ,{ 
      responseType: 'text' 
    });
  }

  testMacthingProcess(request:any){
    return this.http.post<any>("http://localhost:5000/match", request); 

  }

  matchingForOffre(id:number):Observable<MatchingResult[]>{
    return this.http.get<MatchingResult[]>(edulearnDashboard.IA.matchingForOffre+id);
  }
  
}
