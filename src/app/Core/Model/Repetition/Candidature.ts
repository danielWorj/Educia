import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { Offre } from "./Offre";

export interface Candidature{
    id:number ; 
    date : string ; 
    offre : Offre ; 
    enseignant : Enseignant ; 
}