import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../../../Core/Service/Utlisateur/utilisateur-service';
import { Matiere } from '../../../../../Core/Model/Academie/Matiere';
import { Genseignant } from '../../../../admin/Super/genseignant/genseignant';
import { GeneralService } from '../../../../../Core/Service/General/general-service';
import { ResponseServer } from '../../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-trouver-repetiteur',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './trouver-repetiteur.html',
  styleUrl: './trouver-repetiteur.css',
})
export class TrouverRepetiteur {

  offreForm!: FormGroup;

  constructor(private fb: FormBuilder, private utilisateurService: UtilisateurService , private generalService : GeneralService ) {
    this.offreForm = this.fb.group({
      // Infos parent
      nomComplet: new FormControl(''),
      telephone: new FormControl(''),
      email: new FormControl(''),
      localisation: new FormControl(''),
      profession: new FormControl(''),

      // Détails de l'offre
      bio: new FormControl(''),
      budget: new FormControl(''),
      frequence: new FormControl(''),
      duree: new FormControl(''),
    });


    this.getAllMatiere(); 
  }

  // ── Fichiers ──────────────────────────────────────────────
  cniFile!: File;
  photoProfilFile!: File;

  fetchPhotoState = signal<boolean>(false);
  fetchPhotoUrl = signal<string>('');
  photoFileName = signal<string>('');
  showCNIName = signal<string>('');

  // Matières sélectionnées (liste d'ids)
  selectedMatieres = signal<number[]>([]);

  // ── Gestion photo de profil ───────────────────────────────
  selectPhotoUploaded(photo: any): void {
    if (photo.target.files && photo.target.files[0]) {
      this.fetchPhotoState.set(true);
      const file = photo.target.files[0];
      this.photoProfilFile = file;
      this.photoFileName.set(file.name);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        this.fetchPhotoUrl.set(event.target.result);
      };
    }
  }

  // ── Gestion CNI ───────────────────────────────────────────
  onSelectCNI(e: any): void {
    if (e.target.files && e.target.files[0]) {
      this.cniFile = e.target.files[0];
      this.showCNIName.set(this.cniFile.name);
    }
  }

  // ── Gestion mot de passe ──────────────────────────────────
  password = signal<string>('');
  confirmpassword = signal<string>('');
  messageErrorPassword = signal<string>('');
  showErrormessage = signal<boolean>(false);

  passwordChange(e: any): void {
    this.password.set(e.target.value);
  }

  confirmPasswordChange(e: any): void {
    this.confirmpassword.set(e.target.value);
    this.verifierCorrespondancePassword();
  }

  verifierCorrespondancePassword(): boolean {
    const pass = this.password();
    const cpass = this.confirmpassword();
    if (pass !== cpass) {
      this.showErrormessage.set(true);
      this.messageErrorPassword.set('Les mots de passe ne correspondent pas.');
      return false;
    }
    this.showErrormessage.set(false);
    this.messageErrorPassword.set('');
    return true;
  }

  // ── Gestion matières (checkbox ou select multiple) ────────
  listMatiere = signal<Matiere[]>([]); 
  getAllMatiere(){
    this.generalService.findAllMatiere().subscribe({
      next:(data:Matiere[])=>{
        this.listMatiere.set(data); 
      }
    });
  }
  toggleMatiere(event: any): void {
    let id = event.target.value; 
    const current = this.selectedMatieres();
    if (current.includes(id)) {
      this.selectedMatieres.set(current.filter(m => m !== id));
    } else {
      this.selectedMatieres.set([...current, id]);
    }
  }

  // ── Soumission ────────────────────────────────────────────
  publierOffre(): void {

    if (!this.verifierCorrespondancePassword()) return;

    if (!this.photoProfilFile) {
      alert('Veuillez sélectionner une photo de profil.');
      return;
    }

    if (!this.cniFile) {
      alert('Veuillez téléverser votre CNI.');
      return;
    }

    if (this.selectedMatieres().length === 0) {
      alert('Veuillez sélectionner au moins une matière.');
      return;
    }

    // Construction de l'objet OffreDTO envoyé en JSON (paramètre "offre")
    const offreDTO = {
      // Infos parent
      nomComplet: this.offreForm.value.nomComplet,
      telephone: this.offreForm.value.telephone,
      email: this.offreForm.value.email,
      password: this.password(),
      localisation: this.offreForm.value.localisation,
      profession: this.offreForm.value.profession,

      // Détails offre
      bio: this.offreForm.value.bio,
      budget: String(this.offreForm.value.budget),
      frequence: Number(this.offreForm.value.frequence),
      duree: String(this.offreForm.value.duree),

      // Matières (liste d'IDs)
      matieres: this.selectedMatieres(),
    };

    // Construction du FormData
    const formData = new FormData();
    formData.append('offre', JSON.stringify(offreDTO));
    formData.append('photo', this.photoProfilFile);
    formData.append('cni', this.cniFile);

    console.log('OffreDTO envoyé :', offreDTO);

    // Appel au service
    this.utilisateurService.publicationOffre(formData).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          alert('Offre publiée et compte créé avec succès !');
          this.offreForm.reset();
          this.selectedMatieres.set([]);
          this.fetchPhotoState.set(false);
          this.fetchPhotoUrl.set('');
        } else {
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la publication de l\'offre :', error);
        alert('Erreur serveur. Veuillez réessayer.');
      }
    });
  }
}