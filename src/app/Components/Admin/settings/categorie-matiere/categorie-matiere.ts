import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { CategorieMatiere } from '../../../../Core/Model/Academie/CategorieMatiere';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Section } from '../../../../Core/Model/Academie/Section';

@Component({
  selector: 'app-categorie-matiere',
  imports: [ReactiveFormsModule],
  templateUrl: './categorie-matiere.html',
  styleUrl: './categorie-matiere.css',
})
export class CategorieMatiereComponent {
  categorieMatiereFb! : FormGroup; 
  
  constructor(private fb : FormBuilder, private generalService : GeneralService){

    this.categorieMatiereFb = this.fb.group({
      id : new FormControl(),
      intitule : new FormControl(), 
      section: new FormControl()
    });

    this.getAllCategorieMatiere();

    this.getAllSection(); 


  }


    //Categorie matiere
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

  createCategorieMatiere(){
    const formData = new FormData(); 
    formData.append("categorie", JSON.stringify(this.categorieMatiereFb.value)); 
    console.log('data diplome:', this.categorieMatiereFb.value); 

    this.generalService.createCategorieMatiere(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllCategorieMatiere();
        }
      }, 
      error :()=>{
        console.log('creation categorieMatiereFb : failed'); 
      }
    });
  }

  deleteCategorieMatiere(id:any){
    this.generalService.deleteCategorieMatiere(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
        }
      }, 
      error : ()=>{
        console.log('delete categorie matiere : failed');
      }
    }); 
  }

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
  


}
