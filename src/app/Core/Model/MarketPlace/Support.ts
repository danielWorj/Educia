import { Filiere } from "../Academie/Filiere";
import { Matiere } from "../Academie/Matiere";
import { Niveau } from "../Academie/Niveau";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { TypeRessource } from "./TypeRessource";

export interface Support{
    id:number ; 
    title : string ; 
    resume : string; 
    prix : number ; 
    statut : boolean ; 
    date : string; 
    matiere : Matiere ; 
    niveau : Niveau ; 
    filiere : Filiere ; 
    file : string; 
    type:TypeRessource; 
    enseignant : Enseignant; 
}

