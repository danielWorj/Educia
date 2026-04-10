import { Component, signal } from '@angular/core';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { Section } from '../../../Core/Model/Academie/Section';
import { ProfilEnseignant } from '../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { StatusEnseignant } from '../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { CommentaireService } from '../../../Core/Service/Commentaire/commentaire-service';
import { Commentaire } from '../../../Core/Model/Commentaire/Commentaire';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-enseignants',
  imports: [],
  templateUrl: './enseignants.html',
  styleUrl: './enseignants.css',
})
export class EnseignantsPlatform {
  voirProfil = signal<boolean>(false); 

  commentaireForm !:FormGroup;

  constructor(
    private generalService :GeneralService , 
    private utilisateurService : UtilisateurService,
    private commentaireService : CommentaireService, 
    private fb : FormBuilder){
     this.getAllSections();
     this.getAllProfilEnseignant();
     this.getAllEnseignants();

     this.voirProfil.set(false); 

     this.commentaireForm = this.fb.group({
      id : new FormControl(), 
      contenu : new FormControl(),
      enseignant : new FormControl(),
      parent : new FormControl(),
     }); 
     
  }

  listSections = signal<Section[]>([]);
  getAllSections(){
    this.generalService.findAllSections().subscribe({
      next: (response:Section[]) => {
        this.listSections.set(response);
      },
      error: (error) => {
        console.error('Error fetching sections : failed');
      }
    });
  }

  findEnseignantByDiplome(ID:any){
    let id = ID.target.value;

  }

  findEnseignantByProfilEnseignant(ID:any){
    let id = ID.target.value;

  }

  findEnseignantBySection(ID:any){
    let id = ID.target.value;

  }

  listProfilEnseignant = signal<ProfilEnseignant[]>([]);
  getAllProfilEnseignant(){
    this.generalService.findAllProfilEnseignants().subscribe({
      next: (response:ProfilEnseignant[]) => {
        this.listProfilEnseignant.set(response);
      },
      error: (error) => {
        console.error('Error fetching list professions : failed');
      }
    });
  }

  listStatusEnseignant = signal<StatusEnseignant[]>([]);

  getAllStatusEnseignant(){
    this.generalService.findAllStatusEnseignants().subscribe({
      next: (response:StatusEnseignant[]) => {
        this.listStatusEnseignant.set(response);
      },
      error: (error) => {
        console.error('Error fetching status enseignant : failed');
      } 
    });
  }

  listEnseignants = signal<Enseignant[]>([]);

  getAllEnseignants(){
    this.utilisateurService.findAllEnseignants().subscribe({
      next: (response:Enseignant[]) => {
        this.listEnseignants.set(response);
      },
      error: (error) => {
        console.error('Error fetching enseignants : failed');
      } 
    }); 
  }

  getEnseignantsBySection(idSection:number){
    this.utilisateurService.findAllEnseignantsBySection(idSection).subscribe({
      next: (response:Enseignant[]) => {
        this.listEnseignants.set(response);
      },
      error: (error) => {
        console.error('Error fetching enseignants by section : failed');
      } 
    }); 
  }

  getEnseignantsByStatus(status:string){
    this.utilisateurService.findAllEnseignantsByStatus(status).subscribe({
      next: (response:Enseignant[]) => {
        this.listEnseignants.set(response); 
      },
      error: (error) => {
        console.error('Error fetching enseignants by status : failed');
      } 
    }); 
  }

  getEnseignantsByProfil(idProfil:number){  
    this.utilisateurService.findAllEnseignantsByProfil(idProfil).subscribe({
      next: (response:Enseignant[]) => {
        this.listEnseignants.set(response);   
      },
      error: (error) => {
        console.error('Error fetching enseignants by profil : failed');
      } 
    });
  }

  enseignantSelected = signal<Enseignant | undefined>(undefined); 
  seeDetailsEnseignant(e:Enseignant){
    this.voirProfil.set(true); 
    this.enseignantSelected.set(e);  
    this.getAllCommentaire(e.id)
  }

  findEnseignantById(id : number){

    this.utilisateurService.findEnseignantById(id).subscribe({
      next:(data : Enseignant)=>{
        this.voirProfil.set(true); 
        this.enseignantSelected.set(data);
      }, 
      error:()=>{
        console.log('Enseignant find by id : failed'); 
      }
    })
  }

  killVoirProfil(){
    this.voirProfil.set(false);
    this.isEditComment.set(false); 
  }


  isEditComment = signal<boolean>(false); 
  editComment(){
    this.isEditComment.set(true); 

  }

  killComment(){
    this.isEditComment.set(false);
  }
  //Espace de getsion des commentaires

  listCommentaire = signal<Commentaire[]>([]); 
  getAllCommentaire(id:number){
    this.commentaireService.getAllCommentaireByEnseignant(id).subscribe({
      next:(data : Commentaire[])=>{
        this.listCommentaire.set(data); 
      }, 
      error:()=>{
        console.log('fecth all commentaire : failed');
      }
    }); 
  }

  createCommentaire(){
    const formData : FormData = new FormData(); 

    this.commentaireForm.controls['enseignant'].setValue(this.enseignantSelected()?.id); 
    this.commentaireForm.controls['parent'].setValue('A complter'); 

    formData.append("commentaire", JSON.stringify(this.commentaireForm.value));


    this.commentaireService.createCommentaire(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          console.log('nouveau commentaire'); 
        } 
      }, 
      error:()=>{
        console.log('fecth all commentaire : failed');
      }
    }); 
  }



  honeNumber = '696649233'; // Your number
  message = 'I have a question about your products.';

  openWhatsApp() {
    const urlMessage = encodeURIComponent(this.message);
    const url = `https://wa.me{this.phoneNumber}`;
    window.open(url, '_blank');
  }

  openWhatsAppWeb(): void {
    //const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    console.log('tentative d ouvrir zap' ); 
    let number = "696649233"; 
    let message = "Hello world"; 
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    
    const whatsappUrl = message 
      ? `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${cleanNumber}`;
    
    window.open(whatsappUrl, '_blank');
  }

  openWhatsAppWebWithNumber(numero:string): void {
 

    console.log('tentative d ouvrir zap' ); 
  
    const cleanNumber = numero.replace(/[^0-9]/g, '');
    
    const whatsappUrl =`https://web.whatsapp.com/send?phone=${cleanNumber}`; 
    
    window.open(whatsappUrl, '_blank');
  }
}
