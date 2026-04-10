import { Session } from "node:inspector/promises";
import { Repetition } from "../../../Components/Enseignant/repetition/repetition";
import { Matiere } from "../Academie/Matiere";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { TypeEvaluation } from "./TypeEvaluation";
import { SessionRepetition } from "../Repetition/SessionRepetition";

export interface Composition{
    id : number;
    description : string ; 
    duree : string ; 
    active : boolean ; 
    typeEvaluation : TypeEvaluation; 
    dateCreation : Date ;
    archived : boolean ;
    repetition : SessionRepetition; 
    matiere : Matiere ; 
}