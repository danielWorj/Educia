import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe, UpperCasePipe, DecimalPipe } from '@angular/common';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Offre, OffreDescript } from '../../../Core/Model/Repetition/Offre';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { Section } from '../../../Core/Model/Academie/Section';
import { Niveau } from '../../../Core/Model/Academie/Niveau';
import { MatiereOffre } from '../../../Core/Model/Repetition/MatiereOffre';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { AuthService } from '../../../Core/Service/Auth/auth-service';
import { AuthData } from '../../../Core/Model/Auth/AuthData';

@Component({
  selector: 'app-site-offres',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DecimalPipe, SlicePipe, UpperCasePipe],
  templateUrl: './site-offres.html',
  styleUrl: './site-offres.css',
})
export class SiteOffres {

  // ─── Formulaires ──────────────────────────────────────────────────────────
  candidatureFb!: FormGroup;
  loginFb!: FormGroup;

  // ─── UI ───────────────────────────────────────────────────────────────────
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private repetitionService: RepetitionService,
    private authService: AuthService,
    private utilisateurService: UtilisateurService,
    private generalService: GeneralService,
  ) {
    this.candidatureFb = this.fb.group({
      id:         new FormControl(null),
      offre:      new FormControl(null),
      enseignant: new FormControl(null),
    });

    this.loginFb = this.fb.group({
      email:    new FormControl(''),
      password: new FormControl(''),
    });

    this.chargerReferentiels();
    this.constructOffre();
  }

  // ─── Offre sélectionnée ───────────────────────────────────────────────────
  offreSelectionnee: OffreDescript | null = null;

  // ─── États des filtres actifs ─────────────────────────────────────────────
  filtreSection      = signal<number | null>(null);
  filtreNiveau       = signal<number | null>(null);
  filtreMatiere      = signal<number | null>(null);
  filtreLocalisation = signal<string | null>(null);
  filtreSearch       = signal<string>('');
  filtreBudgetMax    = signal<number>(50000);
  triActif           = signal<string>('pertinence');

  // ─── Données brutes ───────────────────────────────────────────────────────
  private readonly toutesLesOffres = signal<OffreDescript[]>([]);

  // Référentiels
  listMatiere      = signal<Matiere[]>([]);
  listNiveau       = signal<Niveau[]>([]);
  listSection      = signal<Section[]>([]);
  listLocalisation = signal<string[]>([]);

  // ─── Niveaux filtrés par section ──────────────────────────────────────────
  niveauxFiltres = computed(() => {
    const section = this.filtreSection();
    if (section === null) return this.listNiveau();
    return this.listNiveau().filter(n => n.section?.id === section);
  });

  // ─── Liste filtrée + triée ────────────────────────────────────────────────
  listOffreConstruct = computed(() => {
    let resultat = this.toutesLesOffres();

    const section = this.filtreSection();
    if (section !== null) {
      resultat = resultat.filter(od => od.offre.niveau?.section?.id === section);
    }

    const niveau = this.filtreNiveau();
    if (niveau !== null) {
      resultat = resultat.filter(od => od.offre.niveau?.id === niveau);
    }

    const matiere = this.filtreMatiere();
    if (matiere !== null) {
      resultat = resultat.filter(od =>
        od.matieres.some((m: MatiereOffre) => m.matiere?.id === matiere)
      );
    }

    const loc = this.filtreLocalisation();
    if (loc !== null) {
      resultat = resultat.filter(od => od.offre.parent.localisation === loc);
    }

    const budgetMax = this.filtreBudgetMax();
    resultat = resultat.filter(od => {
      const b = parseFloat(String(od.offre.budget).replace(/\s/g, ''));
      return isNaN(b) || b <= budgetMax;
    });

    const q = this.filtreSearch().trim().toLowerCase();
    if (q) {
      resultat = resultat.filter(od =>
        od.offre.parent.nomComplet?.toLowerCase().includes(q) ||
        od.offre.bio?.toLowerCase().includes(q) ||
        od.matieres.some((m: MatiereOffre) => m.matiere?.intitule?.toLowerCase().includes(q))
      );
    }

    const tri = this.triActif();
    const copy = [...resultat];
    if (tri === 'budget_asc') {
      copy.sort((a, b) => parseFloat(String(a.offre.budget)) - parseFloat(String(b.offre.budget)));
    } else if (tri === 'budget_desc') {
      copy.sort((a, b) => parseFloat(String(b.offre.budget)) - parseFloat(String(a.offre.budget)));
    }

    return copy;
  });

  // ─── Chargement ───────────────────────────────────────────────────────────

  private chargerReferentiels(): void {
    this.generalService.findAllMatiere().subscribe({
      next: (data: Matiere[]) => this.listMatiere.set(data),
      error: () => console.error('Erreur chargement matières'),
    });

    this.generalService.findAllNiveau().subscribe({
      next: (data: Niveau[]) => {
        this.listNiveau.set(data);
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
        const matieresO = await this.repetitionService.findAllMatiereOffre(o.id).toPromise();
        resultats.push({ offre: o, matieres: (matieresO ?? []) as MatiereOffre[] , candidature: 0 });
      }

      this.toutesLesOffres.set(resultats);

      const locs = [...new Set(
        resultats.map(r => r.offre.parent.localisation).filter((l): l is string => !!l)
      )];
      this.listLocalisation.set(locs);
    } catch (err) {
      console.error('Erreur chargement offres :', err);
    }
  }

  // ─── Filtres ──────────────────────────────────────────────────────────────

  filterBySection(id: number | null): void {
    this.filtreSection.set(id);
    this.filtreNiveau.set(null);
  }

  filterByNiveau(id: number | null): void {
    this.filtreNiveau.set(id);
  }

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
    this._resetModalState();
    this.candidatureFb.patchValue({
      id:         null,
      offre:      od.offre.id,
      enseignant: null,
    });
    document.body.style.overflow = 'hidden';
  }

  fermerModalCandidature(): void {
    this.offreSelectionnee = null;
    this._resetModalState();
    this.candidatureFb.reset();
    this.loginFb.reset();
    document.body.style.overflow = '';
  }

  private _resetModalState(): void {
    this.showUnconnectContent.set(false);
    this.showLoginForm.set(false);
    this.showCreateAccountForm.set(false);
    this.showMessageCandidatureSuccesfully.set(false);
    this.loginError.set('');
    this.loginLoading.set(false);
  }

  // ─── Logique connexion / candidature ──────────────────────────────────────

  idEnseignant               = signal<number>(0);
  showUnconnectContent       = signal<boolean>(false);
  showMessageCandidatureSuccesfully = signal<boolean>(false);
  showCreateAccountForm      = signal<boolean>(false);
  showLoginForm              = signal<boolean>(false);
  loginError                 = signal<string>('');
  loginLoading               = signal<boolean>(false);

  verifierLeStatutdeConnexion(): void {
    const id = parseInt(sessionStorage.getItem('id') ?? '0');
    this.idEnseignant.set(id);

    if (!id || id === 0) {
      // Non connecté → afficher les options
      this.showUnconnectContent.set(true);
    } else {
      // Connecté → candidater directement
      this.candidatureFb.patchValue({ enseignant: id });
      this.showUnconnectContent.set(false);
      this.candidater();
    }
  }

  goToCreateCompte(): void {
    this.showUnconnectContent.set(false);
    this.showLoginForm.set(false);
    this.showCreateAccountForm.set(true);
  }

  goToLogin(): void {
    this.showUnconnectContent.set(false);
    this.showCreateAccountForm.set(false);
    this.showLoginForm.set(true);
    this.loginError.set('');
    this.loginFb.reset();
  }

  /** Retour à l'écran de choix connexion / inscription */
  goBackToUnconnect(): void {
    this.showLoginForm.set(false);
    this.showCreateAccountForm.set(false);
    this.loginError.set('');
    this.showUnconnectContent.set(true);
  }

  login(): void {
    if (this.loginFb.invalid) return;
    this.loginLoading.set(true);
    this.loginError.set('');

    const formData = new FormData();
    formData.append('auth', JSON.stringify(this.loginFb.value));

    this.authService.login(formData).subscribe({
      next: (data: AuthData) => {
        this.loginLoading.set(false);
        if (data && data.id) {
          sessionStorage.setItem('id', data.id.toString());
          sessionStorage.setItem('role', data.role.toString());
          this.showLoginForm.set(false);
          this.verifierLeStatutdeConnexion();
        } else {
          this.loginError.set('Identifiants incorrects. Veuillez réessayer.');
        }
      },
      error: () => {
        this.loginLoading.set(false);
        this.loginError.set('Connexion échouée. Vérifiez vos identifiants.');
      },
    });
  }

  candidater(): void {
    if (this.candidatureFb.invalid) return;

    const formData = new FormData();
    formData.append('candidature', JSON.stringify(this.candidatureFb.value));

    this.repetitionService.createCandidature(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          this.showMessageCandidatureSuccesfully.set(true);
        } else {
          console.error('Erreur serveur :', data.message);
        }
      },
      error: () => console.error('La candidature a échoué'),
    });
  }

  createCompte(): void {
    // À implémenter — formulaire à construire plus tard
    const formData = new FormData();
    // TODO
  }
}