import { Composition } from "./Composition";
import { ReponsePossible } from "./ReponsePossible";

export interface Question{
    id : number ; 
    enonce : string ; 
    points : number ;
    composition :Composition; 
}

export interface QuestionConstruct{
    question : Question ; 
    reponsesPossibles : ReponsePossible[]; 
}