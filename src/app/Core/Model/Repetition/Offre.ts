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

}

export interface OffreDescript{
    offre : Offre; 
    matieres : MatiereOffre[]; 
}