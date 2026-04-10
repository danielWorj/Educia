import { Question } from "./Question";
import { ReponseEleve } from "./ReponseEleve";
import { ReponsePossible } from "./ReponsePossible";

export interface Correction{
    question : Question; 
    reponseChoisie: ReponseEleve; 
    reponseCorrecte : ReponsePossible ; //Reponse possible ou is true 
}