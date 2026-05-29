import { Enseignant } from "../Utilisateur/Enseignant/Enseignant";
import { AvisIA } from "./AvisIA";

export interface MatchingResult {
  enseignant:     Enseignant;
  score:          number;
  interpretation: string;
  avisIA:         AvisIA ;
}