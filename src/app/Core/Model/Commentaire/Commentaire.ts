import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { Parent } from "../Utilisateur/Parents";

export interface Commentaire{
    id :number; 
    contenu : string ; 
    enseignant : Enseignant; 
    parent : Parent; 
}