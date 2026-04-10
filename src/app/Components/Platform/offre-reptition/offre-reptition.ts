import { HttpClient } from '@angular/common/http';
import { Component, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OffreRepetition } from '../../Parents/offre-repetition/offre-repetition';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { OffreRepetitionM } from '../../../Core/Model/Repetition/OffreRepetition';
import { AssistantService } from '../../../Core/Service/IA/Assistant-Service/assistant-service';
import { ScoreMatch } from '../../../Core/Model/IA/ScoreMatch';

@Component({
  selector: 'app-offre-reptition-platform',
  imports: [],
  templateUrl: './offre-reptition.html',
  styleUrl: './offre-reptition.css',
})
export class OffreReptitionPlatform implements OnInit {
  offreRepetitionForm !: FormGroup;

  // Signaux pour la gestion de l'affichage
  listOffreRepetition = signal<OffreRepetitionM[]>([]);
  offreRepetitionSelected = signal<OffreRepetitionM | undefined>(undefined);
  showDetail = signal<boolean>(false);
  isLoadingDetails = signal<boolean>(false);
  selectedOffreId: number | null = null;
  isMobile = false;

  constructor(
    private fb: FormBuilder, 
    private repetitionService: RepetitionService,
    private cdr: ChangeDetectorRef
  ) {
    this.offreRepetitionForm = this.fb.group({
      id: new FormControl(),
      bio: new FormControl(),
      salaireMin: new FormControl(),
      salaireMax: new FormControl(),
      parent: new FormControl(),
    });

    this.getAllOffreRepetition();
  }

  ngOnInit(): void {
    this.checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  checkMobile(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 992;
      this.cdr.detectChanges();
    }
  }

  createOffreRepetition() {
    let formData: FormData = new FormData();
    formData.append('offrerepetition', JSON.stringify(this.offreRepetitionForm.value));

    this.repetitionService.createOffreRepetition(formData).subscribe({
      next: (response: number) => {
        
        if (response!=0) {
          console.log("Offre Repetition created successfully");
          console.log('list des enseignants d un profil', response); 
        }
      },
      error: (error) => {
        console.error("Error creating Offre Repetition", error);
      }
    });
  }

  getAllOffreRepetition() {
    this.repetitionService.findAllOffreRepetition().subscribe({
      next: (response: OffreRepetitionM[]) => {
        this.listOffreRepetition.set(response);
        console.log('Offres de répétition chargées:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching Offre Repetition", error);
      }
    });
  }

  getAllOffreRepetitionByParentId(parentId: number) {
    this.repetitionService.findOffreRepetitionByParentId(parentId).subscribe({
      next: (response: OffreRepetitionM[]) => {
        this.listOffreRepetition.set(response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching Offre Repetition by Parent ID", error);
      }
    });
  }

  showDetails(o: OffreRepetitionM) {
    console.log('=== Clic sur offre de répétition ===');
    console.log('Offre:', o);

    // Mettre à jour l'ID sélectionné
    this.selectedOffreId = o.id;

    // Afficher le panneau de détails immédiatement
    this.showDetail.set(true);
    this.isLoadingDetails.set(true);

    // Mettre à jour l'offre sélectionnée
    this.offreRepetitionSelected.set(o);

    // Forcer la détection de changement
    this.cdr.detectChanges();

    // Simuler un chargement (si vous avez besoin de charger des données supplémentaires)
    // Sinon, désactiver le loading immédiatement
    setTimeout(() => {
      this.isLoadingDetails.set(false);
      this.cdr.detectChanges();

      // Scroll vers les détails sur mobile
      if (this.isMobile) {
        setTimeout(() => {
          document.querySelector('.details-panel')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 300);
  }

  closeDetails() {
    this.showDetail.set(false);
    this.offreRepetitionSelected.set(undefined);
    this.selectedOffreId = null;
    this.cdr.detectChanges();

    if (this.isMobile && typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  getInitial(name: string | null | undefined): string {
    if (!name || name.trim().length === 0) {
      return '?';
    }
    return name.trim().charAt(0).toUpperCase();
  }

 

  
}