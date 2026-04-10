import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { ProfilEnseignant } from '../../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';

@Component({
  selector: 'app-profil-enseignant',
  imports: [ReactiveFormsModule],
  templateUrl: './profil-enseignant.html',
  styleUrl: './profil-enseignant.css',
})
export class ProfilEnseignantComponent {

  profilEnseignantFb !:FormGroup; 
  constructor(private fb:FormBuilder, private generalService :GeneralService){
    this.profilEnseignantFb = this.fb.group({
      id : new FormControl(), 
      intitule : new FormControl()
    }); 

    this.getAllProfilEnseignant();
  }

   listProfilEnseignant = signal<ProfilEnseignant[]>([]); 
  getAllProfilEnseignant(){
    this.generalService.findAllProfilEnseignants().subscribe({
      next:(data :ProfilEnseignant[])=>{
        this.listProfilEnseignant.set(data); 
      }, 
      error : ()=>{
        console.log('fetch list profil enseignant : failed');
      }
    }); 
  }

  createProfilEnseignant(){
    const formData = new FormData(); 
    formData.append("profil", JSON.stringify(this.profilEnseignantFb.value)); 
    console.log('data profil:', this.profilEnseignantFb.value); 

    this.generalService.createProfilEnseignant(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllProfilEnseignant();
        }
      }, 
      error :()=>{
        console.log('creation ProfilEnseignantFb : failed'); 
      }
    });
  }

  deleteProfilEnseignant(id:any){
    this.generalService.deleteProfilEnseignant(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllProfilEnseignant();
        }
      }, 
      error : ()=>{
        console.log('delete profil Enseignant : failed');
      }
    }); 
  }




}
