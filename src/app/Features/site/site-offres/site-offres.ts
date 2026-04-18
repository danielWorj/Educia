import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe, UpperCasePipe } from '@angular/common';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Offre, OffreDescript } from '../../../Core/Model/Repetition/Offre';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-site-offres',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SlicePipe, UpperCasePipe],
  templateUrl: './site-offres.html',
  styleUrl: './site-offres.css',
})
export class SiteOffres {

  candidatureFb!: FormGroup;

  /** Offre actuellement affichée dans le modal (null = modal fermé) */
  offreSelectionnee: OffreDescript | null = null;

  constructor(private fb: FormBuilder, private repetitionService: RepetitionService) {
    this.candidatureFb = this.fb.group({
      id:          new FormControl(null),
      offre:       new FormControl(null),
      enseignant:  new FormControl(null),
    });

    this.constructOffre();
  }

  // ─── Modal candidature ───────────────────────────────────────────────────

  ouvrirModalCandidature(od: OffreDescript): void {
    this.offreSelectionnee = od;

    // Pré-remplir le formulaire avec les ids liés à l'offre
    this.candidatureFb.patchValue({
      id:         null,              // sera généré côté serveur
      offre:      od.offre.id,
      enseignant: null,              // l'enseignant connecté sera résolu côté serveur / guard
    });
  }

  fermerModalCandidature(): void {
    this.offreSelectionnee = null;
    this.candidatureFb.reset();
  }

  // ─── Soumission ──────────────────────────────────────────────────────────

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
      error: () => {
        console.error('La candidature a échoué');
      }
    });
  }

  // ─── Données ─────────────────────────────────────────────────────────────

  listOffreConstruct = signal<OffreDescript[]>([]);
  private resultats: OffreDescript[] = [];

  async constructOffre(): Promise<void> {
    const listOffre = await this.repetitionService.findAllOffre().toPromise();
    if (!listOffre) return;

    for (const o of listOffre) {
      const matieresO = await this.repetitionService.findAllMatiereOffre(o.id).toPromise();

      const oD: OffreDescript = {
        offre:    o,
        matieres: matieresO ?? [],
      };
      this.resultats.push(oD);
    }

    this.listOffreConstruct.set([...this.resultats]);
  }
}