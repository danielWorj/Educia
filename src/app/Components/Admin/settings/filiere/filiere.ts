import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Filiere } from '../../../../Core/Model/Academie/Filiere';
import { Section } from '../../../../Core/Model/Academie/Section';

@Component({
  selector: 'app-filiere',
  imports: [ReactiveFormsModule],
  templateUrl: './filiere.html',
  styleUrl: './filiere.css',
})
export class FiliereComponent {
  filiereFb!:FormGroup; 


  constructor(private fb:FormBuilder, private generalService:GeneralService){

     this.filiereFb = this.fb.group({
      id:new FormControl(),
      intitule : new FormControl(),
      section : new FormControl()
    }); 

    this.getaLLFiliere();
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

  listFiliere = signal<Filiere[]>([]); 
  getaLLFiliere(){
    this.generalService.findAllFiliere().subscribe({
      next:(data :Filiere[])=>{
        this.listFiliere.set(data); 
        console.log('fliere', this.listFiliere()); 
      }, 
      error : ()=>{
        console.log('fetch list filiere : failed');
      }
    }); 
  }

  createFiliere(){
    const formData = new FormData(); 
    formData.append("filiere", JSON.stringify(this.filiereFb.value)); 
    console.log('data niveau:', this.filiereFb.value); 

    this.generalService.createFiliere(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getaLLFiliere(); 
        }
      }, 
      error :()=>{
        console.log('creation section : failed'); 
      }
    });
  }


  deleteFiliere(id:any){
    this.generalService.deleteDiplome(id).subscribe({
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
