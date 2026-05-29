import {
  Component, computed, signal, OnDestroy,
  ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule }                                              from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl }                            from '@angular/platform-browser';
import { Chart, registerables }                                     from 'chart.js';

import { Section }            from '../../../../Core/Model/Academie/Section';
import { ResponseServer }     from '../../../../Core/Model/Server/ResponseServer';
import { Enseignant }         from '../../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { GeneralService }     from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { Diplome }            from '../../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { ProfilEnseignant }   from '../../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { StatusEnseignant }   from '../../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';

Chart.register(...registerables);

@Component({
  selector: 'app-genseignant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // ← DevenirRepetiteur retiré
  templateUrl: './genseignant.html',
  styleUrl: './genseignant.css',
})
export class Genseignant implements OnDestroy {

  // ── Instances Chart.js — on utilise document.getElementById()
  //    pour éviter le bug @ViewChild dans @if (les canvas n'existent
  //    pas dans le DOM tant que isLoading() = true).
  private chartDiplome?: Chart;
  private chartProfil?:  Chart;
  private chartSection?: Chart;

  private cdr = inject(ChangeDetectorRef);

  enseignantForm!:    FormGroup;
  addEnseignantForm!: FormGroup;

  isLoading = signal<boolean>(true);

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private generalService: GeneralService,
    private utilisateurService: UtilisateurService,
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

    this.addEnseignantForm = this.fb.group({
      nomComplet:       new FormControl(''),
      telephone:        new FormControl(''),
      email:            new FormControl(''),
      password:         new FormControl(''),
      localisation:     new FormControl(''),
      anneeexperience:  new FormControl(''),
      dateNaissance:    new FormControl(''),
      bio:              new FormControl(''),
      tarifHoraire:     new FormControl(''),
      specialite:       new FormControl(''),
      statusEnseignant: new FormControl(''),
      section:          new FormControl(''),
      profilEnseignant: new FormControl(''),
      diplome:          new FormControl(''),
    });

