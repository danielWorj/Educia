import { Evaluation } from "./Evaluation";
import { Question } from "./Question";
import { ReponsePossible } from "./ReponsePossible";

export interface ReponseEleve{
    id :number ; 
    evaluation : Evaluation; 
    question : Question; 
    reponseChoisie : ReponsePossible;
}