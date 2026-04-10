import { Filiere } from "../Academie/Filiere";
import { Niveau } from "../Academie/Niveau";
import { Eleve } from "../Utilisateur/Eleve/Eleve";
import { Parent } from "../Utilisateur/Parents";
import { MatiereOffre } from "./MatiereOffre";

export interface OffreRepetitionM{
     id :number ; 
    intitule :string;
    bio :string ; 
    salaireMin :string ; 
    salaireMax :string ;
    dateCreation :string; 
    frequence :number; 
    duree :number;  
    eleve:Eleve;  
}

export interface OffreRepetitionMConstruct{
    offre : OffreRepetitionM; 
    matieres : MatiereOffre[]; 
}