import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';
import { MatchingDB, MatchingDBDetails } from '../../../../Core/Model/IA/MatchingDB';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { Offre, OffreExposeDetails } from '../../../../Core/Model/Repetition/Offre';

@Component({
  selector: 'app-g-matchings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './g-matchings.html',
  styleUrl: './g-matchings.css',
})
export class GMatchings {

  // ─── Auth ──────────────────────────────────────────────────────────────────
  idEnseignant = signal<number>(0);

  // ─── Loading ───────────────────────────────────────────────────────────────
  isLoading = signal<boolean>(true);

  // ─── Données ───────────────────────────────────────────────────────────────
  listMatching = signal<MatchingDB[]>([]);

  // ─── Filtres ───────────────────────────────────────────────────────────────
  activeFilter = signal<string>('all');

  filterChips = [
    { value: 'all',      label: 'Tous'          },
    { value: 'excellent', label: 'Excellents ≥ 90%' },
    { value: 'bon',       label: 'Bons 70–89%'  },
    { value: 'moyen',     label: 'Moyens < 70%' },
  ];

  filteredMatchings = computed(() => {
    const filter = this.activeFilter();
    const list   = this.listMatching();
    if (filter === 'all')      return list;
    if (filter === 'excellent') return list.filter(m => (m.score ?? 0) >= 90);
    if (filter === 'bon')       return list.filter(m => (m.score ?? 0) >= 70 && (m.score ?? 0) < 90);
    if (filter === 'moyen')     return list.filter(m => (m.score ?? 0) < 70);
    return list;
  });

  // ─── Stats computed ────────────────────────────────────────────────────────
  get scoreMoyen(): number {
    const list = this.listMatching();
    if (!list.length) return 0;
    const total = list.reduce((acc, m) => acc + (m.score ?? 0), 0);
    return Math.round(total / list.length);
  }

  get countExcellents(): number {
    return this.listMatching().filter(m => (m.score ?? 0) >= 90).length;
  }

  // ─── Modals ────────────────────────────────────────────────────────────────
  showDetailModal  = signal<boolean>(false);
  showDeleteModal  = signal<boolean>(false);
  matchingSelected = signal<MatchingDBDetails | null>(null);
  idToDelete       = signal<number | null>(null);

  async openDetailModal(m: MatchingDB): Promise<void> {
    this.constructDetailOffre(m)
    this.showDetailModal.set(true);
  }

  confirmDelete(id: number): void {
    this.idToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    
  }

  // ─── Service calls ─────────────────────────────────────────────────────────
  constructor(private iaService: AssistantService, private repetitionService : RepetitionService) {
    this.idEnseignant.set(parseInt(localStorage.getItem('id')!) || 0);
    this.getAllMatchings();
  }

  getAllMatchings(): void {
    this.isLoading.set(true);
    this.iaService.findAllMatchingSavedByEnseignant(this.idEnseignant()).subscribe({
      next: (data: MatchingDB[]) => {
        this.listMatching.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Erreur fetch all matching by enseignant');
        this.isLoading.set(false);
      },
    });
  }


  async constructDetailOffre(m:MatchingDB){
    let matieresData = await this.repetitionService.findAllMatiereOffre(m.offre.id).toPromise(); 

    const ma : MatchingDBDetails= {
      matching:m, 
      matieres: matieresData!
    }

    this.matchingSelected.set(ma); 
    
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  getInitiales(nom: string = ''): string {
    return nom.trim().split(/\s+/).map(n => n[0] ?? '').join('').substring(0, 2).toUpperCase();
  }

  getScoreBadge(score: number = 0): string {
    if (score >= 90) return 'badge-green';
    if (score >= 70) return 'badge-blue';
    if (score >= 50) return 'badge-yellow';
    return 'badge-red';
  }

  getScoreLabel(score: number = 0): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Bon';
    if (score >= 50) return 'Moyen';
    return 'Faible';
  }

  /** Traduit un score en largeur CSS pour la barre de progression */
  getScoreBarWidth(score: number = 0): string {
    return `${Math.min(100, Math.max(0, score))}%`;
  }

  getScoreBarColor(score: number = 0): string {
    if (score >= 90) return '#22C55E';
    if (score >= 70) return '#0A4FFF';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  }
}