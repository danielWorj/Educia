import { Component, signal } from '@angular/core';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Section } from '../../../Core/Model/Academie/Section';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Niveau } from '../../../Core/Model/Academie/Niveau';
import { Diplome } from '../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { CategorieMatiere } from '../../../Core/Model/Academie/CategorieMatiere';
import { Filiere } from '../../../Core/Model/Academie/Filiere';
import { SectionComponent } from "./section/section";
import { NiveauComponent } from "./niveau/niveau";
import { FiliereComponent } from "./filiere/filiere";
import { DiplomeComponent } from "./diplome/diplome";
import { MatiereComponent } from "./matiere/matiere";
import { CategorieMatiereComponent } from "./categorie-matiere/categorie-matiere";
import { ProfilEnseignantComponent } from "./profil-enseignant/profil-enseignant";

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
