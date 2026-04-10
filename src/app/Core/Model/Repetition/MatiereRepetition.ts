import { Matiere } from "../Academie/Matiere";
import { SessionRepetition } from "./SessionRepetition";

export interface MatiereRepetition{
    id : number ; 
    repetition : SessionRepetition; 
    matiere : Matiere; 
}