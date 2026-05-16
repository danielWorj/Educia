import { Component, signal, computed, inject } from '@angular/core';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { OffreDescript } from '../../../../Core/Model/Repetition/Offre';
import { MatiereOffre } from '../../../../Core/Model/Repetition/MatiereOffre';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { DatePipe } from '@angular/common';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';
import { MatchingResult } from '../../../../Core/Model/IA/MatchingResult';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import e from 'express';

// Pas de statut dans le modèle Offre — filtres basés sur niveau/filière/texte
export type FilterType = 'toutes' | 'urgentes';

@Component({
  selector: 'app-goffre',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './goffre.html',
  styleUrl: './goffre.css',
})
export class GOffre {


  private repetitionService = inject(RepetitionService);
  private iaService = inject(AssistantService);

  // ─── Données ──────
  listOffres        = signal<OffreDescript[]>([]);
  listOffresSaved   = signal<OffreDescript[]>([]);
  listLocalisation  = signal<string[]>([]);

  // ─── Sélection / modals ────────────────────────────────────────────────────
  offreSelected     = signal<OffreDescript | null>(null);
  offreToDelete     = signal<OffreDescript | null>(null);
  offreForMatching  = signal<OffreDescript | null>(null);

  // ─── Filtres ──────
  activeFilter      = signal<FilterType>('toutes');
  searchQuery       = signal<string>('');

  // ─── UI modals ────
  isViewModalOpen    = signal<boolean>(false);
  isDeleteModalOpen  = signal<boolean>(false);
  isBotModalOpen     = signal<boolean>(false);
  showAddModal       = signal<boolean>(false);

  // ─── Matching IA ──
  isMatchingLoading  = signal<boolean>(true);
  matchingResults    = signal<MatchingResult[]>([]);
  matchingSaveState  = signal<'idle' | 'success' | 'error'>('idle');
  isSaving           = signal<boolean>(false);
  isInternError = signal<boolean>(false);

  // ─── Stats (computed) ──────────────────────────────────────────────────────
  totalOffres        = computed(() => this.listOffresSaved().length);
  totalCandidatures  = computed(() =>
    this.listOffresSaved().reduce((acc, o) => acc + o.candidature, 0)
  );

  // ─── Init ─────────

  matchingDBFb !: FormGroup;
  addOffreForm  !: FormGroup;

  constructor(private fb: FormBuilder) {
    this.matchingDBFb = this.fb.group({
      id:         new FormControl(''),
      offre:      new FormControl(''),
      enseignant: new FormControl(''),
      score:      new FormControl(''),
    });

    this.addOffreForm = this.fb.group({
      niveau:    new FormControl(''),
      filiere:   new FormControl(''),
      frequence: new FormControl(''),
      duree:     new FormControl(''),
      budget:    new FormControl(''),
      bio:       new FormControl(''),
    });

    this.constructOffre();
  }

  // ─── Ajout offre ──
  submitAddOffre(): void {
    if (this.addOffreForm.invalid) return;
    // TODO: appeler le service de création d'offre
    console.log('Nouvelle offre :', this.addOffreForm.value);
    this.showAddModal.set(false);
    this.addOffreForm.reset();
    this.constructOffre();
  }

  // ─── Chargement ───
  async constructOffre(): Promise<void> {
    try {
      const listOffre = await this.repetitionService.findAllOffre().toPromise();
      if (!listOffre) return;

      const resultats: OffreDescript[] = [];

      for (const o of listOffre) {
        const matieresO = await this.repetitionService
          .findAllMatiereOffre(o.id)
          .toPromise();
        resultats.push({
          offre: o,
          matieres: (matieresO ?? []) as MatiereOffre[],
          candidature: 0,
        });
      }

      this.listOffresSaved.set(resultats);
      this.applyFilters();

      const locs = [
        ...new Set(
          resultats
            .map(r => r.offre.parent.localisation)
            .filter((l): l is string => !!l)
        ),
      ];
      this.listLocalisation.set(locs);

    } catch (err) {
      console.error('Erreur chargement offres :', err);
    }
  }

  // ─── Filtrage ─────
  // Le modèle Offre n'ayant pas de statut, setFilter est conservé
  // pour une extension future (ex: filtre par filière ou niveau)
  setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
    this.applyFilters();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = this.listOffresSaved();
    const query = this.searchQuery().toLowerCase();

