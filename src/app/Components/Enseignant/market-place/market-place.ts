import { Component, signal } from '@angular/core';
import { TypeRessource } from '../../../Core/Model/MarketPlace/TypeRessource';
import { Ressource } from '../../../Core/Model/MarketPlace/Ressource';
import { MarketPlaceService } from '../../../Core/Service/MarketPlace/market-place-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-market-place',
  imports: [ReactiveFormsModule],
  templateUrl: './market-place.html',
  styleUrl: './market-place.css',
})
export class MarketPlace {

  idEnseignant = signal<number>(0); 
  ressourceForm!:FormGroup; 

  constructor(private fb:FormBuilder,  private marketPlaceService : MarketPlaceService) {
    this.ressourceForm = this.fb.group({
      id: new FormControl(), 
      nom: new FormControl(), 
      description: new FormControl(), 
      url: new FormControl(), 
      prix: new FormControl(), 
      enseignant: new FormControl(), 
      typeResource: new FormControl(), 
    }); 

    //this.idEnseignant.set(2); //TEST
    this.idEnseignant.set(parseInt(sessionStorage.getItem("id")!)); 
    this.loadPage();
  
  }

  loadPage(){
    this.getAllRessource(); 
    this.getAllTypeRessource(); 
  }

  listRessource = signal<Ressource[]>([]);

  getAllRessource() {
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next: (ressources:Ressource[]) => {
        this.listRessource.set(ressources);
        console.log('List des ressources :'+ressources); 
      },
      error: (err) => {
        console.error('Error fetching ressources:', err);
      }
    });
  }

  listTypeRessource=signal<TypeRessource[]>([]); 
  getAllTypeRessource(){
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next: (typeressources:TypeRessource[]) => {
        this.listTypeRessource.set(typeressources);
        console.log('List des ressources :'+typeressources); 

      },
      error: (err) => {
        console.error('Error fetching ressources:', err);
      }
    });
  }

  isCreation = signal<boolean>(false); 
  toggleToCreation(){
    this.isCreation.set(true); 

  }

  selectRessource(r:Ressource){
    this.isCreation.set(false); 

    this.ressourceForm.controls['id'].setValue(r.id);
    this.ressourceForm.controls['nom'].setValue(r.nom);
    this.ressourceForm.controls['description'].setValue(r.description);
    this.ressourceForm.controls['url'].setValue(r.url);
    this.ressourceForm.controls['prix'].setValue(r.prix);
    this.ressourceForm.controls['typeResource'].setValue(r.typeResource.id);
    this.ressourceForm.controls['enseignant'].setValue(r.enseignant.id);
  }

   createMarketPlace(){
   if (this.isCreation()) {
      //alert('Creation'); 

      this.ressourceForm.controls['enseignant'].setValue(this.idEnseignant()); 

      const formData :FormData = new FormData(); 
      formData.append("ressource", JSON.stringify(this.ressourceForm.value)); 
      formData.append("fichier", (this.file)); 

      console.log(this.ressourceForm.value); 

      this.marketPlaceService.createMarketplaceItem(formData).subscribe({
        next:(data :ResponseServer)=>{
          if (data.status) {
            alert('Nouvelle ressource creee'); 
            this.ressourceForm.reset(); 
            this.loadPage(); 
          }
        }, 
        error: ()=>{
          console.log('Erreur de creation ressource marketplace : failed '); 
        }
      });
   }

   if (!this.isCreation()) {
    //alert('mise a jour'); 

    const formData :FormData = new FormData(); 
    formData.append("ressource", JSON.stringify(this.ressourceForm.value)); 
    formData.append("fichier", this.file); 

    console.log(this.ressourceForm.value); 

    this.marketPlaceService.updateMarketplaceItem(formData).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert('Nouvelle ressource mise a jour' ); 
          this.ressourceForm.reset(); 
          this.loadPage(); 
        }
      }, 
      error: ()=>{
        console.log('Erreur de update ressoource : failed '); 
      }
    })
   }
  }


  //Photo de profil 
  fetchPhotoUrl = signal<string>('')  ;
  fetchPhotoState = signal<boolean>(false);
  photoFileName = signal<string>('');
  photoFileSize = signal<string>('');
  file!:File ; 
  fileName = signal<string>('');

  selectPhotoUploaded(photo: any): void { 
      if (photo.target.files) {
        this.fetchPhotoState.set(true);
        let reader = new FileReader();
        reader.readAsDataURL(photo.target.files[0]);
        reader.onload=(event :any)=>{

          this.fetchPhotoUrl.set(event.target.result) ; 
          this.file = photo.target.files[0];

          this.fileName.set(this.file.name); 
          this.photoFileName.set(this.file.name);

          console.log('Nom de la photo :'+this.fileName); 
        }
    }
  }

  documentSelected = signal<Ressource | undefined>(undefined);
  voirRessource = signal<boolean>(false); 
  voirDetailRessource(r:Ressource){
    this.voirRessource.set(true); 
    this.documentSelected.set(r); 
  }
}
