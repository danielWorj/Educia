import { MatiereOffre } from "../Repetition/MatiereOffre";
import { Offre } from "../Repetition/Offre";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { AvisIA } from "./AvisIA";

export interface MatchingDB{
    id : number ; 
    offre : Offre ; 
    enseignant : Enseignant; 
    score : number ; 
    date : string; 
    avisIAS: AvisIA[];
}

export interface MatchingDBDetails {
    matching : MatchingDB; 
    matieres : MatiereOffre[]; 
}