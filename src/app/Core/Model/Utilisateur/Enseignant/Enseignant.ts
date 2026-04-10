import { Section } from "../../Academie/Section";
import { Utilisateur } from "../Utilisateur";
import { Diplome } from "./Diplome";
import { ProfilEnseignant } from "./ProfilEnseignant";
import { StatusEnseignant } from "./StatusEnseignant";

export interface Enseignant extends Utilisateur {
    anneeexperience : number ; 
    dateNaissance : string ; 
    bio : string ; 
    tarifHoraire : number ; 
    cv : string ; 
    cni : string ; 
    diplomeurl : string ; 
    section : Section ; 
    specialite :string;
    diplome : Diplome; 
    statusEnseignant : StatusEnseignant; 
    profilEnseignant : ProfilEnseignant; 

}