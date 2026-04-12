import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { SectionComponent } from "./section/section";
import { NiveauComponent } from "./niveau/niveau";
import { FiliereComponent } from "./filiere/filiere";
import { DiplomeComponent } from "./diplome/diplome";
import { MatiereComponent } from "./matiere/matiere";
import { CategorieMatiereComponent } from "./categorie-matiere/categorie-matiere";
import { ProfilEnseignantComponent } from "./profil-enseignant/profil-enseignant";
import { GeneralService } from '../../../../Core/Service/General/general-service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, SectionComponent, NiveauComponent, FiliereComponent, DiplomeComponent, MatiereComponent, CategorieMatiereComponent, ProfilEnseignantComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  
  
  constructor(private fb : FormBuilder , private generalService : GeneralService){
   

  }

 


  
}
