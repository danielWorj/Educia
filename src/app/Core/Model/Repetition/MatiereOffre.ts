import { Matiere } from "../Academie/Matiere";
import { Offre } from "./Offre";

export interface MatiereOffre{
    id : number; 
    offre : Offre ; 
    matiere : Matiere; 
}