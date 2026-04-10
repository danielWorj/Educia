import { Component, signal, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EvaluationService } from '../../../Core/Service/Evaluation/evaluation-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { Composition } from '../../../Core/Model/Evaluation/Composition';
import { Question, QuestionConstruct } from '../../../Core/Model/Evaluation/Question';
import { ReponsePossible } from '../../../Core/Model/Evaluation/ReponsePossible';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { Repetition } from '../repetition/repetition';
import { SessionRepetition } from '../../../Core/Model/Repetition/SessionRepetition';
import { TypeEvaluation } from '../../../Core/Model/Evaluation/TypeEvaluation';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { ToastComponent } from '../../../Composants/Comp/toast/toast';
import { ToastService } from '../../../Composants/Service/Toast/toast-service.ts';
import { Matiere } from '../../../Core/Model/Academie/Matiere';

@Component({
  selector: 'app-evaluation',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './evaluation.html',
  styleUrl: './evaluation.css',
})
export class Evaluation {

  //@ViewChild(ToastComponent) toast!: ToastComponent;


  idEnseignant = signal<number>(0);

  compositionFb! : FormGroup;
  evaluationFb !:FormGroup; 
  questionFb !:FormGroup; 
  reponseEleveFb !:FormGroup; 
  reponsePossibleFb!:FormGroup; 
  

  constructor(private fb : FormBuilder,private repetitionService : RepetitionService,  private evaluationService : EvaluationService 
    , private toastService : ToastService
  ) {
    this.compositionFb = this.fb.group({
      id : new FormControl(''),
      description : new FormControl(''),
      duree : new FormControl(''),
      active : new FormControl(''),
      dateCreation : new FormControl(''),
      archived : new FormControl(''),
      typeEvaluation : new FormControl(''),
      repetition : new FormControl(''),
      matiere : new FormControl(''),
    });

    this.evaluationFb = this.fb.group({
      id : new FormControl(''),
      startTime : new FormControl(''),
      endTime : new FormControl(''),
      note : new FormControl(''),
      completed : new FormControl(''),
      eleve : new FormControl(''),
      composition : new FormControl(''),
    }); 

    this.questionFb = this.fb.group({
      id : new FormControl(''),
      enonce : new FormControl(''),
      composition : new FormControl(''),
      points : new FormControl(''),
    }); 

    this.reponseEleveFb = this.fb.group({
      id : new FormControl(''),
      evaluation : new FormControl(''),
      question : new FormControl(''),
      reponseChoisie : new FormControl(''),
    }); 

    this.reponsePossibleFb = this.fb.group({
      id : new FormControl(''),
      reponse : new FormControl(''),
      correcte : new FormControl(''),
      question : new FormControl(''),
    });

    //this.idEnseignant.set(2); // Valeur par défaut
    this.idEnseignant.set(parseInt(sessionStorage.getItem('id')!));

    console.log('id de l enseignant :'+this.idEnseignant()); 

    this.loadPage();

  }

  loadPage(){
    this.getAllCompositionByEnseignant();
    this.getAllTypeEvaluation();
    this.getAllRepetitionByEnseignant();
    //this.findAllconstructQuestionReponsePossibleForComposition(8)
  }

  listTypeEvaluation = signal<TypeEvaluation[]>([]); 
  getAllTypeEvaluation(){
    this.evaluationService.getAllTypeEvaluation().subscribe({
      next : (data : TypeEvaluation[])=>{
        this.listTypeEvaluation.set(data);
        console.log(data);
      },
      error: ()=>{
        console.log('Erreur fetch type evaluation : failed'); 
      }
    });
  }

  listMatiereByRepetition = signal<Matiere[]>([]);
  getAllMatiereByRepetition(id :number){
    this.repetitionService.findAllMatiereByRepetition(id).subscribe({
      next : (data : Matiere[])=>{
        this.listMatiereByRepetition.set(data);
        //console.log("Matiere by repetition", data);
      },
      error: ()=>{
        console.log('Erreur fetch matiere by repetition : failed'); 
      }
    });
  }
  
  listRepetitionByEnseignant = signal<SessionRepetition[]>([]);

  getAllRepetitionByEnseignant() {
    this.repetitionService.findAllSessionRepetitionByEnseignant(this.idEnseignant()).subscribe({
      next : (data : SessionRepetition[])=>{
        this.listRepetitionByEnseignant.set(data);
        console.log(data);
      },
      error: ()=>{
        console.log('Erreur fetch repetition by enseignant : failed'); 
      }
    });
  }
  //Composition CRUD  
  selectSessionRepetition(event:any){
    let id = event.target.value;
    this.getAllMatiereByRepetition(id);
  }

  listCompositionByEnseignant = signal<Composition[]>([]);
  
