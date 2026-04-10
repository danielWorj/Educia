import { Component, signal } from '@angular/core';
import { MarketPlaceService } from '../../../Core/Service/MarketPlace/market-place-service';
import { Ressource } from '../../../Core/Model/MarketPlace/Ressource';
import { TypeRessource } from '../../../Core/Model/MarketPlace/TypeRessource';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';

@Component({
  selector: 'app-market-place-platform',
  imports: [],
  templateUrl: './market-place.html',
  styleUrl: './market-place.css',
})
export class MarketPlacePlatform {
  constructor(private marketPlaceService : MarketPlaceService) {
    this.getAllRessource();
    this.constructFilter();
  }

  listRessource = signal<Ressource[]>([]);

  getAllRessource() {
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next: (ressources:Ressource[]) => {
        
        this.listRessource.set(ressources);

        console.log('list des ressources :'+ this.listRessource());
        console.log(this.listRessource);
        console.log('la taille de listRessource est  :'+ this.listRessource.length);

      },
      error: (err) => {
        console.error('Error fetching ressources:', err);
      }
    });
  }


  documentSelected = signal<Ressource | undefined>(undefined);
  voirRessource = signal<boolean>(false); 
  voirDetailRessource(r:Ressource){
    this.voirRessource.set(true); 
    this.documentSelected.set(r); 
  }

  listTypeRessource=signal<TypeRessource[]>([]); 
  getAllTypeRessource(){
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next: (typeressources:TypeRessource[]) => {
        this.listTypeRessource.set(typeressources);
      },
      error: (err) => {
        console.error('Error fetching ressources:', err);
      }
    });
  }

  //listItems = signal<Ressource[]>([]); 

  listAuteur = signal<Enseignant[]>([]); 
  listDate = signal<string[]>([]); 
  listAllTypeDocument = signal<TypeRessource[]>([]); 

  resultatAuteur : Enseignant[]=[]; 
  resultatDate : string[] = []; 
  resultatTypeDoc : TypeRessource[] =[]; 

  async constructFilter(){
    let listItems = await this.marketPlaceService.findMarketplaceItems().toPromise(); 
    

    for(const r of listItems!){
      this.resultatAuteur.push(r.enseignant);
      this.resultatDate.push(r.date);
      this.resultatTypeDoc.push(r.typeResource); 
    }

    this.listAuteur.set(this.resultatAuteur);
    this.listDate.set(this.resultatDate); 
    this.listAllTypeDocument.set(this.resultatTypeDoc);
  }


  
}
