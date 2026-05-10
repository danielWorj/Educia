import { Component, signal } from '@angular/core';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { Candidature } from '../../../../Core/Model/Repetition/Candidature';
import { Offre } from '../../../../Core/Model/Repetition/Offre';

@Component({
  selector: 'app-portail-candidature',
  imports: [],
  templateUrl: './portail-candidature.html',
  styleUrl: './portail-candidature.css',
})
export class PortailCandidature {
  idParent = signal<number>(0); 
  constructor(private repetitionService : RepetitionService){
    this.idParent.set(parseInt(localStorage.getItem("id")!)??0); 

  }

  listOffre = signal<Offre[]>([]); 
  getAllOffre(){
    this.repetitionService.findAllOffreByParent(this.idParent()).subscribe({
      next:(data : Offre[])=>{
        this.listOffre.set(data);
      }, 
      error:()=>{
        console.log('Fecth list offre by parent');
      }
    });
  }

  offreSelected = signal<Offre | null>(null);
  listCandidatures = signal<Candidature[]>([]);
  getAllCandidatureByOffre(o:Offre){
    this.repetitionService.findAllCandidatureByOffre(o.id).subscribe({
      next:(data : Candidature[])=>{
        this.listCandidatures.set(data);
      }, 
      error:()=>{
        console.log('Fetch all candidature');
      }
    }); 
  }

  candidatureSelected = signal<Candidature | null>(null);

  getAllCandidature(o:Offre){
     this.repetitionService.findAllCandidatureByOffre(o.id).subscribe({
      next:(data : Candidature[])=>{
        this.listCandidatures.set(data);
      }, 
      error:()=>{
        console.log('Fetch all candidature');
      }
    }); 
  }

  selectCandidature(c:Candidature){
    this.candidatureSelected.set(c); 
  }


  //Mettre le code pour joindre par whatsapp
}
