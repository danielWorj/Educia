import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { Eleve } from '../../../Core/Model/Utilisateur/Eleve/Eleve';
import { Section } from '../../../Core/Model/Academie/Section';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { Filiere } from '../../../Core/Model/Academie/Filiere';
import { Niveau } from '../../../Core/Model/Academie/Niveau';

@Component({
  selector: 'app-enfants',
  imports: [ReactiveFormsModule],
  templateUrl: './enfants.html',
  styleUrl: './enfants.css',
})
export class Enfants {
  idParent = signal<number>(3); //Session
  eleveForm !:FormGroup ; 
  constructor(private fb : FormBuilder ,private generalService: GeneralService,  private utilisateurService : UtilisateurService){
    this.eleveForm = this.fb.group({
       id: new FormControl(),
        nomComplet: new FormControl(),
        telephone: new FormControl(),
        email: new FormControl(),
        password: new FormControl(),
        dateInscription: new FormControl(),
        status: new FormControl(),
        localisation: new FormControl(),
        photo: new FormControl(),
        dateNaissance: new FormControl(),
        niveau: new FormControl(),
        redoublant: new FormControl(),
        filiere: new FormControl(),
        parent: new FormControl(),
    }); 

    //this.idParent.set(3); 
    this.idParent.set(parseInt(sessionStorage.getItem('id')!)); 

    this.getAllSections();

    this.loadPageData(); 
  }

  loadPageData(){
    this.getcountEleveByParent(); 
    this.getAllEleveByParent();
    
  }

  listEleve = signal<Eleve[]>([]); 

  getAllEleveByParent(){
    this.utilisateurService.findAllEleveByParent(this.idParent()).subscribe({
      next : (data :Eleve[])=>{
        this.listEleve.set(data); 
      }, 
      error : ()=>{
        console.log('Fecth list eleve : failed'); 
      }
    }); 
  }

  countEleveByParent = signal<number>(0); 

  getcountEleveByParent(){
    this.utilisateurService.countEleveByParent(this.idParent()).subscribe({
      next : (data :number)=>{
        this.countEleveByParent.set(data); 
      }, 
      error : ()=>{
        console.log('Fecth count eleve by parent : failed'); 
      }
    }); 
  }

   messageErrorPassword=signal<string>('');
  showErrormessage=signal<boolean>(false); 

  password=signal<string>(''); 

  passwordToStore = signal<string>(''); 


  passwordChange(e:any){
    this.password.set(e.target.value);
    //console.log('mot de passe : '+this.password()) ;
  }

  confirmpassword=signal<string>(''); 
  confirmPasswordChange(e:any){
    this.confirmpassword.set(e.target.value); 
    //console.log('confirmer le mot de passe : '+this.confirmpassword()) ;

    this.correspondancePassword(this.password(), this.confirmpassword()); 
  }

  correspondancePassword(pass:string , cpass : string){
    if (pass!='' && cpass !='') {
      console.log('Confirmation de mot de passe'); 

      if (pass!=cpass) {
          this.showErrormessage.set(true); 
          this.messageErrorPassword.set("Les mots de passes ne correspondent pas.")
        
      }else{
        this.showErrormessage.set(false);
        this.passwordToStore.set(pass); 
      }
    }else{
      alert('Remplir la case du mot de passe et celle du confirm mot de passe'); 
    }
  }

  createEleve(){
    

     this.correspondancePassword(this.password(), this.confirmpassword());

    if (this.password()!=this.confirmpassword()) {
      this.showErrormessage.set(true); 
      this.messageErrorPassword.set("Les mots de passes ne correspondent pas.")
    }else{
        this.eleveForm.controls['parent'].setValue(this.idParent()); 

        const formData : FormData = new FormData(); 

        formData.append("eleve", JSON.stringify(this.eleveForm.value)); 
        formData.append("photo", this.photoProfilFile); 

        console.log(this.eleveForm.value); 

        this.utilisateurService.createEleve(formData).subscribe({
          next:(data : number)=>{
            if (data !=0) {
              //Si le id est different ets 0
              alert('Eleve ajoute'); 
              this.loadPageData(); 
              this.eleveForm.reset(); 
            }
          }, 
          error:()=>{
            console.log('Creatin eleve : failed'); 
          }
        }); 
    }



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

  chargeData(e:any){
    let id = e.target.value; 
    this.getAllFiliereBySection(id); 
    this.getAllNiveauBySections(id); 

  }

  listFiliereBySection = signal<Filiere[]>([]);
  getAllFiliereBySection(id:number){
    this.generalService.findAllFiliereBySection(id).subscribe({
      next: (response:Filiere[]) => {
        this.listFiliereBySection.set(response);
      },
      error: (error) => {
        console.error('Error fetching filiere by id  : failed');
      }
    });
  }


  listNiveauBySection = signal<Niveau[]>([]);
  getAllNiveauBySections(id :number){
    this.generalService.findAllNiveauBySection(id).subscribe({
      next: (response:Niveau[]) => {
        this.listNiveauBySection.set(response);
      },
      error: (error) => {
        console.error('Error fetching niveau : failed');
      }
    });
  }



  //Photo de profil 
  fetchPhotoUrl = signal<string>('')  ;
  fetchPhotoState = signal<boolean>(false);
  photoFileName = signal<string>('');
  photoFileSize = signal<string>('');
  photoProfilFile!:File ; 
  fileName = signal<string>('');

  selectPhotoUploaded(photo: any): void { 
      if (photo.target.files) {
        this.fetchPhotoState.set(true);
        let reader = new FileReader();
        reader.readAsDataURL(photo.target.files[0]);
        reader.onload=(event :any)=>{

          this.fetchPhotoUrl.set(event.target.result) ; 
          this.photoProfilFile = photo.target.files[0];

          this.fileName.set(this.photoProfilFile.name); 
          this.photoFileName.set(this.photoProfilFile.name);

          console.log('Nom de la photo :'+this.fileName); 
        }
    }
  }

}
