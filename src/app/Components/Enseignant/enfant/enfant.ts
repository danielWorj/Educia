import { Component, signal } from '@angular/core';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { SessionRepetition } from '../../../Core/Model/Repetition/SessionRepetition';
import { Eleve } from '../../../Core/Model/Utilisateur/Eleve/Eleve';

@Component({
  selector: 'app-enfant',
  imports: [],
  templateUrl: './enfant.html',
  styleUrl: './enfant.css',
})
export class Enfant {
  idEnseignant = signal<number>(0); 
  constructor(private repetitionService : RepetitionService){
    this.idEnseignant.set(parseInt(sessionStorage.getItem("id")!)); 

    console.log("Enseignant Id : ", this.idEnseignant());

    this.loadPage();

  }

  listSessionRepetition = signal<SessionRepetition[]>([]); 
  listEnfant = signal<Eleve[]>([]); 
  resultEnfant: Eleve[] = []; 

  loadPage(){
    this.getAllSessionRepetition(); 
  }

  getAllSessionRepetition(){
    this.listSessionRepetition.set([]); 
    this.repetitionService.findAllSessionRepetitionByEnseignant(this.idEnseignant()).subscribe({
      next : (data : SessionRepetition[])=>{
        
        this.listSessionRepetition.set(data); 

        for(const s of this.listSessionRepetition()){
          this.resultEnfant.push(s.offreRepetition.eleve); 
        }

        this.listEnfant.set(this.resultEnfant);
      }, 
      error: ()=>{
        console.log('Erreur fetch session repetition : failed'); 
      }
    });

  }
}
