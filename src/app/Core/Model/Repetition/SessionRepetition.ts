import { OffreRepetition } from "../../../Components/Parents/offre-repetition/offre-repetition";
import { Matiere } from "../Academie/Matiere";
import { Eleve } from "../Utilisateur/Eleve/Eleve";
import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { MatiereRepetition } from "./MatiereRepetition";
import { OffreRepetitionM } from "./OffreRepetition";

export interface SessionRepetition{
    id : number ; 
    enseignant : Enseignant ; 
    offreRepetition  : OffreRepetitionM; 
    montant : number ; 
}


export interface SessionRepetitionConstruct{
    sessionRepetition : SessionRepetition ; 
    matieres : MatiereRepetition[]; 
}