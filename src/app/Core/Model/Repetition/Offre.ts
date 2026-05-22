import { Filiere } from "../Academie/Filiere";
import { Niveau } from "../Academie/Niveau";
import { Parent } from "../Utilisateur/Parents";
import { MatiereOffre } from "./MatiereOffre";

export interface Offre {
  id: number;
  bio: string;
  budget: string;
  frequence: number;
  duree: string;
  parent: Parent; 
  niveau : Niveau; 
  filiere : Filiere ; 
  date : string;

}

export interface OffreDescript{
    offre : Offre; 
    matieres : MatiereOffre[]; 
    candidature : number ; //nombre de candidatures pour cette offre
}

export interface OffreExposeDetails{
  offre : Offre; 
  matieres : MatiereOffre[]; 
}