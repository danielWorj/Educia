import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarketPlaceService } from '../../../../Core/Service/MarketPlace/market-place-service';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { Support } from '../../../../Core/Model/MarketPlace/Support';
import { TypeRessource } from '../../../../Core/Model/MarketPlace/TypeRessource';
import { Matiere } from '../../../../Core/Model/Academie/Matiere';
import { Niveau } from '../../../../Core/Model/Academie/Niveau';
import { Filiere } from '../../../../Core/Model/Academie/Filiere';

@Component({
  selector: 'app-gsupport',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gsupport.html',
  styleUrl: './gsupport.css',
})
export class GSupport {

  // ─── État modales ────────────────────────────────────────────────────────────
  showCreateModal = signal(false);
  showEditModal   = signal(false);
  showDetailModal = signal(false);
  showDeleteModal = signal(false);

  // ─── État UI ─────────────────────────────────────────────────────────────────
  isLoading       = signal(false);
  isSaving        = signal(false);
  errorMessage    = signal<string | null>(null);
  successMessage  = signal<string | null>(null);
  searchQuery     = signal('');
  activeFilter    = signal<'all' | 'actif' | 'gratuit' | 'payant'>('all');

  // ─── Données ─────────────────────────────────────────────────────────────────
  listSupport       = signal<Support[]>([]);
  listTypeRessource = signal<TypeRessource[]>([]);
  listMatiere       = signal<Matiere[]>([]);
  listNiveau        = signal<Niveau[]>([]);
  listFiliere       = signal<Filiere[]>([]);

  selectedSupport   = signal<Support | null>(null);
  private deleteTargetId: number | null = null;

