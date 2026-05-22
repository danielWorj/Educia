import { MatiereOffre } from "../Repetition/MatiereOffre";
import { Offre } from "../Repetition/Offre";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";

export interface MatchingDB{
    id : number ; 
    offre : Offre ; 
    enseignant : Enseignant; 
    score : number ; 
    date : string; 
}

export interface MatchingDBDetails {
    matching : MatchingDB; 
    matieres : MatiereOffre[]; 
}