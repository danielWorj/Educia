import { Component, signal, computed } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { UtilisateurService } from '../../../../../Core/Service/Utlisateur/utilisateur-service';
import { GeneralService } from '../../../../../Core/Service/General/general-service';
import { Diplome } from '../../../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { ProfilEnseignant } from '../../../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { Section } from '../../../../../Core/Model/Academie/Section';
import { StatusEnseignant } from '../../../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';

@Component({
  selector: 'app-devenir-repetiteur',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './devenir-repetiteur.html',
  styleUrl: './devenir-repetiteur.css',
})
export class DevenirRepetiteur {

  // ── STEPPER ───
  readonly steps = [
    { id: 0, label: 'Informations' },
    { id: 1, label: 'Formation' },
    { id: 2, label: 'CV & Compte' },
  ];

  currentStep  = signal<number>(0);
  furthestStep = signal<number>(0);

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      const next = this.currentStep() + 1;
      this.currentStep.set(next);
      if (next > this.furthestStep()) this.furthestStep.set(next);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  goToStep(index: number): void {
    if (index <= this.furthestStep()) {
      this.currentStep.set(index);
    }
  }

  // ── FORMULAIRE ────────────────────────────────────────────────────────────
  enseignantForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private generalService: GeneralService
  ) {
    this.enseignantForm = this.fb.group({
      id:               new FormControl(),
      nomComplet:       new FormControl(),
      telephone:        new FormControl(),
      email:            new FormControl(),
      password:         new FormControl(),
      dateInscription:  new FormControl(),
      status:           new FormControl(),
      localisation:     new FormControl(),
      anneeexperience:  new FormControl(),
      dateNaissance:    new FormControl(),
      bio:              new FormControl(),
      tarifHoraire:     new FormControl(),
      statusEnseignant: new FormControl(),
      cv:               new FormControl(),
      diplomeurl:       new FormControl(),
      section:          new FormControl(),
      profilEnseignant: new FormControl(),
      diplome:          new FormControl(),
      specialite:       new FormControl(),
    });

    this.loadPage();
  }

  loadPage(): void {
    this.getAllSections();
    this.getAllStatusEnseignant();
    this.getAllProfilEnseignant();
    this.getAllDiplomes();
  }

  // ── LISTES ────────────────────────────────────────────────────────────────
  listSections          = signal<Section[]>([]);
  listStatusEnseignant  = signal<StatusEnseignant[]>([]);
  listProfilEnseignant  = signal<ProfilEnseignant[]>([]);
  listDiplomes          = signal<Diplome[]>([]);

  getAllSections(): void {
    this.generalService.findAllSections().subscribe({
      next: (response: Section[]) => this.listSections.set(response),
      error: () => console.error('Error fetching sections'),
    });
  }

  getAllStatusEnseignant(): void {
    this.generalService.findAllStatusEnseignants().subscribe({
      next: (response: StatusEnseignant[]) => this.listStatusEnseignant.set(response),
      error: () => console.error('Error fetching status enseignant'),
    });
  }

  getAllProfilEnseignant(): void {
    this.generalService.findAllProfilEnseignants().subscribe({
      next: (response: ProfilEnseignant[]) => this.listProfilEnseignant.set(response),
      error: () => console.error('Error fetching profil enseignant'),
    });
  }

  getAllDiplomes(): void {
    this.generalService.findAllDiplomes().subscribe({
      next: (response: Diplome[]) => this.listDiplomes.set(response),
      error: () => console.error('Error fetching diplomes'),
    });
  }

  // ── SÉLECTION PROFIL ──────────────────────────────────────────────────────
  selectedProfilLabel = signal<string>('');

  selectProfil(profil: ProfilEnseignant): void {
    this.enseignantForm.controls['profilEnseignant'].setValue(profil.id);
    this.selectedProfilLabel.set(profil.intitule);
  }

  selectProfilLabel(label: string): void {
    this.selectedProfilLabel.set(label);
    this.enseignantForm.controls['profilEnseignant'].setValue({ intitule: label });
  }

  // ── UPLOAD PHOTO PROFIL ───────────────────────────────────────────────────
  photoProfilFile!: File;
  photoUploaded = signal<boolean>(false);
  photoFileName = signal<string>('');

  selectPhotoUploaded(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.photoProfilFile = input.files[0];
      this.photoFileName.set(this.photoProfilFile.name); // ✅ corrigé
      this.photoUploaded.set(true);
    }
  }



  // ── UPLOAD CNI ────────────────────────────────────────────────────────────
  cniFile!: File;
  cniUploaded = signal<boolean>(false);
  cniFileName = signal<string>('');

  onSelectCNI(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.cniFile = input.files[0];
      this.cniFileName.set(this.cniFile.name);
      this.cniUploaded.set(true);
    }
  }

  // ── UPLOAD CV ─────────────────────────────────────────────────────────────
  cvFile!: File;
  cvUploaded = signal<boolean>(false);
  cvFileName = signal<string>('');

  onSelectCv(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.cvFile = input.files[0];
      this.cvFileName.set(this.cvFile.name);
      this.cvUploaded.set(true);
    }
  }

  // ── UPLOAD DIPLÔME ────────────────────────────────────────────────────────
  diplomeFile!: File;
  diplomeUploaded = signal<boolean>(false);
  diplomeFileName = signal<string>('');

  onSelectDiplome(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.diplomeFile = input.files[0];
      this.diplomeFileName.set(this.diplomeFile.name);
      this.diplomeUploaded.set(true);
    }
  }

  // ── MOT DE PASSE ──────────────────────────────────────────────────────────
  password             = signal<string>('');
  confirmpassword      = signal<string>('');
  passwordToStore      = signal<string>('');
  messageErrorPassword = signal<string>('');
  showErrormessage     = signal<boolean>(false);

  passwordChange(e: Event): void {
    this.password.set((e.target as HTMLInputElement).value);
  }

  confirmPasswordChange(e: Event): void {
    this.confirmpassword.set((e.target as HTMLInputElement).value);
    this.correspondancePassword(this.password(), this.confirmpassword());
  }

  correspondancePassword(pass: string, cpass: string): void {
    if (!pass || !cpass) return;
    if (pass !== cpass) {
      this.showErrormessage.set(true);
      this.messageErrorPassword.set('Les mots de passes ne correspondent pas.');
    } else {
      this.showErrormessage.set(false);
      this.passwordToStore.set(pass);
    }
  }

  // ── CGU ───────────────────────────────────────────────────────────────────
  cguAccepted = false;

  // ── SOUMISSION ────────────────────────────────────────────────────────────
  createEnseignantAccount(): void {
    sessionStorage.clear();

    this.correspondancePassword(this.password(), this.confirmpassword());

    if (this.password() !== this.confirmpassword()) {
      this.showErrormessage.set(true);
      this.messageErrorPassword.set('Les mots de passes ne correspondent pas.');
      return;
    }

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
    if (!this.cguAccepted) {
      alert('Veuillez accepter les conditions générales d\'utilisation.');
      return;
    }

    const formData = new FormData();
    this.enseignantForm.controls['password'].setValue(this.passwordToStore());
    formData.append('enseignant', JSON.stringify(this.enseignantForm.value));
    formData.append('photo',   this.photoProfilFile);
    formData.append('cv',      this.cvFile);
    formData.append('diplome', this.diplomeFile);

    if (this.cniFile) {
      formData.append('cni', this.cniFile);
    }

    this.utilisateurService.createEnseignant(formData).subscribe({
      next: (response: number) => {
        if (response > 0) {
          alert('Compte répétiteur créé avec succès !');
          this.enseignantForm.reset();
          this.resetSignals();
          sessionStorage.setItem('role', '2');
        }
      },
      error: (error: unknown) => {
        console.error('Erreur création enseignant', error);
      },
    });
  }

  private resetSignals(): void {
    this.currentStep.set(0);
    this.furthestStep.set(0);
    this.photoUploaded.set(false);
    this.photoFileName.set('');
    this.cniUploaded.set(false);
    this.cniFileName.set('');
    this.cvUploaded.set(false);
    this.cvFileName.set('');
    this.diplomeUploaded.set(false);
    this.diplomeFileName.set('');
    this.password.set('');
    this.confirmpassword.set('');
    this.passwordToStore.set('');
    this.showErrormessage.set(false);
    this.selectedProfilLabel.set('');
    this.cguAccepted = false;
  }
}