    // Recherche sur les champs réels du modèle Offre
    if (query) {
      result = result.filter(o =>
        o.offre.bio?.toLowerCase().includes(query)              ||
        o.offre.niveau?.intitule?.toLowerCase().includes(query)      ||
        o.offre.filiere?.intitule?.toLowerCase().includes(query)     ||
        o.offre.parent?.nomComplet?.toLowerCase().includes(query)      ||
        o.offre.parent?.localisation?.toLowerCase().includes(query) ||
        o.matieres.some(m => m.matiere?.intitule?.toLowerCase().includes(query))
      );
    }

    this.listOffres.set(result);
  }

  filtreParNiveau(typeId: number): void {
    this.listOffres.set(this.listOffresSaved().filter(o => o.offre.id === typeId));
  }

  // ─── Actions ──────
  viewOffre(offre: OffreDescript): void {
    this.offreSelected.set(offre);
    this.openModal('viewOffer');
  }

  confirmDelete(offre: OffreDescript): void {
    this.offreToDelete.set(offre);
    this.openModal('deleteOffer');
  }

  deleteOffre(): void {
    const offre = this.offreToDelete();
    if (!offre) return;

    this.repetitionService.deleteOffre(offre.offre.id).subscribe({
      next: (data: ResponseServer) => {
        console.log('Offre supprimée :', data);
        this.closeModal('deleteOffer');
        this.offreToDelete.set(null);
        this.constructOffre();
      },
      error: (err) => {
        console.error('Erreur suppression offre :', err);
      },
    });
  }

  // ─── Matching IA ──
  openMatching(offre: OffreDescript): void {
    this.offreForMatching.set(offre);
    this.isMatchingLoading.set(true);
    this.matchingResults.set([]);
    this.matchingSaveState.set('idle');
    this.isSaving.set(false);
    this.openModal('botMatching');
    this.matching();
  }
 
  matching(): void {
    const offre = this.offreForMatching();
    if (!offre) return;

    this.isMatchingLoading.set(true);
    this.matchingResults.set([]);

    this.iaService.matchingForOffre(offre.offre.id).subscribe({
      next: (results:MatchingResult[]) => {
        this.matchingResults.set(results);

        for (const r of results) {
          console.log(`Enseignant: ${r.enseignant.nomComplet},  Score: ${r.score}`);
        }
        this.isMatchingLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur matching IA :', err);
        this.isMatchingLoading.set(false);
      },
    });
  }

  relanceMatching(): void {
    this.matchingSaveState.set('idle');
    this.matching();
  }

  // ─── Modals ───────
  openModal(id: 'viewOffer' | 'deleteOffer' | 'botMatching'): void {
    document.body.style.overflow = 'hidden';
    switch (id) {
      case 'viewOffer':   this.isViewModalOpen.set(true);   break;
      case 'deleteOffer': this.isDeleteModalOpen.set(true); break;
      case 'botMatching': this.isBotModalOpen.set(true);    break;
    }
  }

  closeModal(id: 'viewOffer' | 'deleteOffer' | 'botMatching'): void {
    document.body.style.overflow = '';
    switch (id) {
      case 'viewOffer':   this.isViewModalOpen.set(false);   break;
      case 'deleteOffer': this.isDeleteModalOpen.set(false); break;
      case 'botMatching': this.isBotModalOpen.set(false);    break;
    }
  }

  // ─── Helpers template ──────────────────────────────────────────────────────
  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-95';
    if (score >= 85) return 'score-88';
    if (score >= 80) return 'score-82';
    if (score >= 75) return 'score-76';
    return 'score-70';
  }

  revenirAuMatching(): void {
    this.matchingSaveState.set('idle');
  }

  sauvegarderMatching(): void {
      const offre = this.offreForMatching();
      if (!offre) return;

      const results = this.matchingResults();
      if (!results || results.length === 0) {
        console.warn('Aucun résultat de matching à sauvegarder.');
        return;
      }

      this.isSaving.set(true);

      const listeMatchings = results.map(r => ({
        id: '',
        offre: offre.offre.id,
        enseignant: r.enseignant.id,
        score: r.score
      }));

      const formData = new FormData();
      formData.append('matchings', JSON.stringify(listeMatchings));

      this.iaService.saveMatchingResult(formData).subscribe({
        next: (data: ResponseServer) => {
          this.isInternError.set(false);
          if(data.status) {
            this.isSaving.set(false);
            this.matchingSaveState.set('success');
          } else { 
            this.isSaving.set(false);
            this.matchingSaveState.set('error');
          }
        },
        error: (err) => {
          console.error('Erreur sauvegarde matching :', err);
          this.isInternError.set(true);
          this.isSaving.set(false);
          this.matchingSaveState.set('error');
        }
      });
    }
}