import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive, RouterLink } from '@angular/router';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { sign } from 'crypto';
import { Eleve } from '../../../Core/Model/Utilisateur/Eleve/Eleve';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { Composition } from '../../../Core/Model/Evaluation/Composition';
import { Chart, registerables } from 'chart.js';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
Chart.register(...registerables);


@Component({
  selector: 'app-parent-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  idParent = signal<number>(0);
  constructor(private generalService : GeneralService , 
    private utilisateurService : UtilisateurService, 
    private evaluationService : EvaluationService, 
    private repetitionService : RepetitionService ){
    this.idParent.set(parseInt(sessionStorage.getItem('id')!));

    this.loadPage(); 

  }

  //Nombre d'enfants 

  numberEnfant = signal<number>(0); 
  listEnfant = signal<Eleve[]>([]); 

  getListEnfantByParent(){
    this.utilisateurService.findAllEleveByParent(this.idParent()).subscribe({
      next:(data :Eleve[])=>{
        this.listEnfant.set(data); 
        this.numberEnfant.set(this.listEnfant.length); 
      }, 
      error : ()=>{
        console.log('Fetch list enfant : failed'); 
      }
    }); 
  }

  //Construction du dashboard 

  idEleve = signal<number>(0);
  constructDashboard(event:any){
    this.idEleve.set(event.target.value); 

    this.getAllMatiere();
    this.findAllCompoNonAchievedByEleve();

  }



    listMatiere = signal<Matiere[]>([]);
    listNote = signal<number[]>([]);
    listDate = signal<string[]>([]);
    isEmpty = signal<boolean>(true); // Commencer à true
    listCompoNonAchieved = signal<Composition[]>([]);
    
    // Variable pour stocker l'instance du graphique
    private chartInstance: Chart | null = null;

  
    loadPage() {
      this.getListEnfantByParent(); 
   
    }
  
    openDropdown() {}
  
    getAllMatiere() {
      this.repetitionService.findAllMatiereByEleve(this.idEleve()).subscribe({
        next: (data: Matiere[]) => {
          this.listMatiere.set(data);
          console.log('list matiere', this.listMatiere());
        },
        error: () => {
          console.log('Fetch list matiere by eleve : failed');
        },
      });
    }
  
    async constructDataForGraph(event: any) {
      const id = event.target.value;
  
      // Réinitialiser l'état
      this.destroyChart();
      this.listDate.set([]);
      this.listNote.set([]);
      this.isEmpty.set(false);
  
      if (!id || id === '') {
        this.isEmpty.set(true);
        return;
      }
  
      console.log('id matiere ', id);
  
      try {
        const listComposition = await this.evaluationService
          .findTentativeEvaluationByEleveAndMatiere(this.idEleve(), id)
          .toPromise();
  
        console.log('Compositions récupérées:', listComposition);
  
        if (!listComposition || listComposition.length === 0) {
          console.log('Aucune composition trouvée');
          this.isEmpty.set(true);
          this.listDate.set([]);
          this.listNote.set([]);
          return;
        }
  
        // Extraire les données
        const listNoteTemp: number[] = [];
        const listDateTemp: string[] = [];
  
        for (const comp of listComposition) {
          listNoteTemp.push(comp.note);
          listDateTemp.push(comp.dateCreated);
        }
  
        this.listNote.set(listNoteTemp);
        this.listDate.set(listDateTemp);
        this.isEmpty.set(false);
  
        console.log('list des notes ', this.listNote());
        console.log('list des dates ', this.listDate());
  
        // Attendre que le DOM se mette à jour avant de créer le graphique
        setTimeout(() => {
          this.graphEvolutionEvaluationByMatiere();
        }, 50);
  
      } catch (error) {
        console.error('Erreur lors de la récupération des compositions:', error);
        this.isEmpty.set(true);
        this.listDate.set([]);
        this.listNote.set([]);
      }
    }
  
    // Détruire le graphique existant
    private destroyChart(): void {
      if (this.chartInstance) {
        console.log('Destruction du graphique existant');
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    }
  
    graphEvolutionEvaluationByMatiere() {
      const ctx = document.getElementById('myChart') as HTMLCanvasElement;
  
      if (!ctx) {
        console.error('Canvas non trouvé');
        return;
      }
  
      // Vérifier qu'il y a des données
      if (this.listNote().length === 0 || this.listDate().length === 0) {
        console.warn('Pas de données pour créer le graphique');
        return;
      }
  
      // Détruire l'ancien graphique avant d'en créer un nouveau
      this.destroyChart();
  
      // Créer un dégradé pour l'aire
      const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(233, 30, 99, 0.4)');
      gradient.addColorStop(1, 'rgba(233, 30, 99, 0.0)');
  
      // Créer et stocker la nouvelle instance
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.listDate(),
          datasets: [
            {
              label: 'Note',
              data: this.listNote(),
              borderWidth: 3,
              borderColor: '#E91E63',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: '#E91E63',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#E91E63',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 20, // Adapter selon votre système de notation
              ticks: {
                stepSize: 2,
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
              },
              bodyFont: {
                size: 13,
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
        },
      });
  
      console.log('Nouveau graphique créé');
    }
  
    // List des evaluations non composées
    findAllCompoNonAchievedByEleve() {
      this.listCompoNonAchieved.set([]);
      this.evaluationService
        .getAllCompositionNonArchivedByEleve(this.idEleve())
        .subscribe({
          next: (data: Composition[]) => {
            this.listCompoNonAchieved.set(data);
            console.log('list composition by eleve', this.listCompoNonAchieved());
          },
          error: () => {
            console.log('Fetch list composition by eleve : failed');
          },
        });
    }
  
    findAllCompoNonAchievedByMatiere(event: any) {
      const id = event.target.value;
      
      // Réinitialiser immédiatement
      this.listCompoNonAchieved.set([]);
  
      if (!id || id === '') {
        // Si pas de sélection, afficher toutes les compositions
        this.findAllCompoNonAchievedByEleve();
        return;
      }
  
      this.evaluationService
        .getAllCompositionNonArchivedByMatiere(id)
        .subscribe({
          next: (data: Composition[]) => {
            this.listCompoNonAchieved.set(data);
            console.log('list composition by matiere', this.listCompoNonAchieved());
          },
          error: () => {
            console.log('Fetch list composition by matiere : failed');
            this.listCompoNonAchieved.set([]);
          },
        });
    }
  
    // Nettoyer lors de la destruction du composant
    ngOnDestroy() {
      this.destroyChart();
    }


  //Liste des enfants 












//Pour le style 

showSection(sectionId: string, event?: Event): void {
  // Cache toutes les sections
  const sections = document.querySelectorAll('main > div');
  sections.forEach(div => div.classList.add('section-hidden'));
  
  // Affiche la section sélectionnée
  const targetSection = document.getElementById(sectionId + '-section');
  if (targetSection) {
    targetSection.classList.remove('section-hidden');
  }
  
  // Gère la classe active sur les éléments de navigation
  if (event) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    (event.currentTarget as HTMLElement).classList.add('active');
  }
}

toggleSidebar(): void {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
    if (overlay) {
      overlay.classList.toggle('active');
    }
  }
}
}
