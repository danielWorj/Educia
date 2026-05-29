import {
  Component, OnInit, OnDestroy,
  computed, signal, inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Chart, registerables }   from 'chart.js';

import { RepetitionService }  from '../../../../Core/Service/Repetition/repetition-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { MarketPlaceService } from '../../../../Core/Service/MarketPlace/market-place-service';

import { Enseignant }    from '../../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { Candidature }   from '../../../../Core/Model/Repetition/Candidature';
import { OffreDescript } from '../../../../Core/Model/Repetition/Offre';
import { Support }       from '../../../../Core/Model/MarketPlace/Support';

Chart.register(...registerables);

@Component({
  selector: 'app-gdashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './gdashboard.html',
  styleUrl: './gdashboard.css',
})
export class GDashboard implements OnInit, OnDestroy {

  // ── Injection ─────────────────────────────────────────────────────────────
  private repetitionService  = inject(RepetitionService);
  private utilisateurService = inject(UtilisateurService);
  private marketPlaceService = inject(MarketPlaceService);
  private cdr                = inject(ChangeDetectorRef);

  // ── Instances Chart.js ───────────────────────────────────────────────────
  // On utilise document.getElementById() après detectChanges()
  // pour éviter le problème @ViewChild dans @if()
  private chartCandidatures?: Chart;
  private chartEnseignants?:  Chart;
  private chartSupports?:     Chart;
  private chartOffres?:       Chart;

  // ── État ──────────────────────────────────────────────────────────────────
  isLoading        = signal<boolean>(true);
  private pendingLoads = 4;

  // ── Données brutes ────────────────────────────────────────────────────────
  listEnseignants  = signal<Enseignant[]>([]);
  listCandidatures = signal<Candidature[]>([]);
  listOffres       = signal<OffreDescript[]>([]);
  listSupports     = signal<Support[]>([]);

  // ── Computed enseignants ──────────────────────────────────────────────────
  totalEnseignants    = computed(() => this.listEnseignants().length);
  enseignantsActifs   = computed(() =>
    this.listEnseignants().filter(e => e.statusEnseignant?.intitule === 'APPROUVE').length);
  enseignantsAttente  = computed(() =>
    this.listEnseignants().filter(e => e.statusEnseignant?.intitule === 'EN_ATTENTE').length);
  enseignantsSuspendus = computed(() =>
    this.listEnseignants().filter(e => e.statusEnseignant?.intitule === 'SUSPENDU').length);

  // ── Computed candidatures ─────────────────────────────────────────────────
  totalCandidatures     = computed(() => this.listCandidatures().length);
  candidaturesAcceptees = computed(() =>
    this.listCandidatures().filter(c => c.statut?.intitule === 'ACCEPTEE').length);
  candidaturesAttente   = computed(() =>
    this.listCandidatures().filter(c => c.statut?.intitule === 'EN_ATTENTE').length);
  candidaturesRefusees  = computed(() =>
    this.listCandidatures().filter(c => c.statut?.intitule === 'REFUSEE').length);
  tauxAcceptation       = computed(() => {
    const t = this.totalCandidatures();
    return t ? Math.round((this.candidaturesAcceptees() / t) * 100) : 0;
  });

  // ── Computed offres ───────────────────────────────────────────────────────
  totalOffres = computed(() => this.listOffres().length);

  // ── Computed supports ─────────────────────────────────────────────────────
  totalSupports    = computed(() => this.listSupports().length);
  supportsActifs   = computed(() => this.listSupports().filter(s => s.statut).length);
  supportsGratuits = computed(() => this.listSupports().filter(s => s.prix === 0).length);
  supportsPayants  = computed(() => this.listSupports().filter(s => s.prix > 0).length);

  // ── Listes récentes ───────────────────────────────────────────────────────
  recentEnseignants  = computed(() => [...this.listEnseignants()].slice(0, 5));
  recentCandidatures = computed(() => [...this.listCandidatures()].slice(0, 5));
  recentOffres       = computed(() => [...this.listOffres()].slice(0, 5));

