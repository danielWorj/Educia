import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { Niveau } from '../../../../Core/Model/Academie/Niveau';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Section } from '../../../../Core/Model/Academie/Section';

@Component({
  selector: 'app-niveau',
  imports: [ReactiveFormsModule],
  templateUrl: './niveau.html',
  styleUrl: './niveau.css',
})
export class NiveauComponent {
  niveauFb!:FormGroup; 

  constructor(private fb : FormBuilder, private generalService : GeneralService){
     this.niveauFb = this.fb.group({
      id : new FormControl(), 
      intitule : new FormControl(), 
      section : new FormControl(), 
    }); 

    this.getAllNiveau();

    this.getAllSection();
  }

   //Filiere 
    listSection = signal<Section[]>([]); 
    getAllSection(){
      this.generalService.findAllSections().subscribe({
        next:(data :Section[])=>{
          this.listSection.set(data); 
        }, 
        error : ()=>{
          console.log('fetch list section : failed');
        }
      }); 
    }
  
   
  listNiveau = signal<Niveau[]>([]); 
  getAllNiveau(){
    this.generalService.findAllNiveau().subscribe({
      next:(data :Niveau[])=>{
        this.listNiveau.set(data); 
      }, 
      error : ()=>{
        console.log('fetch list niveau : failed');
      }
    }); 
  }

  createNiveau(){
    const formData = new FormData(); 
    formData.append("niveau", JSON.stringify(this.niveauFb.value)); 
    console.log('data niveau:', this.niveauFb.value); 

    this.generalService.createNiveau(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllNiveau(); 
        }
      }, 
      error :()=>{
        console.log('creation section : failed'); 
      }
    });
  }


  deleteNiveau(id:any){
    this.generalService.deleteSection(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
        }
      }, 
      error : ()=>{
        console.log('fetch list section : failed');
      }
    }); 
  }

}
