import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { Candidature, StatutCandidature } from '../../../../Core/Model/Repetition/Candidature';

@Component({
  selector: 'app-g-candidature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './g-candidature.html',
  styleUrl: './g-candidature.css',
})
export class GCandidature {

  // ─── Auth ──────────────────────────────────────────────────────────────────
  idEnseignant = signal<number>(0);

  // ─── Loading ───────────────────────────────────────────────────────────────
  isLoading = signal<boolean>(true);

  // ─── Données ───────────────────────────────────────────────────────────────
  listCandidature = signal<Candidature[]>([]);

  // ─── Filtres ───────────────────────────────────────────────────────────────
  activeFilter = signal<string>('all');

  

  filteredCandidatures = computed(() => {
    const filter = this.activeFilter();
    const list   = this.listCandidature();
    if (filter === 'all') return list;
    return list.filter(c => (c.statut.intitule ?? '').toLowerCase() === filter);
  });

  // ─── Stats computed ────────────────────────────────────────────────────────
  countByStatut(statut: number): number {
    return this.listCandidature().filter(
      c => c.statut.id === statut
    ).length;
  }

  // ─── Modals ────────────────────────────────────────────────────────────────
  showDetailModal  = signal<boolean>(false);
  showDeleteModal  = signal<boolean>(false);
  candidatureSelected = signal<Candidature | null>(null);
  idToDelete          = signal<number | null>(null);

  openDetailModal(c: Candidature): void {
    this.candidatureSelected.set(c);
    this.showDetailModal.set(true);
  }

  confirmDelete(id: number): void {
    this.idToDelete.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const id = this.idToDelete();
    if (id !== null) {
      this.repetitionService.deleteCandidature?.(id).subscribe({
        next: () => this.getAllCandidatures(),
        error: (err: any) => console.error('Erreur suppression candidature :', err),
      });
    }
    this.showDeleteModal.set(false);
    this.idToDelete.set(null);
  }

  // ─── Service calls ─────────────────────────────────────────────────────────
  constructor(private repetitionService: RepetitionService) {
    this.idEnseignant.set(parseInt(localStorage.getItem('id')!) || 0);
    this.getAllCandidatures();
  }

  getAllCandidatures(): void {
    this.isLoading.set(true);
    this.repetitionService.findAllCandidatureByEnseignant(this.idEnseignant()).subscribe({
      next: (data: Candidature[]) => {
        this.listCandidature.set(data);
        this.isLoading.set(false);
        this.getStatutInCandidatures(); 
      },
      error: () => {
        console.error('Erreur fetch list candidature');
        this.isLoading.set(false);
      },
    });
  }

  listStatutCandidature = signal<StatutCandidature[]>([]); 
  getStatutInCandidatures(){
    for( const c of this.listCandidature()){
      if (!this.listStatutCandidature().find(s=>s.id==c.statut.id)) {
        //S'il existe pas 
        this.listStatutCandidature().push(c.statut); 
      }
    }

    console.log('la liste des statut des candidatures est :'+this.listStatutCandidature()); 
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  getInitiales(nom: string = ''): string {
    return nom.trim().split(/\s+/).map(n => n[0] ?? '').join('').substring(0, 2).toUpperCase();
  }

  getStatutBadge(s: number): string {
    //const s = statut.toLowerCase();
    if (s==2) return 'badge-green';
    if (s==3) return 'badge-red';
    return 'badge-yellow';
  }

  getStatutLabel(statut: string = ''): string {
    const s = statut.toLowerCase();
    if (s === 'acceptee') return 'Acceptée';
    if (s === 'refusee')  return 'Refusée';
    return 'En attente';
  }

  
}