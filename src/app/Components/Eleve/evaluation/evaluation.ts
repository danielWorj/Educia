import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Composition } from '../../../Core/Model/Evaluation/Composition';
import { Question, QuestionConstruct } from '../../../Core/Model/Evaluation/Question';
import { ReponsePossible } from '../../../Core/Model/Evaluation/ReponsePossible';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Correction } from '../../../Core/Model/Evaluation/Correction';
import { CommonModule } from '@angular/common';
import { TentativeEvaluation } from '../../../Core/Model/Evaluation/Evaluation';
import { Chart , registerables } from 'chart.js';
import { AssistantService } from '../../../Core/Service/IA/Assistant-Service/assistant-service';
Chart.register(...registerables);

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation.html',
  styleUrl: './evaluation.css',
})
export class Evaluation implements OnInit, OnDestroy {
  tentativeCompositionForm!: FormGroup;
  reponseEleveForm!: FormGroup;
  idEleve = signal<number>(0);

  // Variables de gestion d'affichage
  matiereSelectionnee: Matiere | null = null;
  compositionSelectionnee: Composition | null = null;
  compositionEnCours = false;
  afficherResultat = false;

  // Timer
  tempsRestant = '';
  intervalTimer: any;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private repetitionService: RepetitionService, 
    private iaService : AssistantService
  ) {
    this.tentativeCompositionForm = this.fb.group({
      id: new FormControl(),
      startTime: new FormControl(),
      endTime: new FormControl(),
      note: new FormControl(),
      completed: new FormControl(),
      composition: new FormControl(),
    });

    this.reponseEleveForm = this.fb.group({
      id: new FormControl(),
      evaluation: new FormControl(),
      question: new FormControl(),
      reponseChoisie: new FormControl(),
    });

    //this.idEleve.set(5); // Valeur par défaut
    this.idEleve.set(parseInt(sessionStorage.getItem('id')!));

    //console.log(sessionStorage.getItem('id'));
    //console.log(this.idEleve());

  }

  ngOnInit() {
    this.getAllMatiere();
    
  }

  ngOnDestroy() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
  }

  //1- Liste des matiere
  listMatiere = signal<Matiere[]>([]);
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

  //2- Liste des composition par matiere
  listCompositionByMatiere = signal<Composition[]>([]);
  getAllCompoByMatiere(id: number) {
    this.evaluationService.getAllCompositionByMatiere(id).subscribe({
      next: (data: Composition[]) => {
        this.listCompositionByMatiere.set(data);
        console.log('list compo by matiere', this.listCompositionByMatiere());
      },
      error: () => {
        console.log('Fetch list compo by matiere : failed');
      },
    });
  }

  //Apres avoir clique sur une composition
  //Un pop apparait avec un bouton commencer
  idComposition = 0;
  duree = 0; //duree en minute
  selectComposition(c: Composition) {
    
    this.tentativeExist.set(false); 

    this.compositionSelectionnee = c;
    this.idComposition = c.id;
    this.duree = parseInt(c.duree);
    console.log('Composition sélectionnée:', c);

    //this.getTentativeEvaluationByComposition();

    
  }

  //Des qu il clique sur le bouton la composition s affiche et le compteur commence
  //Creation d une tentative de composition
  idEvaluation = 0;
  demarrerComposition() {
    // Créer la tentative
    this.creationTentativeComposition();

    // Charger les questions
    this.findAllconstructQuestionReponsePossibleForComposition(this.idComposition);

    // Passer en mode composition en cours
    this.compositionEnCours = true;

    // Démarrer le chronomètre
    this.demarrerChronometre();
  }

  creationTentativeComposition() {
    this.tentativeCompositionForm.controls['composition'].setValue(
      this.idComposition
    );

    console.log(this.tentativeCompositionForm.value);
    const formData: FormData = new FormData();
    formData.append('evaluation', JSON.stringify(this.tentativeCompositionForm.value));

    this.evaluationService.createTentativeEvaluation(formData).subscribe({
      next: (data: number) => {
        if (data != 0) {
          this.idEvaluation = data;
          console.log("la tentative d evaluation a bien ete faite");
        }
      },
      error: () => {
        console.log('Creation d une tentative de composition : failed');
      },
    });
  }

  // Gestion du chronomètre
  demarrerChronometre() {
    let tempsRestantSecondes = this.duree * 60;

    this.intervalTimer = setInterval(() => {
      if (tempsRestantSecondes <= 0) {
        clearInterval(this.intervalTimer);
        this.terminerComposition();
        return;
      }

      tempsRestantSecondes--;

      const minutes = Math.floor(tempsRestantSecondes / 60);
      const secondes = tempsRestantSecondes % 60;
      this.tempsRestant = `${minutes.toString().padStart(2, '0')}:${secondes
        .toString()
        .padStart(2, '0')}`;
    }, 1000);

    this.calculerHeureFin(this.duree);
  }

  heureFin: any;
  calculerHeureFin(minutes: number) {
    const maintenant = new Date();
    this.heureFin = new Date(maintenant.getTime() + minutes * 60000);
  }

  //Afficher la liste des questions et reponses possible
  //Construction de la liste
  listQuestionReponsePossibleConstruct = signal<QuestionConstruct[]>([]);
  async findAllconstructQuestionReponsePossibleForComposition(id: number) {
    console.log('construct for composition id :', id);

    const tempResults: QuestionConstruct[] = [];

    try {
      let allquestion = await this.evaluationService
        .getAllQuestionByComposition(id)
        .toPromise();

      if (!allquestion || allquestion.length === 0) {
        this.listQuestionReponsePossibleConstruct.set([]);
        return;
      }

      for (const question of allquestion) {
        let reponses = await this.evaluationService
          .getAllReponsePossibleByQuestion(question.id)
          .toPromise();

        const QuestionConstruct: QuestionConstruct = {
          question: question,
          reponsesPossibles: reponses || [],
        };

        tempResults.push(QuestionConstruct);
      }

      this.listQuestionReponsePossibleConstruct.set(tempResults);
      console.log(
        'la liste construite est :',
        this.listQuestionReponsePossibleConstruct()
      );
    } catch (error) {
      console.error('Erreur lors de la construction des questions:', error);
      this.listQuestionReponsePossibleConstruct.set([]);
    }
  }

  //Des qu il coche une case creation d une reponse eleve
  idReponseChoisie = 0;
  idQuestion = 0;
  SelectReponse(r: ReponsePossible) {
    this.idReponseChoisie = r.id;
    this.idQuestion = r.question.id;
  }

  creationReponseEleve() {
    this.reponseEleveForm.controls['evaluation'].setValue(this.idEvaluation);
    this.reponseEleveForm.controls['question'].setValue(this.idQuestion);
    this.reponseEleveForm.controls['reponseChoisie'].setValue(
      this.idReponseChoisie
    );

    console.log(this.reponseEleveForm.value);
    const formData: FormData = new FormData();
    formData.append('reponseeleve', JSON.stringify(this.reponseEleveForm.value));

    this.evaluationService.createReponseEleve(formData).subscribe({
      next: (data: ResponseServer) => {
        if (data.status) {
          console.log('reponse eleve ajoutee pour la question' + this.idQuestion);
        }
      },
      error: () => {
        console.log('Erreur creation reponse eleve : failed');
      },
    });
  }

  // Terminer la composition
  terminerComposition() {
    // Arrêter le chronomètre
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    // Masquer la composition
    this.compositionEnCours = false;

    // Récupérer la note
    this.findNoteFinal();

    // Construire la correction
    this.constructionCorrection();

    // Afficher les résultats
    this.afficherResultat = true;
  }

  //Affichage de la note
  noteFinal = signal<number>(0);

  findNoteFinal() {
    this.evaluationService
      .findNoteFinalForTentativeEvaluation(this.idEvaluation)
      .subscribe({
        next: (data: number) => {
          this.noteFinal.set(data);
          console.log('note final obtenu', data);
        },
        error: () => {
          console.log('Fetch note obtenu : failed');
        },
      });
  }

  //Affichage de la correction
  listCorrection = signal<Correction[]>([]);

  async constructionCorrection() {
    const resulatsTemp: Correction[] = [];

    try {
      let listQuestionByCompo = await this.evaluationService
        .getAllQuestionByComposition(this.idComposition)
        .toPromise();

      if (!listQuestionByCompo || listQuestionByCompo.length === 0) {
        this.listCorrection.set([]);
        return;
      }

      for (const question of listQuestionByCompo) {
        let reponseChoisie = await this.evaluationService
          .findReponseEleveByQuestion(question.id)
          .toPromise();
        let reponseJuste = await this.evaluationService
          .findReponsePossibleIsTrueByQuestion(question.id)
          .toPromise();

        const correctionConstruct: Correction = {
          question: question,
          reponseChoisie: reponseChoisie!,
          reponseCorrecte: reponseJuste!,
        };

        resulatsTemp.push(correctionConstruct);
      }

      this.listCorrection.set(resulatsTemp);
      console.log(
        'la liste des correction construite est :',
        this.listCorrection()
      );
    } catch (error) {
      console.error('Erreur lors de la construction de la correction:', error);
      this.listCorrection.set([]);
    }
  }

  // Retour à la liste des compositions
  retourListeCompositions() {
    this.afficherResultat = false;
    this.compositionEnCours = false;
    this.compositionSelectionnee = null;
    this.matiereSelectionnee = null;
    this.listCompositionByMatiere.set([]);
    this.listQuestionReponsePossibleConstruct.set([]);
    this.listCorrection.set([]);
    this.noteFinal.set(0);
    this.tempsRestant = '';
    this.idEvaluation = 0;
    this.idComposition = 0;
  }


  //Cas ou il exsite deja une tentative d'evaluation pour cet composition
  //1- rechercher une tentative pour cet composition 
  tentativeExist = signal<boolean>(false); 
  
  getTentativeEvaluationByComposition(){
    this.evaluationService.findTentativeEvaluationByComposition(this.idComposition).subscribe({
      next:(data : TentativeEvaluation)=>{
        console.log('tentative devaluation pour cet composition', data); 
        if (data!=null) {
          //que ca existe 
          this.tentativeExist.set(true); 
        }else{
          this.tentativeExist.set(false);
        }
      }, 
      error:()=>{
        console.log('fetch tentative devaluation by composition : failed '); 
      }
    }); 
  }
  //2- demander a l'utilisateur s'il veut continuer
  
 

  //3- S'il dit oui on supprime d'abord la tentative d'evaluation
   nettoyageEvaluation(){
    if(this.tentativeExist()){
       this.evaluationService.nettoyageTentativeEvaluation(this.idComposition).subscribe({
        next:(data : ResponseServer)=>{
          if (data.status) {
            console.log(data.message); 
            this.tentativeExist.set(false); 
             //4- on lance la composition

            this.demarrerComposition(); 
          }
        }, 
        error:()=>{
          console.log('fetch tentative devaluation by composition : failed '); 
        }
      }); 
    }
  }


