import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { UtilisateurService } from '../../../../../Core/Service/Utlisateur/utilisateur-service';
import { GeneralService } from '../../../../../Core/Service/General/general-service';
import { Diplome } from '../../../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { ProfilEnseignant } from '../../../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { Section } from '../../../../../Core/Model/Academie/Section';
import { StatusEnseignant } from '../../../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';

@Component({
  selector: 'app-devenir-repetiteur',
  imports: [ReactiveFormsModule],
  templateUrl: './devenir-repetiteur.html',
  styleUrl: './devenir-repetiteur.css',
})
export class DevenirRepetiteur {
  enseignantForm !:FormGroup; 
  constructor(private fb:FormBuilder, private utilisateurService : UtilisateurService , private generalService:GeneralService){
        this.enseignantForm = this.fb.group({
        id: new FormControl(),
        nomComplet: new FormControl(),
        telephone: new FormControl(),
        email: new FormControl(),
        password: new FormControl(),
        dateInscription: new FormControl(),
        status: new FormControl(),
        localisation: new FormControl(),
        photo: new FormControl(),
        anneeexperience: new FormControl(),
        dateNaissance: new FormControl(),
        bio: new FormControl(),
        tarifHoraire: new FormControl(),
        statusEnseignant: new FormControl(),
        cv: new FormControl(),
        diplomeurl: new FormControl(),
        section: new FormControl(),
        profilEnseignant: new FormControl(),
        diplome: new FormControl(),
        specialite : new FormControl()
    }); 

    this.loadPage();
  }

  loadPage(){
    this.getAllSections();
    this.getAllStatusEnseignant();
    this.getAllProfilEnseignant();
    this.getAllDiplomes();
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

  listProfilEnseignant = signal<ProfilEnseignant[]>([]); 
  getAllProfilEnseignant(){
     this.generalService.findAllProfilEnseignants().subscribe({
      next: (response:ProfilEnseignant[]) => {
        this.listProfilEnseignant.set(response);
      },
      error: (error) => {
        console.error('Error fetching status enseignant : failed');
      } 
    });
  }

  listDiplomes = signal<Diplome[]>([]);
  getAllDiplomes(){
    this.generalService.findAllDiplomes().subscribe({
      next: (response:Diplome[]) => {
        this.listDiplomes.set(response);
      },
      error: (error) => {
        console.error('Error fetching diplomes : failed');
      } 
    });
  }

  photoFile!:File;
  showImage = signal<boolean>(false);

  fichierUrl=signal<string>('');
  fileName = signal<string>('');

  onSelectImage(e: any) {
  if (e.target.files && e.target.files[0]) {
    this.photoFile = e.target.files[0]; // ✅ assignation directe
  }
}


  cvFile!:File;
  onSelectCv(e :any){
    this.showImage.set(true); 
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);

      reader.onload=(event :any)=>{

        this.cvFile = e.target.files[0];
      }

   }
  }

  diplomeFile!:File;
  onSelectDiplome(e :any){
    this.showImage.set(true); 
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);

      reader.onload=(event :any)=>{

        this.diplomeFile = e.target.files[0];
      }

   }
  }

  cniFile!:File;
  onSelectCNI(e :any){
    this.showImage.set(true); 
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);

      reader.onload=(event :any)=>{

        this.cniFile = e.target.files[0];
      }

   }
  }

    //Upload image profil ; 

  fetchPhotoUrl = signal<string>('')  ;
  fetchPhotoState = signal<boolean>(false);
  photoFileName = signal<string>('');
  photoFileSize = signal<string>('');
  photoProfilFile!:File ; 

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
  createEnseignantAccount() {
      sessionStorage.clear();

      this.correspondancePassword(this.password(), this.confirmpassword());

      if (this.password() != this.confirmpassword()) {
        this.showErrormessage.set(true);
        this.messageErrorPassword.set("Les mots de passes ne correspondent pas.");
        return;
      }

      // ✅ Vérifications des fichiers obligatoires
      if (!this.photoProfilFile) {
        alert('Veuillez sélectionner une photo de profil.');
        return;
      }
      if (!this.cvFile) {
        alert('Veuillez sélectionner votre CV.');
        return;
      }
      if (!this.diplomeFile) {
        alert('Veuillez sélectionner votre diplôme.');
        return;
      }

      let formData: FormData = new FormData();
      this.enseignantForm.controls['password'].setValue(this.passwordToStore());

      formData.append('enseignant', JSON.stringify(this.enseignantForm.value));
      formData.append('photo', this.photoProfilFile);
      formData.append('cv', this.cvFile);
      formData.append('diplome', this.diplomeFile);

      // ✅ CNI optionnel selon votre API (elle ne le demande pas)
      if (this.cniFile) {
        formData.append('cni', this.cniFile);
      }

      this.utilisateurService.createEnseignant(formData).subscribe({
        next: (response: number) => {
          if (response > 0) {
            alert('Enseignant créé avec succès');
            this.enseignantForm.reset();
            sessionStorage.setItem('role', '2');
          }
        },
        error: (error: any) => {
          console.error('Erreur création enseignant', error);
        }
      });
  }

}
