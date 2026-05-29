import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Offre } from '../../../../Core/Model/Repetition/Offre';
import { Candidature } from '../../../../Core/Model/Repetition/Candidature';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';
import { MatchingDB } from '../../../../Core/Model/IA/MatchingDB';

type Section = 'dashboard' | 'offres' | 'candidatures';

@Component({
  selector: 'app-layout-portail',
  imports: [CommonModule, DatePipe, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout-portail.html',
  styleUrl: './layout-portail.css',
})
export class LayoutPortail implements OnInit {

  // ── Identité ──────────────────────────────────────────────────────────────
  idParent = signal<number>(0);

  // ── Navigation ────────────────────────────────────────────────────────────
  activeSection = signal<Section>('dashboard');
  sidebarOpen   = signal<boolean>(false);
  sidebarCollapsed = signal<boolean>(false);

  // ── Offres ────────────────────────────────────────────────────────────────
  listOffres         = signal<Offre[]>([]);
  chargementOffres   = signal<boolean>(false);
  erreurOffres       = signal<string | null>(null);

  // ── Matching (section offres) ─────────────────────────────────────────────
  offreActive        = signal<Offre | null>(null);
  listMatching       = signal<MatchingDB[]>([]);
  chargementMatching = signal<boolean>(false);
  erreurMatching     = signal<string | null>(null);

  // ── Candidatures ─────────────────────────────────────────────────────────
  offreActiveCand        = signal<Offre | null>(null);
  listCandidatures       = signal<Candidature[]>([]);
  candidatureSelected    = signal<Candidature | null>(null);
  chargementCandidatures = signal<boolean>(false);
  erreurCandidatures     = signal<string | null>(null);
  totalCandidatures      = signal<number>(0);

  // ── Couleurs cycliques ────────────────────────────────────────────────────
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

  // ── Sidebar ───────────────────────────────────────────────────────────────
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }

  setSection(section: Section): void {
    this.activeSection.set(section);
    this.closeSidebar();
    // Reset panels when switching
    if (section !== 'offres')        { this.fermerPanel(); }
    if (section !== 'candidatures')  { this.fermerPanelCand(); }
  }

  // ── Badges nav ────────────────────────────────────────────────────────────
  offreBadge():      number { return this.listOffres().length; }
  candidatureBadge(): number { return this.totalCandidatures(); }

  // ── Chargement des offres ─────────────────────────────────────────────────
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

  // ── Section Offres — sélection + matching ────────────────────────────────
  selectOffre(offre: Offre): void {
    if (this.offreActive()?.id === offre.id) return;
    this.offreActive.set(offre);
    this.loadMatching(offre);
  }

  loadMatching(offre: Offre): void {
    this.chargementMatching.set(true);
    this.erreurMatching.set(null);
    this.listMatching.set([]);

    this.iaService.findMatchingResultForOffer(offre.id).subscribe({
      next: (data: MatchingDB[]) => {
        this.listMatching.set([...data].sort((a, b) => b.score - a.score));
        this.chargementMatching.set(false);
      },
      error: () => {
        this.erreurMatching.set('Impossible de charger les matchings.');
        this.chargementMatching.set(false);
      },
    });
  }

  fermerPanel(): void {
    this.offreActive.set(null);
    this.listMatching.set([]);
    this.erreurMatching.set(null);
  }

  // ── Section Candidatures ─────────────────────────────────────────────────
  selectOffreCandidature(offre: Offre): void {
    if (this.offreActiveCand()?.id === offre.id) return;
    this.offreActiveCand.set(offre);
    this.loadCandidatures(offre);
  }

  loadCandidatures(offre: Offre): void {
    this.chargementCandidatures.set(true);
    this.erreurCandidatures.set(null);
    this.listCandidatures.set([]);
    this.candidatureSelected.set(null);

    this.repetitionService.findAllCandidatureByOffre(offre.id).subscribe({
      next: (data: Candidature[]) => {
        this.listCandidatures.set(data);
        this.totalCandidatures.update(t => t + data.length);
        this.chargementCandidatures.set(false);
      },
      error: () => {
        this.erreurCandidatures.set('Impossible de charger les candidatures.');
        this.chargementCandidatures.set(false);
      },
    });
  }

  selectCandidature(c: Candidature): void {
    this.candidatureSelected.set(c);
  }

  fermerPanelCand(): void {
    this.offreActiveCand.set(null);
    this.listCandidatures.set([]);
    this.candidatureSelected.set(null);
    this.erreurCandidatures.set(null);
  }

  // ── Dashboard quick nav ───────────────────────────────────────────────────
  goToOffre(offre: Offre): void {
    this.setSection('offres');
    setTimeout(() => this.selectOffre(offre), 50);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  nouvelleOffre(): void {
    this.router.navigate(['/offre/nouvelle']);
  }

  // ── Helpers template ──────────────────────────────────────────────────────
  initialesDe(nomComplet: string): string {
    return nomComplet
      .split(' ')
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  iconBgFor(index: number): string {
    return this.iconBg[index % this.iconBg.length];
  }

  photoClassFor(index: number): string {
    return `c${(index % 5) + 1}`;
  }

  /** Formate un numéro téléphone camerounais pour WhatsApp (supprime le 0 initial, ajoute 237) */
  formatPhone(tel: string): string {
    if (!tel) return '';
    const cleaned = tel.replace(/\D/g, '');
    if (cleaned.startsWith('237')) return cleaned;
    if (cleaned.startsWith('0')) return '237' + cleaned.slice(1);
    return '237' + cleaned;
  }
}