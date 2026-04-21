import { Component, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { Candidature } from '../../../../Core/Model/Repetition/Candidature';
import { Offre } from '../../../../Core/Model/Repetition/Offre';

@Component({
  selector: 'app-gcandidature',
  imports: [],
  templateUrl: './gcandidature.html',
  styleUrl: './gcandidature.css',
})
export class Gcandidature {
  candidatureFb !: FormGroup; 
  constructor(private fb:FormGroup , private repetitionService : RepetitionService){
    this.loadPage();  

  }

  loadPage(){
    this.getAllCandidature(); 
  }

  listCandidature = signal<Candidature[]>([]); 
  listCandidatureSaved = signal<Candidature[]>([]); 
  getAllCandidature(){
    this.repetitionService.findAllCandidature().subscribe({
    next:(data:Candidature[])=>{
      this.listCandidature.set(data);
      this.listCandidatureSaved.set(data);
    }, 
      error : (err)=>console.log('Erreur de liste des candidatures', err) 
    });
  }

  selectCandidature = signal<Candidature | null>(null);
  editCandidature(candidature:Candidature){
    this.selectCandidature.set(candidature);
    this.candidatureFb.patchValue(candidature);
  }

  deleteCandidature(id:number){
    this.repetitionService.deleteCandidature(id).subscribe({
      next:(data)=> {
        console.log('Candidature supprimée', data);
        this.getAllCandidature(); // Rafraîchir la liste après suppression
      },
      error : (err)=>console.log('Erreur de suppression de candidature', err) 
    });
  }

  listOffres = signal<Offre[]>([]);
  getDataForFilterByOffre(){
    this.listOffres.set(this.listCandidature().map(c => c.offre)); // Extraire les offres des candidatures
  }

  filtreParOffre(id:number){
    this.listCandidature.set(this.listCandidatureSaved().filter(c => c.offre.id == id)); 
  }

  refreshList(){
    this.listCandidature.set(this.listCandidatureSaved()); 
  }

}
