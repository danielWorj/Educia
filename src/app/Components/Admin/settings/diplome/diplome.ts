import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { Diplome } from '../../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-diplome',
  imports: [ReactiveFormsModule],
  templateUrl: './diplome.html',
  styleUrl: './diplome.css',
})
export class DiplomeComponent {
  
  diplomeFB:FormGroup;
  constructor(private fb:FormBuilder, private generalService:GeneralService){
     this.diplomeFB = this.fb.group({
      id : new FormControl(), 
      intitule : new FormControl(),
    }); 

    this.getAllDiplome();

  }


  //Diplome 
  listDiplome = signal<Diplome[]>([]); 
  getAllDiplome(){
    this.generalService.findAllDiplomes().subscribe({
      next:(data :Diplome[])=>{
        this.listDiplome.set(data); 
      }, 
      error : ()=>{
        console.log('fetch list diplome : failed');
      }
    }); 
  }

  createDiplome(){
    const formData = new FormData(); 
    formData.append("diplome", JSON.stringify(this.diplomeFB.value)); 
    console.log('data diplome:', this.diplomeFB.value); 

    this.generalService.createDiplome(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          
          this.diplomeFB.reset();
          this.getAllDiplome(); 
        }
      }, 
      error :()=>{
        console.log('creation diplome : failed'); 
      }
    });
  }

  deleteDiplome(id:any){
    this.generalService.deleteDiplome(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
        }
      }, 
      error : ()=>{
        console.log('delete diplome : failed');
      }
    }); 
  }

}
