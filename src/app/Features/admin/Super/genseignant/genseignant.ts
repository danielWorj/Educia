import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Section } from '../../../../Core/Model/Academie/Section';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Enseignant } from '../../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { DevenirRepetiteur } from "../../../site/home/Formulaire/devenir-repetiteur/devenir-repetiteur";

@Component({
  selector: 'app-genseignant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DevenirRepetiteur],
  templateUrl: './genseignant.html',
  styleUrl: './genseignant.css',
})
export class Genseignant {

  // ──────────────────────────────────────────────
  // Formulaire
  // ──────────────────────────────────────────────
  enseignantForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private generalService: GeneralService,
    private utilisateurService: UtilisateurService
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
      photo:            new FormControl(),
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
    this.getAllEnseignants();
    this.getListSection();
  }

  // ──────────────────────────────────────────────
  // Données
  // ──────────────────────────────────────────────
  listEnseignants = signal<Enseignant[]>([]);
  listSection     = signal<Section[]>([]);

  getAllEnseignants(): void {
    this.utilisateurService.findAllEnseignants().subscribe({
      next:  (response: Enseignant[]) => this.listEnseignants.set(response),
      error: (err: any) => console.error('Erreur chargement enseignants:', err),
    });
  }

  getListSection(): void {
    this.generalService.findAllSections().subscribe({
      next:  (response: Section[]) => this.listSection.set(response),
      error: (err: any) => console.error('Erreur chargement sections:', err),
    });
  }

  // ──────────────────────────────────────────────
  // Filtres
  // ──────────────────────────────────────────────
  activeFilter = signal<string>('all');

  filterChips = [
    { value: 'all',      label: 'Tous'        },
    { value: 'approuve', label: 'Approuvés'   },
    { value: 'attente',  label: 'En attente'  },
    { value: 'suspendu', label: 'Suspendus'   },
  ];

  filteredEnseignants = computed(() => {
    const filter = this.activeFilter();
    const list   = this.listEnseignants();
    if (filter === 'all') return list;
    return list.filter(e => e.statusEnseignant.intitule === filter);
  });

  countByStatus(status: string): number {
    return this.listEnseignants().filter(e => e.statusEnseignant.intitule === status).length;
  }

  // ──────────────────────────────────────────────
  // Enseignant sélectionné
  // ──────────────────────────────────────────────
  cheminFile        = 'assets/file/';
  enseignantSelected = signal<Enseignant | null>(null);

  nomDiplome  = signal('');
  nomCNI      = signal('');
  nomCV       = signal('');
  photoProfil = signal('');

  selectEnseignant(enseignant: Enseignant): void {
    this.enseignantSelected.set(enseignant);
    this.enseignantForm.patchValue(enseignant);

    this.nomDiplome.set(enseignant.diplomeurl ?? '');
    this.nomCV.set(enseignant.cv ?? '');
    this.nomCNI.set(enseignant.cni ?? '');
    this.photoProfil.set(this.cheminFile + enseignant.photo);

    this.loadDiplomeFile(this.cheminFile + enseignant.diplomeurl, enseignant.diplomeurl ?? '');
    this.loadCvFile(this.cheminFile + enseignant.cv, enseignant.cv ?? '');
    this.loadCniFile(this.cheminFile + enseignant.cni, enseignant.cni ?? '');
  }

  // ──────────────────────────────────────────────
  // Gestion du statut
  // ──────────────────────────────────────────────
  changeStatus(id: number, idS:number): void {
    //alert('Changement de statut'); 
    this.utilisateurService.changeStatusEnseignant(id, idS).subscribe({
      next: (response: ResponseServer) => {
        console.log(response.message);
        this.getAllEnseignants();
      },
      error: (err: any) => console.error('Erreur changement statut:', err),
    });
  }

  // ──────────────────────────────────────────────
  // Suppression
  // ──────────────────────────────────────────────
  showDeleteModal   = signal(false);
  idToDelete        = signal<number | null>(null);

  confirmDelete(id: number): void {
    this.idToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const id = this.idToDelete();
    if (id !== null) {
      this.deleteEnseignant(id);
    }
    this.showDeleteModal.set(false);
    this.idToDelete.set(null);
  }

  deleteEnseignant(id: number): void {
    // TODO: implémenter la suppression via service
    console.log('Suppression de l\'enseignant id:', id);
  }

  // ──────────────────────────────────────────────
  // Modals
  // ──────────────────────────────────────────────
  showProfilModal = signal<boolean>(false);
  showDocsModal   = signal(false);
  showAddModal    = signal(false);

  openProfilModal(enseignant: Enseignant): void {
    this.showProfilModal.set(true);

    console.log('Ouverture modal profil pour enseignant:', this.showProfilModal());
    this.selectEnseignant(enseignant);
  }

  closeProfilModal(): void {
    this.showProfilModal.set(false);
  }

  openDocsModal(enseignant: Enseignant): void {
    this.selectEnseignant(enseignant);
    this.showDocsModal.set(true);
  }

  saveEnseignant(): void {
    if (this.enseignantForm.valid) {
      // TODO: appel service de création
      console.log('Données enseignant:', this.enseignantForm.value);
      this.showAddModal.set(false);
      this.enseignantForm.reset();
    }
  }

  // ──────────────────────────────────────────────
  // Utilitaire : initiales
  // ──────────────────────────────────────────────
  getInitiales(nomComplet: string = ''): string {
    return nomComplet
      .split(' ')
      .map(n => n[0] ?? '')
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // ──────────────────────────────────────────────
  // Utilitaire : type de fichier
  // ──────────────────────────────────────────────
  getFileType(filename: string): 'image' | 'pdf' | 'docx' | 'other' {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    return 'other';
  }

  // ──────────────────────────────────────────────
  // DIPLÔME
  // ──────────────────────────────────────────────
  diplomeUrl      = '';
  diplomeFileName = '';
  safeDiplomeUrl?: SafeResourceUrl;
  diplomeFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadDiplomeFile(url: string, name: string): void {
    this.diplomeUrl      = url;
    this.diplomeFileName = name;
    this.diplomeFileType = this.getFileType(name);
    this.safeDiplomeUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ──────────────────────────────────────────────
  // CV
  // ──────────────────────────────────────────────
  cvUrl      = '';
  cvFileName = '';
  safeCvUrl?: SafeResourceUrl;
  cvFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadCvFile(url: string, name: string): void {
    this.cvUrl      = url;
    this.cvFileName = name;
    this.cvFileType = this.getFileType(name);
    this.safeCvUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ──────────────────────────────────────────────
  // CNI
  // ──────────────────────────────────────────────
  cniUrl      = '';
  cniFileName = '';
  safeCniUrl?: SafeResourceUrl;
  cniFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadCniFile(url: string, name: string): void {
    this.cniUrl      = url;
    this.cniFileName = name;
    this.cniFileType = this.getFileType(name);
    this.safeCniUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


  
}