  // ─── Computed : filtrage ─────────────────────────────────────────────────────
  filteredSupports = computed(() => {
    const q = this.searchQuery().toLowerCase();
    let list = this.listSupport();

    switch (this.activeFilter()) {
      case 'actif':   list = list.filter(s => s.statut);      break;
      case 'gratuit': list = list.filter(s => s.prix === 0);  break;
      case 'payant':  list = list.filter(s => s.prix > 0);    break;
    }

    if (q) {
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q)                    ||
        s.matiere?.intitule?.toLowerCase().includes(q)        ||
        s.enseignant?.nomComplet?.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // ─── Computed : stats ────────────────────────────────────────────────────────
  countActifs   = computed(() => this.listSupport().filter(s => s.statut).length);
  countGratuits = computed(() => this.listSupport().filter(s => s.prix === 0).length);
  countPayants  = computed(() => this.listSupport().filter(s => s.prix > 0).length);

  percentActifs = computed(() => {
    const t = this.listSupport().length;
    return t ? Math.round(this.countActifs()   * 100 / t) + '%' : '0%';
  });
  percentGratuits = computed(() => {
    const t = this.listSupport().length;
    return t ? Math.round(this.countGratuits() * 100 / t) + '%' : '0%';
  });
  percentPayants = computed(() => {
    const t = this.listSupport().length;
    return t ? Math.round(this.countPayants()  * 100 / t) + '%' : '0%';
  });

  // ─── Fichier ─────────────────────────────────────────────────────────────────
  fileSupport!: File;
  filePreviewName = signal<string | null>(null);

  // ─── Formulaire ──────────────────────────────────────────────────────────────
  supportFb!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private marketPlaceService: MarketPlaceService,
    private generalService: GeneralService
  ) {
    this.initForm();
    this.loadPage();
  }

  private initForm(support?: Support): void {
    this.supportFb = this.fb.group({
      id:         new FormControl(support?.id ?? null),
      title:      new FormControl(support?.title      ?? '', [Validators.required, Validators.minLength(3)]),
      resume:     new FormControl(support?.resume     ?? '', [Validators.required]),
      prix:       new FormControl(support?.prix       ?? 0,  [Validators.required, Validators.min(0)]),
      matiere:    new FormControl(support?.matiere?.id    ?? null, [Validators.required]),
      niveau:     new FormControl(support?.niveau?.id     ?? null, [Validators.required]),
      filiere:    new FormControl(support?.filiere?.id    ?? null, [Validators.required]),
      type:       new FormControl(support?.type?.id       ?? null, [Validators.required]),
      enseignant: new FormControl(support?.enseignant?.id ?? null, [Validators.required]),
    });
  }

  // ─── Chargement ──────────────────────────────────────────────────────────────
  loadPage(): void {
    this.getAllSupport();
    this.getAllReferenceData();
  }

  getAllSupport(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next: (data: Support[]) => {
        this.listSupport.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les supports.');
        this.isLoading.set(false);
      }
    });
  }

  getAllReferenceData(): void {
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next: (data: TypeRessource[]) => this.listTypeRessource.set(data),
      error: () => console.error('Erreur chargement types ressource')
    });
    this.generalService.findAllMatiere().subscribe({
      next: (data: Matiere[]) => this.listMatiere.set(data),
      error: () => console.error('Erreur chargement matières')
    });
    this.generalService.findAllNiveau().subscribe({
      next: (data: Niveau[]) => this.listNiveau.set(data),
      error: () => console.error('Erreur chargement niveaux')
    });
    this.generalService.findAllFiliere().subscribe({
      next: (data: Filiere[]) => this.listFiliere.set(data),
      error: () => console.error('Erreur chargement filières')
    });
  }

  // ─── Ouverture modales ───────────────────────────────────────────────────────
  openCreateModal(): void {
    this.initForm();
    this.filePreviewName.set(null);
    this.errorMessage.set(null);
    this.showCreateModal.set(true);
  }

  openEditModal(support: Support): void {
    this.initForm(support);
    this.selectedSupport.set(support);
    this.errorMessage.set(null);
    this.showEditModal.set(true);
  }

  openDetailModal(support: Support): void {
    this.selectedSupport.set(support);
    this.showDetailModal.set(true);
  }

  // ─── Fermeture modales ───────────────────────────────────────────────────────
  closeCreateModal(): void { this.showCreateModal.set(false); }
  closeEditModal():   void { this.showEditModal.set(false);   }
  closeDetailModal(): void { this.showDetailModal.set(false); }
  closeDeleteModal(): void { this.showDeleteModal.set(false); }

  // ─── Sélection fichier ───────────────────────────────────────────────────────
  onSelectSupportFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        this.fileSupport = event.target.files[0];
        this.filePreviewName.set(this.fileSupport.name);
      };
    }
  }

  // ─── CREATE ──────────────────────────────────────────────────────────────────
  createSupport(): void {
    if (this.supportFb.invalid) {
      this.supportFb.markAllAsTouched();
      return;
    }
    if (!this.fileSupport) {
      this.errorMessage.set('Veuillez sélectionner un fichier.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const fd = new FormData();
    fd.append('support', JSON.stringify(this.supportFb.value));
    fd.append('file', this.fileSupport);

    this.marketPlaceService.createMarketplaceItem(fd).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showCreateModal.set(false);
        this.showSuccess('Support créé avec succès !');
        this.getAllSupport();
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Erreur lors de la création du support.');
      }
    });
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────────
  updateSupport(): void {
    if (this.supportFb.invalid) {
      this.supportFb.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.marketPlaceService.updateMarketplaceItem(JSON.stringify(this.supportFb.value)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showEditModal.set(false);
        this.showSuccess('Support mis à jour avec succès !');
        this.getAllSupport();
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Erreur lors de la mise à jour.');
      }
    });
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────────
  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    if (this.deleteTargetId === null) return;
    this.marketPlaceService.deleteMarketplaceItem(this.deleteTargetId).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.showDetailModal.set(false);
        this.deleteTargetId = null;
        this.showSuccess('Support supprimé.');
        this.getAllSupport();
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la suppression.');
        this.showDeleteModal.set(false);
      }
    });
  }

  // ─── Recherche ───────────────────────────────────────────────────────────────
  onSearch(event: any): void {
    this.searchQuery.set(event.target.value);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.supportFb.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  trackById(_: number, item: any): number {
    return item.id;
  }
}