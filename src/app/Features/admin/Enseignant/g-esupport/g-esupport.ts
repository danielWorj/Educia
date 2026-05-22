import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MarketPlaceService } from '../../../../Core/Service/MarketPlace/market-place-service';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { TypeRessource } from '../../../../Core/Model/MarketPlace/TypeRessource';
import { Matiere } from '../../../../Core/Model/Academie/Matiere';
import { Support } from '../../../../Core/Model/MarketPlace/Support';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Filiere } from '../../../../Core/Model/Academie/Filiere';

@Component({
  selector: 'app-g-esupport',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './g-esupport.html',
  styleUrl: './g-esupport.css',
})
export class GEsupport {

  // ─── Forms ──────────────────────────────────────────────────────────────────
  supportFb!: FormGroup;

  // ─── Auth ───────────────────────────────────────────────────────────────────
  idEnseignant = signal<number>(0);

  // ─── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal<boolean>(true);

  // ─── Données ────────────────────────────────────────────────────────────────
  listSupport      = signal<Support[]>([]);
  listRessource    = signal<TypeRessource[]>([]);
  listMatiere      = signal<Matiere[]>([]);
  listNiveau       = signal<Filiere[]>([]);
  listFiliere      = signal<Filiere[]>([]);

  // ─── Filtres ─────────────────────────────────────────────────────────────────
  activeFilter     = signal<string>('all');
  activeMatiereId  = signal<number>(0);

  filterChips = [
    { value: 'all',       label: 'Tous'            },
    { value: '1',         label: 'Cours'           },
    { value: '2',         label: 'Exercices'       },
    { value: '3',         label: 'Corrections'     },
    { value: '4',         label: "Sujets d'examen" },
  ];

  filteredSupports = computed(() => {
    let list = this.listSupport();
    const filter   = this.activeFilter();
    const matiereId = this.activeMatiereId();

    if (filter !== 'all') {
      list = list.filter(s => String(s.type?.id) === filter);
    }
    if (matiereId > 0) {
      list = list.filter(s => s.matiere?.id === matiereId);
    }
    return list;
  });

  // ─── Stats computed ──────────────────────────────────────────────────────────
  get countPublies(): number {
    return this.listSupport().filter(s => s.statut).length;
  }

  get countRevision(): number {
    return this.listSupport().filter(s => !s.statut).length;
  }

  get totalTelechargements(): number {
    return 0;
  }

  // ─── Modals ──────────────────────────────────────────────────────────────────
  showAddModal    = signal<boolean>(false);
  showEditModal   = signal<boolean>(false);
  showDetailModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);

  selectSupport = signal<Support | null>(null);
  idToDelete    = signal<number | null>(null);

  openAddModal(): void {
    this.supportFb.reset();
    this.fileSupport = undefined!;
    this.showAddModal.set(true);
  }

  openEditModal(s: Support): void {
    this.selectSupport.set(s);
    this.supportFb.patchValue({
      ...s,
      type:     s.type?.id,
      matiere:  s.matiere?.id,
      niveau:   s.niveau?.id,
      filiere:  s.filiere?.id,
    });
    this.showEditModal.set(true);
  }

  openDetailModal(s: Support): void {
    this.selectSupport.set(s);
    this.showDetailModal.set(true);
  }

  confirmDelete(id: number): void {
    this.idToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const id = this.idToDelete();
    if (id !== null) {
      this.marketPlaceService.deleteMarketplaceItem?.(id).subscribe({
        next: () => this.getAllSupports(),
        error: (err: any) => console.error('Erreur suppression support :', err),
      });
    }
    this.showDeleteModal.set(false);
    this.idToDelete.set(null);
  }

  // ─── Fichier ─────────────────────────────────────────────────────────────────
  fileSupport!: File;
  fileSelected = signal<boolean>(false);
  fileName     = signal<string>('');

  onSelectSupportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) {
      this.fileSupport = file;
      this.fileSelected.set(true);
      this.fileName.set(file.name);
    }
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  createSupport(): void {
    this.supportFb.controls['enseignant'].setValue(this.idEnseignant());

    const formData = new FormData();
    formData.append('support', JSON.stringify(this.supportFb.value));
    if (this.fileSupport) formData.append('file', this.fileSupport);

    this.marketPlaceService.createMarketplaceItem(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          alert(data.message);
          this.showAddModal.set(false);
          this.supportFb.reset();
          this.getAllSupports();
        }
      },
      error: () => console.error('Erreur de création du support'),
    });
  }

  updateSupport(): void {
    const formData = new FormData();
    formData.append('support', JSON.stringify(this.supportFb.value));
    if (this.fileSupport) formData.append('file', this.fileSupport);

    this.marketPlaceService.updateMarketplaceItem?.(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          alert(data.message);
          this.showEditModal.set(false);
          this.getAllSupports();
        }
      },
      error: () => console.error('Erreur de mise à jour du support'),
    });
  }

  // ─── Service calls ────────────────────────────────────────────────────────────
  constructor(
    private fb: FormBuilder,
    private marketPlaceService: MarketPlaceService,
    private generalService: GeneralService,
  ) {
    this.supportFb = this.fb.group({
      id:         new FormControl(),
      title:      new FormControl(),
      prix:       new FormControl(),
      resume:     new FormControl(),
      matiere:    new FormControl(),
      niveau:     new FormControl(),
      filiere:    new FormControl(),
      type:       new FormControl(),
      enseignant: new FormControl(),
    });

    this.idEnseignant.set(parseInt(localStorage.getItem('id')!) || 0);
    this.loadPage();
  }

  loadPage(): void {
    this.getAllSupports();
    this.loadFormData();
  }

  getAllSupports(): void {
    this.isLoading.set(true);
    this.marketPlaceService.findMarketplaceItemByEnseignantId(this.idEnseignant()).subscribe({
      next: (data: Support[]) => {
        this.listSupport.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback : tous les items
        this.marketPlaceService.findMarketplaceItems().subscribe({
          next: (data: Support[]) => { this.listSupport.set(data); this.isLoading.set(false); },
          error: () => this.isLoading.set(false),
        });
      },
    });
  }

  loadFormData(): void {
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next: (data: TypeRessource[]) => this.listRessource.set(data),
      error: (err: any) => console.error(err),
    });
    this.generalService.findAllMatiere().subscribe({
      next: (data: Matiere[]) => this.listMatiere.set(data),
      error: (err: any) => console.error(err),
    });
    this.generalService.findAllFiliere().subscribe({
      next: (data: Filiere[]) => this.listFiliere.set(data),
      error: (err: any) => console.error(err),
    });
    this.generalService.findAllNiveau().subscribe({
      next: (data: Filiere[]) => this.listNiveau.set(data),
      error: (err: any) => console.error(err),
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  getTypeBadge(typeId: number): string {
    const map: Record<number, string> = { 1: 'badge-orange', 2: 'badge-yellow', 3: 'badge-blue', 4: 'badge-purple' };
    return map[typeId] ?? 'badge-blue';
  }
}