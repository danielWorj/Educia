import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MarketPlaceService } from '../../../../Core/Service/MarketPlace/market-place-service';
import { Support } from '../../../../Core/Model/MarketPlace/Support';
import { TypeRessource } from '../../../../Core/Model/MarketPlace/TypeRessource';
import { Matiere } from '../../../../Core/Model/Academie/Matiere';
import { GeneralService } from '../../../../Core/Service/General/general-service';

@Component({
  selector: 'app-gsupport',
  imports: [],
  templateUrl: './gsupport.html',
  styleUrl: './gsupport.css',
})
export class GSupport {
  supportFb!:FormGroup; 
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

    this.loadPage(); 
  }

  loadPage(){
    this.getAllSupport(); 
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
      }, 
      error:()=>{
        console.log('Fecth list support : failed'); 
      }
    }); 
  }

 



}
