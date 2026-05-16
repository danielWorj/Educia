import {
  Component, computed, signal, effect,
  AfterViewInit, OnDestroy,
  ViewChild, ElementRef, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Chart, registerables } from 'chart.js';

import { Section }            from '../../../../Core/Model/Academie/Section';
import { ResponseServer }     from '../../../../Core/Model/Server/ResponseServer';
import { Enseignant }         from '../../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { GeneralService }     from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { DevenirRepetiteur }  from '../../../site/home/Formulaire/devenir-repetiteur/devenir-repetiteur';
import { Diplome }            from '../../../../Core/Model/Utilisateur/Enseignant/Diplome';
import { ProfilEnseignant }   from '../../../../Core/Model/Utilisateur/Enseignant/ProfilEnseignant';
import { StatusEnseignant }   from '../../../../Core/Model/Utilisateur/Enseignant/StatusEnseignant';

Chart.register(...registerables);

@Component({
  selector: 'app-genseignant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DevenirRepetiteur],
  templateUrl: './genseignant.html',
  styleUrl: './genseignant.css',
})
export class Genseignant implements AfterViewInit, OnDestroy {

  // ── Références canvas Chart.js ────────────────────────────────────────────
  @ViewChild('chartDiplome') chartDiplomeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartProfil')  chartProfilRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartSection') chartSectionRef!: ElementRef<HTMLCanvasElement>;

  private chartDiplome?: Chart;
  private chartProfil?:  Chart;
  private chartSection?: Chart;
  private chartsReady = false;

  private cdr = inject(ChangeDetectorRef);

  // ── Formulaires ───────────────────────────────────────────────────────────
  enseignantForm!:    FormGroup;
  addEnseignantForm!: FormGroup;

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

    // ── effect() réactif : se déclenche à chaque changement du signal ─────────
    effect(() => {
      const list = this.listEnseignants(); // tracking automatique du signal
      if (this.chartsReady && list.length > 0) {
        setTimeout(() => this.updateCharts(), 0);
      }
    });
  }

  loadPage(): void {
    this.getAllEnseignants();
    this.getListSection();
    this.getListStatusEnseignant();
    this.getListProfilEnseignant();
    this.getListDiplomes();
  }

  ngAfterViewInit(): void {
    // Délai minimal pour que les @ViewChild soient stables dans le DOM
    setTimeout(() => {
      this.createCharts();
      this.chartsReady = true;
      // Si les données sont déjà arrivées avant ngAfterViewInit (cache/rapide)
      if (this.listEnseignants().length > 0) {
        this.updateCharts();
      }
    }, 50);
  }

  ngOnDestroy(): void {
    this.chartDiplome?.destroy();
    this.chartProfil?.destroy();
    this.chartSection?.destroy();
  }

  // ── Données ───────────────────────────────────────────────────────────────
  listEnseignants      = signal<Enseignant[]>([]);
  listSection          = signal<Section[]>([]);
  listStatusEnseignant = signal<StatusEnseignant[]>([]);
  listProfilEnseignant = signal<ProfilEnseignant[]>([]);
  listDiplomes         = signal<Diplome[]>([]);

  getAllEnseignants(): void {
    this.utilisateurService.findAllEnseignants().subscribe({
      next: (response: Enseignant[]) => {
        this.listEnseignants.set(response);
        if (this.chartsReady) this.updateCharts();
      },
      error: (err: any) => console.error('Erreur chargement enseignants :', err),
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

  // ── Filtres ───────────────────────────────────────────────────────────────
  activeFilter = signal<string>('all');

  filterChips = [
    { value: 'all',      label: 'Tous'       },
    { value: 'approuve', label: 'Approuvés'  },
    { value: 'attente',  label: 'En attente' },
    { value: 'suspendu', label: 'Suspendus'  },
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

  // ── Regroupements pour les graphiques ─────────────────────────────────────
  private groupBy(list: Enseignant[], key: (e: Enseignant) => string): Record<string, number> {
    const map: Record<string, number> = {};
    for (const e of list) {
      const k = key(e) || 'Non renseigné';
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }

  private readonly PALETTE = [
    '#0A4FFF', '#22C55E', '#F59E0B', '#EF4444', '#A855F7',
    '#FF6B35', '#06B6D4', '#EC4899', '#84CC16', '#F97316',
  ];

  // ── Création initiale des graphiques ─────────────────────────────────────
  private createCharts(): void {
    /** Options partagées — canvas limité à 180 px de hauteur via CSS */
    const sharedOptions = {
      responsive: true,
      maintainAspectRatio: false,   // false = hauteur fixée par le CSS du canvas
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            padding: 10,
            usePointStyle: true,
            pointStyleWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const total: number = ctx.dataset.data.reduce(
                (a: number, b: number) => a + b, 0
              );
              const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            },
          },
        },
      },
    };

    const emptyDataset = () => ({
      data: [] as number[],
      backgroundColor: this.PALETTE,
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 6,
    });

    this.chartDiplome = new Chart(this.chartDiplomeRef.nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [emptyDataset()] },
      options: sharedOptions,
    });

    this.chartProfil = new Chart(this.chartProfilRef.nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [emptyDataset()] },
      options: sharedOptions,
    });

    this.chartSection = new Chart(this.chartSectionRef.nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [emptyDataset()] },
      options: sharedOptions,
    });
  }

  // ── Mise à jour des graphiques quand les données arrivent ─────────────────
  private updateCharts(): void {
    const list = this.listEnseignants();
    if (!list.length) return;

    const byDiplome = this.groupBy(list, e => e.diplome?.intitule ?? '');
    const byProfil  = this.groupBy(list, e => e.profilEnseignant?.intitule ?? '');
    const bySection = this.groupBy(list, e => e.section?.intitule ?? '');

    this.applyChartData(this.chartDiplome!, byDiplome);
    this.applyChartData(this.chartProfil!,  byProfil);
    this.applyChartData(this.chartSection!, bySection);
  }

  private applyChartData(chart: Chart, map: Record<string, number>): void {
    const labels = Object.keys(map);
    const data   = Object.values(map);
    chart.data.labels                       = labels;
    chart.data.datasets[0].data            = data;
    chart.data.datasets[0].backgroundColor = this.PALETTE.slice(0, labels.length);
    chart.update('active');
  }

  // ── Enseignant sélectionné ────────────────────────────────────────────────
  cheminFile         = 'assets/file/';
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

  // ── Fichiers Modal Ajout ──────────────────────────────────────────────────
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

  // ── Modal Ajout ───────────────────────────────────────────────────────────
  openAddModal(): void {
    this.addEnseignantForm.reset();
    this.addPhotoFile = undefined!;
    this.addPhotoFileName.set('');
    this.addPhotoPreview.set('');
    this.addPhotoUploaded.set(false);
    this.addCvFile = undefined!;
    this.addCvFileName.set('');
    this.addCvUploaded.set(false);
    this.addDiplomeFile = undefined!;
    this.addDiplomeFileName.set('');
    this.addDiplomeUploaded.set(false);
    this.showAddModal.set(true);
  }

  // ── Soumission création enseignant ────────────────────────────────────────
  saveEnseignant(): void {
    if (!this.addPhotoFile)   { alert('Veuillez sélectionner une photo de profil.'); return; }
    if (!this.addCvFile)      { alert('Veuillez téléverser le CV.');                  return; }
    if (!this.addDiplomeFile) { alert('Veuillez téléverser le diplôme.');             return; }

    const v = this.addEnseignantForm.value;

    const enseignantDTO = {
      nomComplet:       v.nomComplet,
      telephone:        v.telephone,
      email:            v.email,
      password:         v.password,
      localisation:     v.localisation,
      anneeexperience:  Number(v.anneeexperience),
      dateNaissance:    v.dateNaissance,
      bio:              v.bio,
      tarifHoraire:     Number(v.tarifHoraire),
      specialite:       v.specialite,
      statusEnseignant: Number(v.statusEnseignant),
      section:          Number(v.section),
      profilEnseignant: Number(v.profilEnseignant),
      diplome:          Number(v.diplome),
    };

    const formData = new FormData();
    formData.append('enseignant', JSON.stringify(enseignantDTO));
    formData.append('photo',     this.addPhotoFile);
    formData.append('cv',        this.addCvFile);
    formData.append('diplome',   this.addDiplomeFile);

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

  // ── Statut ────────────────────────────────────────────────────────────────
  changeStatus(id: number, idS: number): void {
    this.utilisateurService.changeStatusEnseignant(id, idS).subscribe({
      next:  (response: ResponseServer) => {
        console.log(response.message);
        this.getAllEnseignants();
      },
      error: (err: any) => console.error(err),
    });
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  showDeleteModal = signal(false);
  idToDelete      = signal<number | null>(null);

  confirmDelete(id: number): void {
    this.idToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const id = this.idToDelete();
    if (id !== null) this.deleteEnseignant(id);
    this.showDeleteModal.set(false);
    this.idToDelete.set(null);
  }

  deleteEnseignant(id: number): void {
    this.utilisateurService.deleteEnseignant(id).subscribe({
      next:  () => { this.getAllEnseignants(); },
      error: (err: any) => console.error('Erreur suppression enseignant :', err),
    });
  }

  // ── Modals ────────────────────────────────────────────────────────────────
  showProfilModal = signal<boolean>(false);
  showDocsModal   = signal(false);
  showAddModal    = signal(false);

  openProfilModal(enseignant: Enseignant): void {
    this.selectEnseignant(enseignant);
    this.showProfilModal.set(true);
  }

  closeProfilModal(): void { this.showProfilModal.set(false); }

  openDocsModal(enseignant: Enseignant): void {
    this.selectEnseignant(enseignant);
    this.showDocsModal.set(true);
  }

  // ── Fichiers détail ───────────────────────────────────────────────────────
  diplomeUrl      = '';  diplomeFileName = '';  safeDiplomeUrl?: SafeResourceUrl;
  diplomeFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  cvUrl           = '';  cvFileName = '';       safeCvUrl?: SafeResourceUrl;
  cvFileType:      'image' | 'pdf' | 'docx' | 'other' = 'other';

  cniUrl          = '';  cniFileName = '';      safeCniUrl?: SafeResourceUrl;
  cniFileType:     'image' | 'pdf' | 'docx' | 'other' = 'other';

  getFileType(filename: string): 'image' | 'pdf' | 'docx' | 'other' {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    return 'other';
  }

  loadDiplomeFile(url: string, name: string): void {
    this.diplomeUrl      = url;  this.diplomeFileName = name;
    this.diplomeFileType = this.getFileType(name);
    this.safeDiplomeUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadCvFile(url: string, name: string): void {
    this.cvUrl      = url;  this.cvFileName = name;
    this.cvFileType = this.getFileType(name);
    this.safeCvUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadCniFile(url: string, name: string): void {
    this.cniUrl      = url;  this.cniFileName = name;
    this.cniFileType = this.getFileType(name);
    this.safeCniUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ── Utilitaires UI ────────────────────────────────────────────────────────
  getInitiales(nomComplet: string = ''): string {
    return nomComplet
      .trim()
      .split(/\s+/)
      .map(n => n[0] ?? '')
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}