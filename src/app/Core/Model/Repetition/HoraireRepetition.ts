import { Repetition } from "../../../Components/Enseignant/repetition/repetition";

export interface HoraireRepetition{
    id : number ; 
    jour : string ; 
    timeStart : string ; 
    timeEnd : string ; 
    repetition : Repetition
}