import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { TypeRessource } from "./TypeRessource";

export interface Ressource{
    id :number ; 
    nom :string ; 
    description :string ; 
    url :string ; 
    prix :number ; 
    typeResource : TypeRessource; 
    enseignant : Enseignant; 
    date : string; 
}