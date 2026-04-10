import { Question } from "./Question";

export interface ReponsePossible{
    id : number ;
    reponse:string; 
    correcte : boolean ; 
    question:Question; 
}