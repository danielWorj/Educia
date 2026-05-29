import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Offre } from '../../../../Core/Model/Repetition/Offre';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';
import { Enseignant } from '../../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { MatchingDB } from '../../../../Core/Model/IA/MatchingDB';
import { AvisIA } from '../../../../Core/Model/IA/AvisIA';

@Component({
  selector: 'app-portail-parent',
  imports: [CommonModule, DecimalPipe, NgClass],
  templateUrl: './portail-parent.html',
  styleUrl: './portail-parent.css',
})
export class PortailParent implements OnInit {

  // ── Identité ──────────────────────────────────────────────────────────────
  idParent = signal<number>(0);

  // ── Offres ────────────────────────────────────────────────────────────────
  listOffres = signal<Offre[]>([]);

  // ── Matching ──────────────────────────────────────────────────────────────
  listMatching = signal<MatchingDB[]>([]);

  // ── Sélections actives ────────────────────────────────────────────────────
  offreActive        = signal<Offre | null>(null);
  enseignantSelected = signal<Enseignant | null>(null);

  // ── États UI ──────────────────────────────────────────────────────────────
  chargementOffres   = signal<boolean>(false);
  chargementMatching = signal<boolean>(false);
  erreurOffres       = signal<string | null>(null);
  erreurMatching     = signal<string | null>(null);

  // ── Avis IA – carte dépliée (par matchingDB.id) ───────────────────────────
  expandedMatch = signal<number | null>(null);

  // ── Couleurs cycliques pour icônes d'offres ───────────────────────────────
  readonly iconBg = [
    'var(--primary-light)',
    'var(--accent-light)',
    'var(--green-light)',
    '#F3E8FF',
    '#FEF9C3',
  ];

  // ─────────────────────────────────────────────────────────────────────────
  constructor(
    private repetitionService: RepetitionService,
    private iaService: AssistantService,
    private router: Router,
  ) {
    this.idParent.set(parseInt(localStorage.getItem('id') ?? '0') || 21);
  }

  ngOnInit(): void {
    this.getAllOffresByParent();
  }

  // ── Récupère toutes les offres du parent ──────────────────────────────────
  getAllOffresByParent(): void {
    this.chargementOffres.set(true);
    this.erreurOffres.set(null);

    this.repetitionService.findAllOffreByParent(this.idParent()).subscribe({
      next: (data: Offre[]) => {
        this.listOffres.set(data);
        this.chargementOffres.set(false);
      },
      error: () => {
        this.erreurOffres.set('Impossible de charger vos offres. Veuillez réessayer.');
        this.chargementOffres.set(false);
      },
    });
  }

  // ── Charge les matchings d'une offre et ouvre le modal ───────────────────
  getAllMatchingByOffre(offre: Offre): void {
    console.log('all matching')
    this.offreActive.set(offre);
    this.chargementMatching.set(true);
    this.erreurMatching.set(null);
    this.expandedMatch.set(null);

    this.iaService.findMatchingResultForOffer(offre.id).subscribe({
      next: (data: MatchingDB[]) => {
        const tries = [...data].sort((a, b) => b.score - a.score);
        this.listMatching.set(tries);
        console.log('result', data);
        this.chargementMatching.set(false);
      },
      error: () => {
        this.erreurMatching.set('Impossible de charger les matchings pour cette offre.');
        this.chargementMatching.set(false);
        this.offreActive.set(null);
      },
    });
  }

  // ── Ferme le modal et remet les états à zéro ─────────────────────────────
  fermerModal(): void {
    this.listMatching.set([]);
    this.offreActive.set(null);
    this.erreurMatching.set(null);
    this.expandedMatch.set(null);
  }

  // ── Navigation vers le formulaire de nouvelle offre ──────────────────────
  nouvelleOffre(): void {
    this.router.navigate(['/offre/nouvelle']);
  }

  // ── Avis IA : toggle d'une carte matching ─────────────────────────────────
  toggleMatch(matchId: number): void {
    this.expandedMatch.set(this.expandedMatch() === matchId ? null : matchId);
  }

  /**
   * Retourne le premier AvisIA d'un MatchingDB, ou null s'il n'en a pas.
   */
  getAvis(match: MatchingDB): AvisIA | null {
    return match.avisIAS?.length > 0 ? match.avisIAS[0] : null;
  }

  // ── Helpers template ──────────────────────────────────────────────────────

  /** Extrait les initiales depuis un nom complet (ex: "Jean Kamga" → "JK") */
  initialesDe(nomComplet: string): string {
    return nomComplet
      .split(' ')
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  /** Couleur de fond cyclique pour l'icône d'une offre */
  iconBgFor(index: number): string {
    return this.iconBg[index % this.iconBg.length];
  }

  /** Classe CSS du gradient pour la photo d'un enseignant */
  photoClassFor(index: number): string {
    return `c${(index % 5) + 1}`;
  }

  /** Nombre total de matchings sur toutes les offres (stat) */
  get totalMatchings(): number {
    return this.listMatching().length;
  }
}