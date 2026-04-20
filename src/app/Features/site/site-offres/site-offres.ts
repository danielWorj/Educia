import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe, UpperCasePipe } from '@angular/common';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Offre, OffreDescript } from '../../../Core/Model/Repetition/Offre';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { Section } from '../../../Core/Model/Academie/Section';
import { Niveau } from '../../../Core/Model/Academie/Niveau';
import { MatiereOffre } from '../../../Core/Model/Repetition/MatiereOffre';

@Component({
  selector: 'app-site-offres',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SlicePipe, UpperCasePipe],
  templateUrl: './site-offres.html',
  styleUrl: './site-offres.css',
})
export class SiteOffres {

  candidatureFb!: FormGroup;
  offreSelectionnee: OffreDescript | null = null;

  // ─── États des filtres actifs (tous en signal pour la réactivité) ─────────
  filtreSection      = signal<number | null>(null);
  filtreNiveau       = signal<number | null>(null);
  filtreMatiere      = signal<number | null>(null);
  filtreLocalisation = signal<string | null>(null);
  filtreSearch       = signal<string>('');
  filtreBudgetMax    = signal<number>(50000);
  triActif           = signal<string>('pertinence');

  // ─── Données brutes (source de vérité) ───────────────────────────────────
  private readonly toutesLesOffres = signal<OffreDescript[]>([]);

  // Référentiels
  listMatiere      = signal<Matiere[]>([]);
  listNiveau       = signal<Niveau[]>([]);
  listSection      = signal<Section[]>([]);
  listLocalisation = signal<string[]>([]);

  // ─── Niveaux filtrés par section (computed réactif) ──────────────────────
  niveauxFiltres = computed(() => {
    const section = this.filtreSection();
    if (section === null) return this.listNiveau();
    return this.listNiveau().filter(n => n.section?.id === section);
  });

  // ─── Liste des offres filtrées ET triées (computed réactif) ──────────────
  listOffreConstruct = computed(() => {
    let resultat = this.toutesLesOffres();

    // Filtre section
    const section = this.filtreSection();
    if (section !== null) {
      resultat = resultat.filter(od => od.offre.niveau?.section?.id === section);
    }

    // Filtre niveau
    const niveau = this.filtreNiveau();
    if (niveau !== null) {
      resultat = resultat.filter(od => od.offre.niveau?.id === niveau);
    }

    // Filtre matière — compare bien l'id de la Matiere imbriquée
    const matiere = this.filtreMatiere();
    if (matiere !== null) {
      resultat = resultat.filter(od =>
        od.matieres.some((m: MatiereOffre) => m.matiere?.id === matiere)
      );
    }

    // Filtre localisation
    const loc = this.filtreLocalisation();
    if (loc !== null) {
      resultat = resultat.filter(od => od.offre.parent.localisation === loc);
    }

    // Filtre budget
    const budgetMax = this.filtreBudgetMax();
    resultat = resultat.filter(od => {
      const b = parseFloat(String(od.offre.budget).replace(/\s/g, ''));
      return isNaN(b) || b <= budgetMax;
    });

    // Filtre recherche texte libre
    const q = this.filtreSearch().trim().toLowerCase();
    if (q) {
      resultat = resultat.filter(od =>
        od.offre.parent.nomComplet?.toLowerCase().includes(q) ||
        od.offre.bio?.toLowerCase().includes(q) ||
        od.matieres.some((m: MatiereOffre) => m.matiere?.intitule?.toLowerCase().includes(q))
      );
    }

    // Tri
    const tri = this.triActif();
    const copy = [...resultat];
    if (tri === 'budget_asc') {
      copy.sort((a, b) => parseFloat(String(a.offre.budget)) - parseFloat(String(b.offre.budget)));
    } else if (tri === 'budget_desc') {
      copy.sort((a, b) => parseFloat(String(b.offre.budget)) - parseFloat(String(a.offre.budget)));
    }

    return copy;
  });

