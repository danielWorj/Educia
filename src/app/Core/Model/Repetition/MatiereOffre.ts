import { FormControl } from "@angular/forms";
import { OffreRepetitionM } from "./OffreRepetition";
import { Matiere } from "../Academie/Matiere";

export interface MatiereOffre{
    id:number;
    offreRepetition: OffreRepetitionM;
    matiere:Matiere;
}