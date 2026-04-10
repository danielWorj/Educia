import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { CategorieMatiere } from '../../../../Core/Model/Academie/CategorieMatiere';
import { Matiere } from '../../../../Core/Model/Academie/Matiere';

@Component({
  selector: 'app-matiere',
  imports: [ReactiveFormsModule],
  templateUrl: './matiere.html',
  styleUrl: './matiere.css',
})
export class MatiereComponent {
  matiereFb! : FormGroup; 
  categorieMatiereFb! : FormGroup; 

  constructor(private fb:FormBuilder, private generalService:GeneralService){

    this.matiereFb = this.fb.group({
      id : new FormControl(),
      intitule : new FormControl(), 
      categorieMatiere: new FormControl()
    }); 

    this.getAllMatiere();

  

  }
  //Matiere
  listMatiere = signal<Matiere[]>([]); 
  getAllMatiere(){
    this.generalService.findAllMatiere().subscribe({
      next:(data :Matiere[])=>{
        this.listMatiere.set(data); 
        console.log('list matiere :', data);
      }, 
      error : ()=>{
        console.log('fetch list diplome : failed');
      }
    }); 
  }

  createMatiere(){
    const formData = new FormData(); 
    formData.append("matiere", JSON.stringify(this.matiereFb.value)); 
    console.log('data matiere:', this.matiereFb.value); 

    this.generalService.createMatiere(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllMatiere(); 
        }
      }, 
      error :()=>{
        console.log('creation matiere : failed'); 
      }
    });
  }

  deleteMatiere(id:any){
    this.generalService.deleteMatiere(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
        }
      }, 
      error : ()=>{
        console.log('delete  matiere : failed');
      }
    }); 
  }


  listCategorieMatiere = signal<CategorieMatiere[]>([]); 
  getAllCategorieMatiere(){
    this.generalService.findAllCategorieMatiere().subscribe({
      next:(data :CategorieMatiere[])=>{
        this.listCategorieMatiere.set(data); 
      }, 
      error : ()=>{
        console.log('fetch list diplome : failed');
      }
    }); 
  }
  
  

}