  constructor(
    private fb: FormBuilder,
    private repetitionService: RepetitionService,
    private generalService: GeneralService,
  ) {
    this.candidatureFb = this.fb.group({
      id:         new FormControl(null),
      offre:      new FormControl(null),
      enseignant: new FormControl(null),
    });

    this.chargerReferentiels();
    this.constructOffre();
  }

  // ─── Chargement ──────────────────────────────────────────────────────────

  private chargerReferentiels(): void {
    //La liste des matieres et des niveaux est nécessaire pour les filtres et l'affichage, on les charge dès le départ
    this.generalService.findAllMatiere().subscribe({
      next: (data: Matiere[]) => this.listMatiere.set(data),
      error: () => console.error('Erreur chargement matières'),
    });

    // La liste des niveaux contient aussi les sections imbriquées, on peut en déduire la liste des sections à partir de là

    this.generalService.findAllNiveau().subscribe({
      next: (data: Niveau[]) => {
        this.listNiveau.set(data);

        // Dédupliquer les sections à partir des niveaux
        const sectionsMap = new Map<number, Section>();
        data.forEach(n => { if (n.section) sectionsMap.set(n.section.id, n.section); });
        this.listSection.set([...sectionsMap.values()]);
      },
      error: () => console.error('Erreur chargement niveaux'),
    });
  }

  async constructOffre(): Promise<void> {
    try {
      const listOffre = await this.repetitionService.findAllOffre().toPromise();
      if (!listOffre) return;

      const resultats: OffreDescript[] = [];

      for (const o of listOffre) {
        // findAllMatiereOffre retourne MatiereOffre[] (avec .matiere imbriquée)
        const matieresO = await this.repetitionService.findAllMatiereOffre(o.id).toPromise();
        resultats.push({ offre: o, matieres: (matieresO ?? []) as MatiereOffre[] });
      }

      this.toutesLesOffres.set(resultats);

      // Construire la liste unique des localisations
      const locs = [...new Set(
        resultats.map(r => r.offre.parent.localisation).filter((l): l is string => !!l)
      )];
      this.listLocalisation.set(locs);

      console.log('Offres chargées :', this.toutesLesOffres());
    } catch (err) {
      console.error('Erreur chargement offres :', err);
    }
  }

  // ─── Filtres (mettent à jour les signaux → computed se recalcule) ─────────

  filterBySection(id: number | null): void {
    this.filtreSection.set(id);
    // Réinitialiser le niveau si la section change
    this.filtreNiveau.set(null);
  }

  filterByNiveau(id: number | null): void {
    this.filtreNiveau.set(id);
  }

  // CORRECTION : on passe bien l'id de la Matiere (depuis listMatiere)
  filterByMatiere(id: number | null): void {
    this.filtreMatiere.set(id);
  }

  filterByLocalisation(loc: string | null): void {
    this.filtreLocalisation.set(loc);
  }

  filterByBudget(max: number): void {
    this.filtreBudgetMax.set(max);
  }

  filterBySearch(query: string): void {
    this.filtreSearch.set(query);
  }

  trierOffres(critere: string): void {
    this.triActif.set(critere);
  }

  resetFiltres(): void {
    this.filtreSection.set(null);
    this.filtreNiveau.set(null);
    this.filtreMatiere.set(null);
    this.filtreLocalisation.set(null);
    this.filtreSearch.set('');
    this.filtreBudgetMax.set(50000);
    this.triActif.set('pertinence');
  }

  // ─── Modal candidature ────────────────────────────────────────────────────

  ouvrirModalCandidature(od: OffreDescript): void {
    this.offreSelectionnee = od;
    this.candidatureFb.patchValue({
      id:         null,
      offre:      od.offre.id,
      enseignant: null,
    });
  }

  fermerModalCandidature(): void {
    this.offreSelectionnee = null;
    this.candidatureFb.reset();
  }

  candidater(): void {
    if (this.candidatureFb.invalid) return;

    const formData = new FormData();
    formData.append('candidature', JSON.stringify(this.candidatureFb.value));

    this.repetitionService.createOffre(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          alert(data.message);
          this.fermerModalCandidature();
        }
      },
      error: () => console.error('La candidature a échoué'),
    });
  }

  


  
}