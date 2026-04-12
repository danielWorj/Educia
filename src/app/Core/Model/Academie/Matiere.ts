import { CategorieMatiere } from "./CategorieMatiere";

export interface Matiere{
    id : number ; 
    intitule :string ; 
    categorieMatiere:CategorieMatiere;
}