    this.loadPage();
  }

  ngOnDestroy(): void {
    this.chartDiplome?.destroy();
    this.chartProfil?.destroy();
    this.chartSection?.destroy();
  }

  // ── Données ───────────────────────────────────────────────────
  listEnseignants      = signal<Enseignant[]>([]);
  listSection          = signal<Section[]>([]);
  listStatusEnseignant = signal<StatusEnseignant[]>([]);
  listProfilEnseignant = signal<ProfilEnseignant[]>([]);
  listDiplomes         = signal<Diplome[]>([]);

  loadPage(): void {
    this.getAllEnseignants();
    this.getListSection();
    this.getListStatusEnseignant();
    this.getListProfilEnseignant();
    this.getListDiplomes();
  }

  getAllEnseignants(): void {
    this.isLoading.set(true);
    this.utilisateurService.findAllEnseignants().subscribe({
      next: (response: Enseignant[]) => {
        this.listEnseignants.set(response);
        this.isLoading.set(false);
        this.cdr.detectChanges();       // force Angular à rendre les canvas
        setTimeout(() => {
          this.destroyCharts();
          this.buildAllCharts();
        }, 0);
      },
      error: (err: any) => {
        console.error('Erreur chargement enseignants :', err);
        this.isLoading.set(false);
      },
    });
  }

  getListSection(): void {
    this.generalService.findAllSections().subscribe({
      next:  (r: Section[]) => this.listSection.set(r),
      error: (err: any) => console.error(err),
    });
  }

  getListStatusEnseignant(): void {
    this.generalService.findAllStatusEnseignants().subscribe({
      next:  (r: StatusEnseignant[]) => this.listStatusEnseignant.set(r),
      error: (err: any) => console.error(err),
    });
  }

  getListProfilEnseignant(): void {
    this.generalService.findAllProfilEnseignants().subscribe({
      next:  (r: ProfilEnseignant[]) => this.listProfilEnseignant.set(r),
      error: (err: any) => console.error(err),
    });
  }

  getListDiplomes(): void {
    this.generalService.findAllDiplomes().subscribe({
      next:  (r: Diplome[]) => this.listDiplomes.set(r),
      error: (err: any) => console.error(err),
    });
  }

  // ── Filtres ───────────────────────────────────────────────────
  activeFilter = signal<string>('all');

  filterChips = [
    { value: 'all',       label: 'Tous'        },
    { value: 'VERIFIE',   label: 'Vérifiés'    },
    { value: 'EN_ATTENTE',label: 'En attente'  },
    { value: 'SUSPENDU',  label: 'Suspendus'   },
  ];

  filteredEnseignants = computed(() => {
    const filter = this.activeFilter();
    const list   = this.listEnseignants();
    if (filter === 'all') return list;
    return list.filter(e => e.statusEnseignant?.intitule === filter);
  });

  countByStatus(status: string): number {
    return this.listEnseignants().filter(e => e.statusEnseignant?.intitule === status).length;
  }

  percentByStatus(status: string): string {
    const total = this.listEnseignants().length;
    if (!total) return '—';
    return Math.round((this.countByStatus(status) / total) * 100) + '%';
  }

  // Badge CSS selon le statut
  getStatutBadgeClass(intitule: string): string {
    const map: Record<string, string> = {
      VERIFIE:    'badge-green',
      EN_ATTENTE: 'badge-yellow',
      SUSPENDU:   'badge-red',
    };
    return map[intitule] ?? 'badge-gray';
  }

  getStatutLabel(intitule: string): string {
    const map: Record<string, string> = {
      VERIFIE:    'Vérifié',
      EN_ATTENTE: 'En attente',
      SUSPENDU:   'Suspendu',
    };
    return map[intitule] ?? intitule;
  }

  // Récupère l'id d'un statut depuis la liste chargée — évite les ids hardcodés
  getStatusId(intitule: string): number {
    const found = this.listStatusEnseignant().find(s => s.intitule === intitule);
    return found?.id ?? 0;
  }

  // ── Graphiques Chart.js ───────────────────────────────────────
  private readonly PALETTE = [
    '#0A4FFF','#22C55E','#F59E0B','#EF4444','#A855F7',
    '#FF6B35','#06B6D4','#EC4899','#84CC16','#F97316',
  ];

  private canvas(id: string): HTMLCanvasElement | null {
    return document.getElementById(id) as HTMLCanvasElement | null;
  }

  private destroyCharts(): void {
    this.chartDiplome?.destroy(); this.chartDiplome = undefined;
    this.chartProfil?.destroy();  this.chartProfil  = undefined;
    this.chartSection?.destroy(); this.chartSection = undefined;
  }

  private buildAllCharts(): void {
    const list = this.listEnseignants();
    this.chartDiplome = this.makeDonut('canvasDiplome', 'Diplômes',
      this.groupBy(list, e => e.diplome?.intitule ?? 'Non renseigné'));
    this.chartProfil  = this.makeDonut('canvasProfil',  'Profils',
      this.groupBy(list, e => e.profilEnseignant?.intitule ?? 'Non renseigné'));
    this.chartSection = this.makeDonut('canvasSection', 'Sections',
      this.groupBy(list, e => e.section?.intitule ?? 'Non renseigné'));
  }

  private makeDonut(id: string, title: string, map: Record<string, number>): Chart | undefined {
    const ctx = this.canvas(id);
    if (!ctx) return undefined;
    const labels = Object.keys(map);
    const data   = Object.values(map);
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        cutout: '62%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter, sans-serif', size: 11 },
              padding: 14,
              boxWidth: 11,
              boxHeight: 11,
            },
          },
          tooltip: {
            callbacks: { label: (ctx) => `  ${ctx.label} : ${ctx.raw}` },
          },
        },
      },
    });
  }

  private groupBy(list: Enseignant[], key: (e: Enseignant) => string): Record<string, number> {
    const map: Record<string, number> = {};
    for (const e of list) {
      const k = key(e) || 'Non renseigné';
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }

  // ── Sélection enseignant ──────────────────────────────────────
  cheminFile  = '';
  nomCV       = signal<string>('');
  nomCNI      = signal<string>('');
  photoProfil = signal<string>('');

  selectEnseignant(enseignant: Enseignant): void {
    this.enseignantForm.patchValue(enseignant);
    this.nomCV.set(enseignant.cv ?? '');
    this.nomCNI.set(enseignant.cni ?? '');
    this.photoProfil.set(this.cheminFile + enseignant.photo);
    this.loadDiplomeFile(this.cheminFile + enseignant.diplomeurl, enseignant.diplomeurl ?? '');
    this.loadCvFile(this.cheminFile + enseignant.cv, enseignant.cv ?? '');
    this.loadCniFile(this.cheminFile + enseignant.cni, enseignant.cni ?? '');
  }

  // ── Fichiers ajout ────────────────────────────────────────────
  addPhotoFile!: File;
  addPhotoFileName = signal<string>('');
  addPhotoPreview  = signal<string>('');
  addPhotoUploaded = signal<boolean>(false);

  onAddSelectPhoto(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.addPhotoFile = file;
      this.addPhotoFileName.set(file.name);
      this.addPhotoUploaded.set(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (ev: ProgressEvent<FileReader>) =>
        this.addPhotoPreview.set(ev.target?.result as string);
    }
  }

  addCvFile!: File;
  addCvFileName  = signal<string>('');
  addCvUploaded  = signal<boolean>(false);

  onAddSelectCv(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.addCvFile = input.files[0];
      this.addCvFileName.set(this.addCvFile.name);
      this.addCvUploaded.set(true);
    }
  }

  addDiplomeFile!: File;
  addDiplomeFileName = signal<string>('');
  addDiplomeUploaded = signal<boolean>(false);

  onAddSelectDiplome(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.addDiplomeFile = input.files[0];
      this.addDiplomeFileName.set(this.addDiplomeFile.name);
      this.addDiplomeUploaded.set(true);
    }
  }

  // ── Modal ajout ───────────────────────────────────────────────
  showAddModal    = signal(false);
  showProfilModal = signal<boolean>(false);
  showDocsModal   = signal(false);
  showDeleteModal = signal(false);
  idToDelete      = signal<number | null>(null);

  openAddModal(): void {
    this.addEnseignantForm.reset();
    this.addPhotoFile = undefined!;
    this.addPhotoFileName.set(''); this.addPhotoPreview.set(''); this.addPhotoUploaded.set(false);
    this.addCvFile = undefined!;
    this.addCvFileName.set(''); this.addCvUploaded.set(false);
    this.addDiplomeFile = undefined!;
    this.addDiplomeFileName.set(''); this.addDiplomeUploaded.set(false);
    this.showAddModal.set(true);
  }

  saveEnseignant(): void {
    if (!this.addPhotoFile)   { alert('Veuillez sélectionner une photo de profil.'); return; }
    if (!this.addCvFile)      { alert('Veuillez téléverser le CV.'); return; }
    if (!this.addDiplomeFile) { alert('Veuillez téléverser le diplôme.'); return; }

    const v = this.addEnseignantForm.value;
    const enseignantDTO = {
      nomComplet: v.nomComplet, telephone: v.telephone, email: v.email,
      password: v.password, localisation: v.localisation,
      anneeexperience: Number(v.anneeexperience), dateNaissance: v.dateNaissance,
      bio: v.bio, tarifHoraire: Number(v.tarifHoraire), specialite: v.specialite,
      statusEnseignant: Number(v.statusEnseignant), section: Number(v.section),
      profilEnseignant: Number(v.profilEnseignant), diplome: Number(v.diplome),
    };

    const formData = new FormData();
    formData.append('enseignant', JSON.stringify(enseignantDTO));
    formData.append('photo',   this.addPhotoFile);
    formData.append('cv',      this.addCvFile);
    formData.append('diplome', this.addDiplomeFile);

    this.utilisateurService.createEnseignant(formData).subscribe({
      next: (response: number) => {
        if (response > 0) {
          this.showAddModal.set(false);
          this.addEnseignantForm.reset();
          this.loadPage();
        } else {
          alert('Erreur lors de la création du compte enseignant.');
        }
      },
      error: (err: any) => console.error('Erreur création enseignant :', err),
    });
  }

  // ── Statut & suppression ──────────────────────────────────────
  changeStatus(id: number, idS: number): void {
    this.utilisateurService.changeStatusEnseignant(id, idS).subscribe({
      next:  (r: ResponseServer) => { console.log(r.message); this.getAllEnseignants(); },
      error: (err: any) => console.error(err),
    });
  }

  confirmDelete(id: number): void { this.idToDelete.set(id); this.showDeleteModal.set(true); }

  executeDelete(): void {
    const id = this.idToDelete();
    if (id !== null) this.deleteEnseignant(id);
    this.showDeleteModal.set(false);
    this.idToDelete.set(null);
  }

  deleteEnseignant(id: number): void {
    this.utilisateurService.deleteEnseignant(id).subscribe({
      next:  () => this.getAllEnseignants(),
      error: (err: any) => console.error('Erreur suppression enseignant :', err),
    });
  }

  // ── Modals profil & docs ──────────────────────────────────────
  // Enseignant actuellement affiché dans la modale profil
  selectedEnseignant = signal<Enseignant | null>(null);
  // Id du statut sélectionné dans les chips (0 = aucun choix)
  selectedStatusId   = signal<number>(0);
  // Spinner pendant la sauvegarde du statut
  isSavingStatus     = signal<boolean>(false);

  openProfilModal(enseignant: Enseignant): void {
    this.selectEnseignant(enseignant);          // charge photo, cv, etc.
    this.selectedEnseignant.set(enseignant);
    // Pré-sélectionne le statut actuel de l'enseignant
    this.selectedStatusId.set(enseignant.statusEnseignant?.id ?? 0);
    this.showProfilModal.set(true);
  }

  closeProfilModal(): void {
    this.showProfilModal.set(false);
    this.selectedEnseignant.set(null);
    this.selectedStatusId.set(0);
  }

  /** Applique le statut sélectionné via les chips */
  applyStatus(enseignantId: number): void {
    const idStatus = this.selectedStatusId();
    if (!idStatus) return;

    this.isSavingStatus.set(true);
    this.utilisateurService.changeStatusEnseignant(enseignantId, idStatus).subscribe({
      next: (r: ResponseServer) => {
        this.isSavingStatus.set(false);
        // Met à jour le signal local sans recharger toute la liste
        this.listEnseignants.update(list =>
          list.map(e => {
            if (e.id !== enseignantId) return e;
            const nouveauStatut = this.listStatusEnseignant().find(s => s.id === idStatus) ?? e.statusEnseignant;
            return { ...e, statusEnseignant: nouveauStatut };
          })
        );
        // Rafraîchit aussi l'enseignant dans la modale
        const updated = this.listEnseignants().find(e => e.id === enseignantId) ?? null;
        this.selectedEnseignant.set(updated);
      },
      error: (err) => {
        console.error('[applyStatus] erreur :', err);
        this.isSavingStatus.set(false);
      },
    });
  }

  openDocsModal(enseignant: Enseignant): void   { this.selectEnseignant(enseignant); this.showDocsModal.set(true); }

  diplomeUrl = ''; diplomeFileName = ''; safeDiplomeUrl?: SafeResourceUrl;
  diplomeFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';
  cvUrl = ''; cvFileName = ''; safeCvUrl?: SafeResourceUrl;
  cvFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';
  cniUrl = ''; cniFileName = ''; safeCniUrl?: SafeResourceUrl;
  cniFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  getFileType(filename: string): 'image' | 'pdf' | 'docx' | 'other' {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc','docx'].includes(ext)) return 'docx';
    return 'other';
  }

  loadDiplomeFile(url: string, name: string): void {
    this.diplomeUrl = url; this.diplomeFileName = name;
    this.diplomeFileType = this.getFileType(name);
    this.safeDiplomeUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  loadCvFile(url: string, name: string): void {
    this.cvUrl = url; this.cvFileName = name;
    this.cvFileType = this.getFileType(name);
    this.safeCvUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  loadCniFile(url: string, name: string): void {
    this.cniUrl = url; this.cniFileName = name;
    this.cniFileType = this.getFileType(name);
    this.safeCniUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getInitiales(nomComplet: string = ''): string {
    return nomComplet.trim().split(/\s+/).map(n => n[0] ?? '').join('').substring(0, 2).toUpperCase();
  }
}