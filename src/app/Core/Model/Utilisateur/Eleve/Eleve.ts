import { Filiere } from "../../Academie/Filiere";
import { Niveau } from "../../Academie/Niveau";
import { Parent } from "../Parents";
import { Utilisateur } from "../Utilisateur";
import { Etablissement } from "./Etablissement";

export interface Eleve extends Utilisateur{
    dateNaissance : string ; 
   // etablissement : Etablissement ; 
    niveau : Niveau ; 
    redoublant : boolean ; 
    filiere : Filiere
    parent : Parent; 
}