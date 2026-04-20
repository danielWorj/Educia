import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { sign } from 'crypto';
import { MarketPlaceService } from '../../../../Core/Service/MarketPlace/market-place-service';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { TypeRessource } from '../../../../Core/Model/MarketPlace/TypeRessource';
import { Matiere } from '../../../../Core/Model/Academie/Matiere';
import { Support } from '../../../../Core/Model/MarketPlace/Support';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Filiere } from '../../../../Core/Model/Academie/Filiere';
import { DevenirRepetiteur } from "../../../site/home/Formulaire/devenir-repetiteur/devenir-repetiteur";

@Component({
  selector: 'app-g-esupport',
  imports: [ReactiveFormsModule, DevenirRepetiteur],
  templateUrl: './g-esupport.html',
  styleUrl: './g-esupport.css',
})
export class GEsupport {
   supportFb!:FormGroup;
   idEnseignant = signal<number>(0);  
  constructor(private fb:FormBuilder, private marketPlaceService :MarketPlaceService , private generalService :GeneralService){
    this.supportFb = this.fb.group({
      id: new FormControl(),
      title: new FormControl(),
      prix: new FormControl(),
      matiere: new FormControl(),
      niveau: new FormControl(),
      filiere: new FormControl(),
      type: new FormControl(),
      enseignant: new FormControl(),
    }); 

    this.idEnseignant.set(2); //TEST
    //this.idEnseignant.set(parseInt(sessionStorage.getItem("id")!)); 
    
    this.loadPage(); 

  }

  loadPage(){
    this.getAllSupport(); 
    this.dataToForm();
  }

  listRessource = signal<TypeRessource[]>([]); 
  listMatiere = signal<Matiere[]>([]); 
  getAllDataToFilter(){
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next:(data:TypeRessource[])=>this.listRessource.set(data), 
      error : (err)=>console.log('Erreur de liste des ressources', err)
    });


    this.generalService.findAllMatiere().subscribe({
      next:(data:Matiere[])=>this.listMatiere.set(data), 
      error : (err)=>console.log('Erreur de liste des Matieres', err)
    });
  }

  listSupport = signal<Support[]>([]); 
  getAllSupport(){
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next:(data:Support[])=>{
        this.listSupport.set(data); 

        console.log(this.listSupport());
      }, 
      error:()=>{
        console.log('Fecth list support : failed'); 
      }
    }); 
  }

  listNiveau = signal<Filiere[]>([]); 
  listFiliere = signal<Filiere[]>([]); 
  dataToForm(){
    this.generalService.findAllFiliere().subscribe({
      next:(data:Filiere[])=>this.listFiliere.set(data), 
      error : (err)=>console.log('Erreur de liste des filiere', err)
    });

    this.generalService.findAllNiveau().subscribe({
      next:(data:Filiere[])=>this.listNiveau.set(data), 
      error : (err)=>console.log('Erreur de liste des niveau', err)
    });

    this.marketPlaceService.findAllTypeRessource().subscribe({
      next:(data:TypeRessource[])=>this.listRessource.set(data), 
      error : (err)=>console.log('Erreur de liste des ressources', err)
    });


    this.generalService.findAllMatiere().subscribe({
      next:(data:Matiere[])=>this.listMatiere.set(data), 
      error : (err)=>console.log('Erreur de liste des Matieres', err)
    });

    console.log(this.listFiliere());
    console.log(this.listNiveau());
  }

 

  fileSupport!:File ; 
  onSelectSupportFile(photo: any): void { 
    if (photo.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(photo.target.files[0]);
      reader.onload=(event :any)=>{
        this.fileSupport = photo.target.files[0];
        console.log('Nom du ducoment :'+this.fileSupport.name); 
      }
    }
  }

  createSupport(){
      this.supportFb.controls['enseignant'].setValue(this.idEnseignant()); 

      const formData : FormData = new FormData(); 

      formData.append("support", JSON.stringify(this.supportFb.value)); 
      formData.append("file", this.fileSupport); 

      console.log(this.supportFb.value); 

      this.marketPlaceService.createMarketplaceItem(formData).subscribe({
        next:(data:ResponseServer)=>{
          if (data.status) {
            alert(data.message); 
            this.loadPage(); 
            this.supportFb.reset(); 
          }
        }, 
        error:()=>{
          console.log('Erreur ed creation du support');
        }
      })
  }
}
