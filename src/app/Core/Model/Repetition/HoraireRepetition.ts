import { Repetition } from "../../../Features/admin/admin-enseignant/repetition/repetition";

export interface HoraireRepetition{
    id : number ; 
    jour : string ; 
    timeStart : string ; 
    timeEnd : string ; 
    repetition : Repetition
}