  // ── Offres par filière ────────────────────────────────────────────────────
  offresByFiliere = computed(() => {
    const map: Record<string, number> = {};
    for (const item of this.listOffres()) {
      const k = item.offre.filiere?.intitule ?? 'Autre';
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void { this.loadAll(); }

  ngOnDestroy(): void { this.destroyCharts(); }

  // ── Chargement HTTP ───────────────────────────────────────────────────────
  loadAll(): void {
    this.isLoading.set(true);
    this.pendingLoads = 4;
    this.destroyCharts();

    this.utilisateurService.findAllEnseignants().subscribe({
      next: (d: Enseignant[])  => { this.listEnseignants.set(d);  this.checkDone(); },
      error: () => this.checkDone(),
    });
    this.repetitionService.findAllCandidature().subscribe({
      next: (d: Candidature[]) => { this.listCandidatures.set(d); this.checkDone(); },
      error: () => this.checkDone(),
    });
    this.repetitionService.findAllOffre().subscribe({
      next: (d: any[]) => {
        this.listOffres.set(d.map(o => ({ offre: o, matieres: [], candidature: 0 })));
        this.checkDone();
      },
      error: () => this.checkDone(),
    });
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next: (d: Support[]) => { this.listSupports.set(d); this.checkDone(); },
      error: () => this.checkDone(),
    });
  }

  private checkDone(): void {
    this.pendingLoads--;
    if (this.pendingLoads > 0) return;

    // 1. Données prêtes → Angular sort du @if(isLoading)
    this.isLoading.set(false);

    // 2. Force Angular à rendre les canvas dans le DOM
    this.cdr.detectChanges();

    // 3. Un tick pour que le DOM soit vraiment peint
    setTimeout(() => this.buildAllCharts(), 0);
  }

  // ── Charts ────────────────────────────────────────────────────────────────
  private canvas(id: string): HTMLCanvasElement | null {
    return document.getElementById(id) as HTMLCanvasElement | null;
  }

  private destroyCharts(): void {
    this.chartCandidatures?.destroy(); this.chartCandidatures = undefined;
    this.chartEnseignants?.destroy();  this.chartEnseignants  = undefined;
    this.chartSupports?.destroy();     this.chartSupports     = undefined;
    this.chartOffres?.destroy();       this.chartOffres       = undefined;
  }

  private buildAllCharts(): void {
    this.buildChartCandidatures();
    this.buildChartEnseignants();
    this.buildChartSupports();
    this.buildChartOffres();
  }

  /** Doughnut — répartition candidatures */
  private buildChartCandidatures(): void {
    const ctx = this.canvas('canvasCandidatures');
    if (!ctx) return;
    this.chartCandidatures = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Acceptées', 'En attente', 'Refusées'],
        datasets: [{
          data: [
            this.candidaturesAcceptees(),
            this.candidaturesAttente(),
            this.candidaturesRefusees(),
          ],
          backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, family: 'Inter' }, padding: 18, boxWidth: 12, boxHeight: 12 },
          },
          tooltip: {
            callbacks: { label: (ctx) => `  ${ctx.label} : ${ctx.raw}` },
          },
        },
      },
    });
  }

  /** Doughnut — statuts enseignants */
  private buildChartEnseignants(): void {
    const ctx = this.canvas('canvasEnseignants');
    if (!ctx) return;
    this.chartEnseignants = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Approuvés', 'En attente', 'Suspendus'],
        datasets: [{
          data: [
            this.enseignantsActifs(),
            this.enseignantsAttente(),
            this.enseignantsSuspendus(),
          ],
          backgroundColor: ['#0A4FFF', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, family: 'Inter' }, padding: 18, boxWidth: 12, boxHeight: 12 },
          },
          tooltip: {
            callbacks: { label: (ctx) => `  ${ctx.label} : ${ctx.raw}` },
          },
        },
      },
    });
  }

  /** Bar horizontal — supports */
  private buildChartSupports(): void {
    const ctx = this.canvas('canvasSupports');
    if (!ctx) return;
    this.chartSupports = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Actifs', 'Gratuits', 'Payants'],
        datasets: [{
          label: 'Supports',
          data: [this.supportsActifs(), this.supportsGratuits(), this.supportsPayants()],
          backgroundColor: ['#0A4FFF', '#22C55E', '#FF6B35'],
          borderRadius: 8,
          barThickness: 26,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `  ${ctx.raw} support(s)` } },
        },
        scales: {
          x: {
            grid: { color: '#E2E8F0' },
            ticks: { font: { size: 11, family: 'Inter' } },
            beginAtZero: true,
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 12, family: 'Inter' } },
          },
        },
      },
    });
  }

  /** Bar vertical — offres par filière */
  private buildChartOffres(): void {
    const ctx = this.canvas('canvasOffres');
    if (!ctx) return;
    const map    = this.offresByFiliere();
    const labels = Object.keys(map);
    const values = Object.values(map);
    const COLORS = ['#0A4FFF','#22C55E','#FF6B35','#F59E0B','#6366F1','#A855F7','#EF4444','#14B8A6'];
    this.chartOffres = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Offres',
          data: values,
          backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          borderRadius: 8,
          barThickness: 32,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `  ${ctx.raw} offre(s)` } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: 'Inter' } },
          },
          y: {
            grid: { color: '#E2E8F0' },
            ticks: { stepSize: 1, font: { size: 11, family: 'Inter' } },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // ── Helpers template ─────────────────────────────────────────────────────
  getInitiales(nom: string = ''): string {
    return nom.trim().split(/\s+/).map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2);
  }

  getStatutBadgeClass(intitule: string): string {
    const map: Record<string, string> = {
      APPROUVE:   'badge-green',
      EN_ATTENTE: 'badge-yellow',
      SUSPENDU:   'badge-red',
      ACCEPTEE:   'badge-green',
      REFUSEE:    'badge-red',
    };
    return map[intitule] ?? 'badge-gray';
  }

  getStatutLabel(intitule: string): string {
    const map: Record<string, string> = {
      APPROUVE:   'Approuvé',
      EN_ATTENTE: 'En attente',
      SUSPENDU:   'Suspendu',
      ACCEPTEE:   'Acceptée',
      REFUSEE:    'Refusée',
    };
    return map[intitule] ?? intitule;
  }

  readonly avatarGradients = [
    'linear-gradient(135deg,#0A4FFF,#6366F1)',
    'linear-gradient(135deg,#22C55E,#0A4FFF)',
    'linear-gradient(135deg,#FF6B35,#F59E0B)',
    'linear-gradient(135deg,#A855F7,#0A4FFF)',
    'linear-gradient(135deg,#0A4FFF,#22C55E)',
  ];
  avatarGrad(i: number): string {
    return this.avatarGradients[i % this.avatarGradients.length];
  }
}