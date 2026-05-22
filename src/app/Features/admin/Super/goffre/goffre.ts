import { Component, signal, computed, inject } from '@angular/core';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { OffreDescript } from '../../../../Core/Model/Repetition/Offre';
import { MatiereOffre } from '../../../../Core/Model/Repetition/MatiereOffre';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { DatePipe } from '@angular/common';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';
import { MatchingResult } from '../../../../Core/Model/IA/MatchingResult';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Console } from 'console';

export type FilterType = 'toutes' | 'urgentes';

@Component({
  selector: 'app-goffre',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './goffre.html',
  styleUrl: './goffre.css',
})
export class GOffre {

  private repetitionService = inject(RepetitionService);
  private iaService         = inject(AssistantService);

  // ─── Données ──────
  listOffres        = signal<OffreDescript[]>([]);
  listOffresSaved   = signal<OffreDescript[]>([]);
  listLocalisation  = signal<string[]>([]);

  // ─── Sélection / modals ───────────────────────────────────────────────────
  offreSelected     = signal<OffreDescript | null>(null);
  offreToDelete     = signal<OffreDescript | null>(null);
  offreForMatching  = signal<OffreDescript | null>(null);

  // ─── Filtres ──────
  activeFilter  = signal<FilterType>('toutes');
  searchQuery   = signal<string>('');

  // ─── UI modals ────
  isViewModalOpen   = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isBotModalOpen    = signal<boolean>(false);
  showAddModal      = signal<boolean>(false);

  // ─── Loading ──────────────────────────────────────────────────────────────
  isLoading = signal<boolean>(true);

  // ─── Matching IA ──
  isMatchingLoading = signal<boolean>(true);
  matchingResults   = signal<MatchingResult[]>([]);
  matchingSaveState = signal<'idle' | 'success' | 'error'>('idle');
  isSaving          = signal<boolean>(false);
  isInternError     = signal<boolean>(false);

  // ─── Stats (computed) ─────────────────────────────────────────────────────
  totalOffres       = computed(() => this.listOffresSaved().length);
  totalCandidatures = computed(() =>
    this.listOffresSaved().reduce((acc, o) => acc + o.candidature, 0)
  );

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
    console.log('Nouvelle offre :', this.addOffreForm.value);
    this.showAddModal.set(false);
    this.addOffreForm.reset();
    this.constructOffre();
  }

  // ─── Chargement ───
  async constructOffre(): Promise<void> {
    this.isLoading.set(true);
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
    } finally {
      this.isLoading.set(false);
    }
  }

  // ─── Filtrage ─────
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
    if (query) {
      result = result.filter(o =>
        o.offre.bio?.toLowerCase().includes(query)                    ||
        o.offre.niveau?.intitule?.toLowerCase().includes(query)       ||
        o.offre.filiere?.intitule?.toLowerCase().includes(query)      ||
        o.offre.parent?.nomComplet?.toLowerCase().includes(query)     ||
        o.offre.parent?.localisation?.toLowerCase().includes(query)   ||
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
      error: (err) => console.error('Erreur suppression offre :', err),
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
      next: (results: MatchingResult[]) => {
        this.matchingResults.set(results);

        console.log(this.matchingResults()); 
        this.isMatchingLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur matching IA :', err);
        this.isMatchingLoading.set(false);
      },
    });
  }

  // ─── WhatsApp ─────────────────────────────────────────────────────────────────
  ouvrirWhatsApp(telephone: string, message?: string): void {
    // Nettoie le numéro : supprime espaces, tirets, parenthèses
    const numero = telephone.replace(/[\s\-\(\)]/g, '');

    // Ajoute l'indicatif Cameroun (+237) si le numéro ne commence pas par '+'
    const numeroFormate = numero.startsWith('+')
      ? numero.replace('+', '')
      : `237${numero}`;

    // Message par défaut si aucun fourni
    const texte = message
      ? encodeURIComponent(message)
      : encodeURIComponent('Bonjour, je vous contacte suite  à la correspondance de votre profil avec une offre d emploi sur notre plateforme de répétiteurs.');

    const url = `https://wa.me/${numeroFormate}?text=${texte}`;
    window.open(url, '_blank');
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

  // ─── Helpers template ─────────────────────────────────────────────────────
  getInitiales(nom: string): string {
    return nom.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-95';
    if (score >= 85) return 'score-88';
    if (score >= 80) return 'score-82';
    if (score >= 75) return 'score-76';
    return 'score-70';
  }

  revenirAuMatching(): void { this.matchingSaveState.set('idle'); }

  sauvegarderMatching(): void {
    const offre   = this.offreForMatching();
    const results = this.matchingResults();
    if (!offre || !results.length) return;

    this.isSaving.set(true);

    const listeMatchings = results.map(r => ({
      id: '', offre: offre.offre.id, enseignant: r.enseignant.id, score: r.score
    }));

    const formData = new FormData();
    formData.append('matchings', JSON.stringify(listeMatchings));

    this.iaService.saveMatchingResult(formData).subscribe({
      next: (data: ResponseServer) => {
        this.isInternError.set(false);
        this.isSaving.set(false);
        this.matchingSaveState.set(data.status ? 'success' : 'error');
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