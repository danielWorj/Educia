import { Component, signal } from '@angular/core';
import { RepetitionService } from '../../../../Core/Service/Repetition/repetition-service';
import { OffreDescript } from '../../../../Core/Model/Repetition/Offre';
import { MatiereOffre } from '../../../../Core/Model/Repetition/MatiereOffre';

@Component({
  selector: 'app-goffre',
  imports: [],
  templateUrl: './goffre.html',
  styleUrl: './goffre.css',
})
export class GOffre {
  constructor(private repetitionService: RepetitionService) {}

  listOffres = signal<OffreDescript[]>([]);
  listOffresSaved = signal<OffreDescript[]>([]);
  listLocalisation = signal<string[]>([]);

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

      this.listOffres.set(resultats);

      this.listOffresSaved.set(resultats);

      // Construire la liste unique des localisations
      const locs = [...new Set(
        resultats.map(r => r.offre.parent.localisation).filter((l): l is string => !!l)
      )];
      this.listLocalisation.set(locs);

      console.log('Offres chargées :', this.listOffres());
    } catch (err) {
      console.error('Erreur chargement offres :', err);
    }
  }

  filtreParNiveau(typeId:number){
    this.listOffres.set(this.listOffresSaved().filter(o => o.offre.id == typeId)); 
  }

 
}
