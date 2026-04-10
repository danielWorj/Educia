import { Utilisateur } from "./Utilisateur";

export interface Parent extends Utilisateur {
    profession : string ; 
    cni : string ; 
}