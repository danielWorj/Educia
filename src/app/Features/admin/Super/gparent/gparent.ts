import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { Parent } from '../../../../Core/Model/Utilisateur/Parents';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-gparent',
  imports: [],
  templateUrl: './gparent.html',
  styleUrl: './gparent.css',
})
export class GParent {
 ParentForm! : FormGroup; 
  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private generalService: GeneralService, private utilisateurService: UtilisateurService) {
    this.loadPage(); 

    this.ParentForm = this.fb.group({
      id: new FormControl(),
      nomComplet: new FormControl(),
      telephone: new FormControl(),
      email: new FormControl(),
      role: new FormControl(),
      password: new FormControl(),
      dateInscription: new FormControl(),
      status: new FormControl(),
      localisation: new FormControl(),
      photo: new FormControl(),
      profession: new FormControl(),
      cni: new FormControl(),
      
    }); 
  }

  loadPage() {
    this.getAllParents();
  }

  listParents = signal<Parent[]>([]); 
  getAllParents() {
    this.utilisateurService.findAllParent().subscribe(
      (response: Parent[]) => {
        this.listParents.set(response);
      },
      (error) => {
        console.error('Error fetching Parents:', error);
      }
    );
  }

  parentSelected = signal<Parent | null>(null); 

  selectParent(p:Parent){
    this.parentSelected.set(p);
  }

  changeStatus(id:number){
    this.utilisateurService.changeStatus(id).subscribe(
      (response: ResponseServer) => {
        if (response.status) {
          console.log(response.message);
        };
      },
      (error) => {
        console.error('Error change status Parents:', error);
      }
    );
  }

  deleteParent(id:number){
    this.utilisateurService.deleteParent(id).subscribe(
      (response: ResponseServer) => {
        if (response.status) {
          console.log(response.message);
        };
      },
      (error) => {
        console.error('Error delete Parents:', error);
      }
    );
  }

}