getChart(){
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    
    // Créer un dégradé pour l'aire
    const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(233, 30, 99, 0.4)');   // Rose intense en haut
    gradient.addColorStop(1, 'rgba(233, 30, 99, 0.0)');   // Transparent en bas

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 3,
          borderColor: '#E91E63',
          backgroundColor: gradient, // Utiliser le dégradé
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#E91E63'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  //Eevolution des compositions par matiere 
  //1- Liste des matiere :OK

  //2- Liste des compositions d'un eleve pour une matiere et la note dans cette matiere 
  listCompositionEleveAndMatiere = signal<TentativeEvaluation[]>([]); 


  getAllCompositionEleveAndMatiere(idMatiere : number){
      this.evaluationService.findTentativeEvaluationByEleveAndMatiere(this.idEleve(), idMatiere).subscribe({
        next:(data : TentativeEvaluation[])=>{
         this.listCompositionEleveAndMatiere.set(data); 
         console.log(this.listCompositionEleveAndMatiere());
        }, 
        error:()=>{
          console.log('fetch tentative devaluation by composition : failed '); 
        }
      }); 
  }
  openDropdown(){

  }
 
  listNote : number[]=[]; 
  listDate : string[]=[]; 
  isEmpty = signal<boolean>(false); 

  async constructDataForGraph(event :any){
    let id = event.target.value; 

    console.log('id matiere ', id); 

    let listNoteTemp =[]; 
    let listDateTemp =[]; 

    let listComposition = await this.evaluationService.findTentativeEvaluationByEleveAndMatiere(this.idEleve(),id).toPromise();

    if (listComposition?.length==0) {
      this.isEmpty.set(true); 
    }else{
       for(const comp of listComposition!){
        listNoteTemp.push(comp!.note);
        listDateTemp.push(comp!.dateCreated); 
      }

      this.listNote = listNoteTemp; 
      this.listDate = listDateTemp; 

      console.log('list des notes ', this.listNote); 
      console.log('list des dates ', this.listDate); 
      this.graphEvolutionEvaluationByMatiere(); 
    }
   
  }

  graphEvolutionEvaluationByMatiere(){
       const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    
    // Créer un dégradé pour l'aire
    const gradient = ctx.getContext('2d')!.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(233, 30, 99, 0.4)');   // Rose intense en haut
    gradient.addColorStop(1, 'rgba(233, 30, 99, 0.0)');   // Transparent en bas

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.listDate,
        datasets: [{
          label: 'note',
          data: this.listNote,
          borderWidth: 3,
          borderColor: '#E91E63',
          backgroundColor: gradient, // Utiliser le dégradé
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#E91E63'
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


 
}