  getAllCompositionByEnseignant() {
     this.evaluationService.getAllCompositionByEnseignant(this.idEnseignant()).subscribe({
        next : (data : Composition[])=>{
          
          this.listCompositionByEnseignant.set(data);
          console.log(data);
        }, 
        error: ()=>{
          console.log('Erreur fetch session repetition : failed'); 
        }
      });
  }

  isCreation = signal<boolean>(true);
  compositionSelected !: Composition;

  selectComposition(composition : Composition){
    this.compositionSelected = composition;
    this.isCreation.set(false);
    //this.getAllQuestionByComposition(composition.id);
    this.findAllconstructQuestionReponsePossibleForComposition(composition.id);

    this.idComposition = composition.id;
    this.idCompositionSelected.set(composition.id);

    this.compositionFb.controls['id'].setValue(composition.id); 
    this.compositionFb.controls['description'].setValue(composition.description); 
    this.compositionFb.controls['duree'].setValue(composition.duree); 
    this.compositionFb.controls['active'].setValue(composition.active); 
    this.compositionFb.controls['dateCreation'].setValue(composition.dateCreation); 
    this.compositionFb.controls['archived'].setValue(composition.archived); 
    this.compositionFb.controls['typeEvaluation'].setValue(composition.typeEvaluation.id); 
    this.compositionFb.controls['repetition'].setValue(composition.repetition.id); 
  }


  initCreationComposition(){
    this.isCreation.set(true);
    this.idComposition = 0;
    this.compositionFb.reset();
    this.questionFb.reset();
    this.reponsePossibleFb.reset();
  }

  idCompositionSelected = signal<number>(0);
  idComposition = 0; 
  createComposition(){
    if(this.isCreation()){
      //Creation d'une compoaition
      const formData : FormData = new FormData();

      //this.compositionFb.controls['enseignant'].setValue({id : this.idEnseignant()});

      formData.append("composition", JSON.stringify(this.compositionFb.value));
      console.log("Composition to create :", this.compositionFb.value);
      this.evaluationService.createComposition(formData).subscribe({
        next : (data : number)=>{
          console.log("Composition created successfully", data);
          this.idCompositionSelected.set(data);
          this.idComposition = data;
          this.getAllCompositionByEnseignant(); 
        }, 
        error: ()=>{
          console.log('Erreur creation composition : failed'); 
        }
      });
    }
    if (!this.isCreation()) {
      // Modification d'une composition
      const formData : FormData = new FormData();

      formData.append("composition", JSON.stringify(this.compositionFb.value));
      console.log("Composition to update :", this.compositionFb.value);
      this.evaluationService.updateComposition(formData).subscribe({
        next : (data : ResponseServer)=>{
          if (data.status) {
            console.log("Composition updated successfully", data);
            this.getAllCompositionByEnseignant();
            this.toastService.success('Composition créée avec succès!');
          }
           
        }, 
        error: ()=>{
          console.log('Erreur modification composition : failed'); 
        }
      });
    }
  } 

  deleteComposition(id:number){
    this.evaluationService.deleteComposition(id).subscribe({
      next : (data : any)=>{
        console.log("Composition deleted successfully", data);
        this.getAllCompositionByEnseignant(); 
      }, 
      error: ()=>{
        console.log('Erreur deletion composition : failed'); 
      }
    });
  }


  //Question CRUD 
  listQuestionByComposition = signal<Question[]>([]);
  getAllQuestionByComposition(idComposition:number) {
    this.evaluationService.getAllQuestionByComposition(idComposition).subscribe({
      next : (data : Question[])=>{
        this.listQuestionByComposition.set(data);
        console.log(data);
      },
      error: ()=>{
        console.log('Erreur fetch question by composition : failed'); 
      }
    });
  }

  selectQuestion(question : Question){
    this.idQuestionSelected.set(question.id);
    this.idQuestion = question.id;

    this.questionFb.controls['id'].setValue(question.id); 
    this.questionFb.controls['enonce'].setValue(question.enonce); 
    this.questionFb.controls['composition'].setValue(question.composition.id); 
    this.questionFb.controls['points'].setValue(question.points);
  }

  listQuestionReponsePossibleConstruct = signal<QuestionConstruct[]>([]);
  resultatsQuestionReponse : QuestionConstruct[] = [];

  async findAllconstructQuestionReponsePossibleForComposition(id:number){
    this.listQuestionReponsePossibleConstruct.set([]); 
    console.log('construct for composition id :', id);

    // Stocker temporairement les résultats
    const tempResults: QuestionConstruct[] = [];

    try {
        let allquestion = await this.evaluationService.getAllQuestionByComposition(id).toPromise();

        if (!allquestion || allquestion.length === 0) {
            this.listQuestionReponsePossibleConstruct.set([]);
            return;
        }

        // Construire tous les résultats AVANT de mettre à jour le signal
        for(const question of allquestion){
            let reponses = await this.evaluationService.getAllReponsePossibleByQuestion(question.id).toPromise();

            const QuestionConstruct: QuestionConstruct = {
                question : question, 
                reponsesPossibles : reponses || []
            };
            
            tempResults.push(QuestionConstruct);
        }

        // Mettre à jour le signal UNE SEULE FOIS avec toutes les données
        this.listQuestionReponsePossibleConstruct.set(tempResults);
        console.log('la liste construite est :', this.listQuestionReponsePossibleConstruct());
        
    } catch (error) {
        console.error('Erreur lors de la construction des questions:', error);
        this.listQuestionReponsePossibleConstruct.set([]);
    }
}

  

