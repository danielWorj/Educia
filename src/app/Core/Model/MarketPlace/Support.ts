import { Filiere } from "../Academie/Filiere";
import { Matiere } from "../Academie/Matiere";
import { Niveau } from "../Academie/Niveau";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { TypeRessource } from "./TypeRessource";

export interface Support{
    id:number ; 
    title : string ; 
    prix : number ; 
    matiere : Matiere ; 
    niveau : Niveau ; 
    filiere : Filiere ; 
    type:TypeRessource; 
    enseignant : Enseignant; 
}

