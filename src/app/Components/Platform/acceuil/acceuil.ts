import { Component, EventEmitter, Output, signal } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { upload } from '../../../Composants/Comp/upload/upload';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { Section } from '../../../Core/Model/Academie/Section';
import { StatusEnseignant } from '../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';
import { ProfilEnseignant } from '../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { Diplome } from '../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { Router } from '@angular/router';


@Component({
  selector: 'app-acceuil',
  imports: [ReactiveFormsModule],
  templateUrl: './acceuil.html',
  styleUrl: './acceuil.css',
})
export class Acceuil {
  enseignantForm !: FormGroup;
  parentForm !: FormGroup;

  @Output() statutAccount = new EventEmitter<boolean>(); 



  constructor(private fb : FormBuilder ,private router: Router,  private utilisateur: UtilisateurService , private generalService : GeneralService){
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

      this.parentForm = this.fb.group({
        id: new FormControl(),
        nomComplet: new FormControl(),
        telephone: new FormControl(),
        email: new FormControl(),
        password: new FormControl(),
        dateInscription: new FormControl(),
        status: new FormControl(),
        localisation: new FormControl(),
        photo: new FormControl(),
        profession: new FormControl(),
        cni: new FormControl(),
      
    }); 

     this.getAllSections();
     this.getAllDiplomes();
     this.getAllProfilEnseignant(); 
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


  isCreationAccount = signal<boolean>(false);
  isParentCreation = signal<boolean>(false);
  isEnseignantCreation = signal<boolean>(false);

  toggleCreationAccountEnseignant() { 
    this.isCreationAccount.set(true);
    this.isParentCreation.set(false);
    this.isEnseignantCreation.set(true);
    this.enseignantForm.reset();
  }

  toggleCreationAccountParent() {
    this.isCreationAccount.set(true);
    this.isParentCreation.set(true);
    this.isEnseignantCreation.set(false);
    this.parentForm.reset();
  }

  photoFile!:File;
  showImage = signal<boolean>(false);

  fichierUrl=signal<string>('');
  fileName = signal<string>('');

  onSelectImage(e :any){
    this.showImage.set(true); 
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);

      reader.onload=(event :any)=>{

        //this.fichierUrl.set(event.target.result) ;

        this.photoFile = e.target.files[0];

        //this.fileName.set(this.photo.name); 

        //console.log('Nom du fichier :'+this.fileName); 
      }

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
  createEnseignantAccount(){
    sessionStorage.clear()


    this.correspondancePassword(this.password(), this.confirmpassword());

    if (this.password()!=this.confirmpassword()) {
      this.showErrormessage.set(true); 
      this.messageErrorPassword.set("Les mots de passes ne correspondent pas.")
    }else{
        let formData : FormData = new FormData();

        this.enseignantForm.controls['password'].setValue(this.passwordToStore()); 

        formData.append('enseignant', JSON.stringify(this.enseignantForm.value));
        formData.append('photo', this.photoProfilFile);
        formData.append('cv', this.cvFile);
        formData.append('diplome', this.diplomeFile);
        formData.append('cni', this.cniFile);


        console.log('Form Data:', this.enseignantForm.value);

        //Appel au service pour créer l'enseignant
        this.utilisateur.createEnseignant(formData).subscribe({
          next: (response:number) => {
            // response c'est l'id de l'enseignant créé
            if (response > 0) {
              alert('Enseignant created successfully');
              //sessionStorage.setItem('role','2'); 
              this.enseignantForm.reset();

              sessionStorage.setItem('role','2');

              //Apres la creation on signal a app.ts que le compte a ete creee et on va diriger vers le
              this.statutAccount.emit(true); 
            }
          },
          error: (error) => {
            console.error('Error creating enseignant', error);
          }
        });
    }

    // sessionStorage.setItem('role','2');

    // let dashboardRoute = 'guide'; 

    // this.router.navigate([dashboardRoute]);

    
  
  }

  createParentAccount(){
    sessionStorage.clear()
    //Construction du FormData pour l'envoi des données du parent

    this.correspondancePassword(this.password(), this.confirmpassword());

    if (this.password()!=this.confirmpassword()) {
      this.showErrormessage.set(true); 
      this.messageErrorPassword.set("Les mots de passes ne correspondent pas.")
    }else{

         let formData : FormData = new FormData();

          this.parentForm.controls['password'].setValue(this.passwordToStore()); 


          formData.append('parent', JSON.stringify(this.parentForm.value));
          formData.append('photo', this.photoProfilFile);
          formData.append('cni', this.cniFile);
       

          console.log('Form Data:', this.parentForm.value);

          // Appel au service pour créer le parent
          this.utilisateur.createParent(formData).subscribe({
            next: (response:number) => {
              // response c'est l'id du parent créé
              if (response > 0) {

                alert('Parent created successfully');
              
                //sessionStorage.setItem('role','3'); 

                this.parentForm.reset();
                
                sessionStorage.setItem('role','3');

                // let dashboardRoute = 'guide'; 

                // this.router.navigate([dashboardRoute]);

                //Apres la creation on signal a app.ts que le compte a ete creee et on va diriger vers le
                this.statutAccount.emit(true); 

              } 
            },
            error: (error) => {
              console.error('Error creating parent', error);
            }
          });
    }
    
  }

  
   currentDateString = signal(''); 
  getCurrentDate(){
    const currentDate: Date = new Date();

  // Example 1: US English (Month/Day/Year)
  const usDate = new Intl.DateTimeFormat('en-US').format(currentDate); 

  this.currentDateString.set(usDate); 
  
  console.log(usDate);

  }

  
  ///Gestion des composants d'upload de contenus 

  //Upload du diplome 
  fecthDiplomeUrl = signal<string>('');
  fecthDiplomeState = signal<boolean>(false);
  diplomeFileName = signal<string>('');
  diplomeFileSize = signal<string>('');
  onDiplomeUploaded(diplome: any): void {

      if (diplome.target.files) {
        this.fecthDiplomeState.set(true);
        let reader = new FileReader();
        reader.readAsDataURL(diplome.target.files[0]);

        reader.onload=(event :any)=>{

          this.fecthDiplomeUrl.set(event.target.result) ;

          this.diplomeFile = diplome.target.files[0];

          this.fileName.set(this.diplomeFile.name); 

          this.diplomeFileName.set(this.diplomeFile.name);


          console.log('Nom du diplome :'+this.fileName); 
        }

    }
  }


  fecthcvUrl = signal<string>('');
  fecthcvState = signal<boolean>(false);
  cvFileName = signal<string>('');
  cvFileSize = signal<string>('');
  oncvUploaded(cv: any): void {

      if (cv.target.files) {
        this.fecthcvState.set(true);
        let reader = new FileReader();
        reader.readAsDataURL(cv.target.files[0]);

        reader.onload=(event :any)=>{

          this.fecthcvUrl.set(event.target.result) ;

          this.cvFile = cv.target.files[0];

          this.fileName.set(this.cvFile.name); 

          this.cvFileName.set(this.cvFile.name);


          console.log('Nom du cv :'+this.fileName); 
        }

    }
  }


  //Upload du cni 
  fecthCniUrl = signal<string>('')  ;
  fecthCniState = signal<boolean>(false);
  cniFileName = signal<string>('');
  cniFileSize = signal<string>('');
  onCniUploaded(cni: any): void { 
      if (cni.target.files) {
        this.fecthCniState.set(true);
        let reader = new FileReader();
        reader.readAsDataURL(cni.target.files[0]);
        reader.onload=(event :any)=>{

          this.fecthCniUrl.set(event.target.result) ; 
          this.cniFile = cni.target.files[0];

          this.fileName.set(this.cniFile.name); 
          this.cniFileName.set(this.cniFile.name);

          console.log('Nom du cni :'+this.fileName); 
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


}
