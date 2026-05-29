import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { Candidature } from '../../../../Core/Model/Repetition/Candidature';
import { Offre } from '../../../../Core/Model/Repetition/Offre';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-gcandidature',
  imports: [CommonModule, DatePipe],
  templateUrl: './gcandidature.html',
  styleUrl: './gcandidature.css',
})
export class Gcandidature {

  // ── États UI ────────────────────────────────────────────────
  isLoading         = signal<boolean>(false);
  isViewModalOpen   = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  activeFilter      = signal<string>('');          // '' = aucun filtre actif

  constructor(private repetitionService: RepetitionService) {
    this.loadPage();
  }

  loadPage() {
    this.getAllCandidature();
  }

  // ── Listes ──────────────────────────────────────────────────
  listCandidature      = signal<Candidature[]>([]);
  listCandidatureSaved = signal<Candidature[]>([]);
  listOffres           = signal<Offre[]>([]);

  getAllCandidature() {
    this.isLoading.set(true);
    this.repetitionService.findAllCandidature().subscribe({
      next: (data: Candidature[]) => {
        this.listCandidature.set(data);
        this.listCandidatureSaved.set(data);
        this.extractOffres(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur liste candidatures', err);
        this.isLoading.set(false);
      },
    });
  }

  /** Déduplique les offres pour le <select> de filtre */
  private extractOffres(data: Candidature[]) {
    const seen = new Set<number>();
    const offres: Offre[] = [];
    for (const c of data) {
      if (!seen.has(c.offre.id)) {
        seen.add(c.offre.id);
        offres.push(c.offre);
      }
    }
    this.listOffres.set(offres);
  }

  // ── Statistiques ────────────────────────────────────────────
  /**
   * Compte les candidatures dont statut.intitule correspond à la valeur donnée.
   * Utilisé dans le template : {{ countByStatut('ACCEPTEE') }}
   */
  countByStatut(intitule: string): number {
    return this.listCandidatureSaved().filter(
      (c) => c.statut.intitule === intitule
    ).length;
  }

  // ── Candidature sélectionnée ────────────────────────────────
  selectCandidature = signal<Candidature | null>(null);

  viewCandidature(c: Candidature) {
    this.selectCandidature.set(c);
    this.isViewModalOpen.set(true);
  }

  confirmDelete(c: Candidature) {
    this.selectCandidature.set(c);
    this.isDeleteModalOpen.set(true);
  }

  closeModal(modal: 'view' | 'delete') {
    if (modal === 'view')   this.isViewModalOpen.set(false);
    if (modal === 'delete') this.isDeleteModalOpen.set(false);
  }

  // ── CRUD ────────────────────────────────────────────────────
  deleteCandidature(id: number) {
    this.repetitionService.deleteCandidature(id).subscribe({
      next: () => {
        this.closeModal('delete');
        this.selectCandidature.set(null);
        this.getAllCandidature();
      },
      error: (err) => console.error('Erreur suppression candidature', err),
    });
  }

  /**
   * Met à jour le statut d'une candidature.
   * Le service doit accepter l'intitulé du statut et résoudre l'id côté back,
   * ou vous pouvez adapter la signature selon votre API.
   */
  updateStatut(c: Candidature, id: number) {
    this.repetitionService.updateStatutCandidature(c.id, id).subscribe({
      next: (data:ResponseServer) => {
        this.closeModal('view');
        this.getAllCandidature();
      },
      error: (err) => console.error('Erreur mise à jour statut', err),
    });
  }

  // ── Filtres ─────────────────────────────────────────────────
  onFilterByOffre(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.activeFilter.set(val);
    if (!val) {
      this.refreshList();
      return;
    }
    const id = +val;
    this.listCandidature.set(
      this.listCandidatureSaved().filter((c) => c.offre.id === id)
    );
  }

  onSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.activeFilter.set(q);
    this.listCandidature.set(
      this.listCandidatureSaved().filter(
        (c) =>
          c.offre.filiere?.intitule?.toLowerCase().includes(q) ||
          c.offre.niveau?.intitule?.toLowerCase().includes(q)  ||
          c.offre.parent?.nomComplet?.toLowerCase().includes(q)||
          c.statut.intitule.toLowerCase().includes(q)
      )
    );
  }

  refreshList() {
    this.activeFilter.set('');
    this.listCandidature.set(this.listCandidatureSaved());
  }

  // ── Utilitaires ─────────────────────────────────────────────
  getInitiales(nomComplet: string): string {
    return nomComplet
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  }
}