  idQuestionSelected = signal<number>(0);
  idQuestion = 0;
  createQuestion(){
    const formData : FormData = new FormData();

    this.questionFb.controls['composition'].setValue( this.idCompositionSelected());
    //this.questionFb.controls['composition'].setValue(8); // A modifier plus tard

    console.log("Question to create :", this.questionFb.value);


    formData.append("question", JSON.stringify(this.questionFb.value));
    this.evaluationService.createQuestion(formData).subscribe({
      next : (data : number)=>{
        console.log("Question created successfully", data);
        this.idQuestion = data;
        this.idCompositionSelected.set(data); 
        //this.getAllQuestionByComposition(); 
        this.questionFb.reset();  
        this.findAllconstructQuestionReponsePossibleForComposition(this.idComposition); 
      }, 
      error: ()=>{
        console.log('Erreur creation question : failed'); 
      }
    }); 

  }

  deleteQuestion(id:number){
    this.evaluationService.deleteQuestion(id).subscribe({
      next : (data : any)=>{
        console.log("Question deleted successfully", data);
        //this.getAllQuestionByComposition(); 
      }, 
      error: ()=>{
        console.log('Erreur deletion question : failed'); 
      }
    });
  }


  //ReponsePossible CRUD
  listReponsePossibleByQuestion = signal<ReponsePossible[]>([]);
  getAllReponsePossibleByQuestion(idQuestion:number) {
    this.evaluationService.getAllReponsePossibleByQuestion(idQuestion).subscribe({
      next : (data : ReponsePossible[])=>{
        this.listReponsePossibleByQuestion.set(data);
        console.log(data);

      },
      error: ()=>{
        console.log('Erreur fetch reponse possible by question : failed'); 
      }
    }); 
  }


  selectReponsePossible(reponsePossible : ReponsePossible){

    this.reponsePossibleFb.controls['id'].setValue(reponsePossible.id); 
    this.reponsePossibleFb.controls['reponse'].setValue(reponsePossible.reponse); 
    this.reponsePossibleFb.controls['correcte'].setValue(reponsePossible.correcte); 
    this.reponsePossibleFb.controls['question'].setValue(reponsePossible.question.id); 
  } 

  createReponsePossible(){
    if (this.idQuestion!=0) {
      const formData : FormData = new FormData();
      this.reponsePossibleFb.controls['question'].setValue(this.idQuestion);
      //this.reponsePossibleFb.controls['question'].setValue(5); // A modifier plus tard


      console.log("Reponse possible to create :", this.reponsePossibleFb.value);
      formData.append("reponsepossible", JSON.stringify(this.reponsePossibleFb.value));
      this.evaluationService.createReponsePossible(formData).subscribe({
        next : (data : number)=>{
          console.log("Reponse possible created successfully", data);
          this.reponsePossibleFb.reset();
          //this.findAllconstructQuestionReponsePossibleForComposition(8);

          this.getAllReponsePossibleByQuestion(this.idQuestion); 

          this.findAllconstructQuestionReponsePossibleForComposition(this.idComposition);

        }, 
        error: ()=>{
          console.log('Erreur creation reponse possible : failed'); 
        }
      });
    }else{
      alert('Veillez choisir la question avant de creer une reponse possible !');
    }
  }
  deleteReponsePossible(id:number){
    this.evaluationService.deleteReponsePossible(id).subscribe({
      next : (data : any)=>{
        console.log("Reponse possible deleted successfully", data);
        //this.getAllReponsePossibleByQuestion(); 
      }, 
      error: ()=>{
        console.log('Erreur deletion reponse possible : failed'); 
      }
    }); 
  }

  validateReponse(reponse : ReponsePossible){
    this.selectReponsePossible(reponse);
    this.evaluationService.validateReponsePossible(reponse.id).subscribe({
      next : (data : ResponseServer)=>{
       if(data.status){
         console.log(data.message);
         this.getAllReponsePossibleByQuestion(this.idQuestion); 
         this.findAllconstructQuestionReponsePossibleForComposition(this.idComposition);
       }else{
         console.log(data.message);
       }
      }, 
      error: ()=>{
        console.log('Erreur validation reponse possible : failed'); 
      }
    });

  }
 

  // save() {
  //   this.toast.success('Enregistré!');
  // }


}
