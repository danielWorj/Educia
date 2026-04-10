import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { OffreRepetitionM, OffreRepetitionMConstruct } from '../../../Core/Model/Repetition/OffreRepetition'
import { Eleve } from '../../../Core/Model/Utilisateur/Eleve/Eleve';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { MatiereRepetition } from '../../../Core/Model/Repetition/MatiereRepetition';
import { MatiereOffre} from '../../../Core/Model/Repetition/MatiereOffre';
import { ScoreMatch } from '../../../Core/Model/IA/ScoreMatch';
import { AssistantService } from '../../../Core/Service/IA/Assistant-Service/assistant-service';
import { sign } from 'crypto';
import { MatchingResult } from '../../../Core/Model/IA/MatchingResult';

@Component({
  selector: 'app-offre-repetition',
  imports: [ReactiveFormsModule],
  templateUrl: './offre-repetition.html',
  styleUrl: './offre-repetition.css',
})
export class OffreRepetition {
  idParent = signal<number>(0); //test id == 3
  offreRepitionForm !: FormGroup; 
  matiereRepetitionForm !: FormGroup; 

  constructor(private fb : FormBuilder,private iaService : AssistantService,  private repetitionService : RepetitionService , private utilisateurService : UtilisateurService , private generalService :GeneralService){
     this.offreRepitionForm = this.fb.group({
      id: new FormControl(),
      intitule: new FormControl(),
      bio: new FormControl(),
      salaireMin: new FormControl(),
      salaireMax: new FormControl(),
      frequence: new FormControl(),
      dateCreation: new FormControl(),
      duree: new FormControl(),
      eleve: new FormControl(),
    });

    this.matiereRepetitionForm = this.fb.group({
      id : new FormControl(),
      offreRepetition : new FormControl(),
      matiere : new FormControl(),
    }); 

    //this.idParent.set(3); 
    this.idParent.set(parseInt(sessionStorage.getItem("id")!));
    console.log("Parent Id : ", this.idParent());
    this.loadPage();
  }

  loadPage(){
    this.constructOffreRepetitionList(); 
    this.getAllEleve(); 
  }
  listOffreRepetitionByParent = signal<OffreRepetitionM[]>([]); 

  findSection(event:any){
    let idEleve = event.target.value;
    let idSection = 0
    for(const e of this.listEnfant()){
      if (e.id == idEleve) {
        idSection = e.filiere.section.id;
      }
    }
    console.log('La section est '+ idSection); 
    this.findMatiereBySection(idSection); 
  }
  listMatiereBySection = signal<Matiere[]>([]); 
  findMatiereBySection(id:number){
      this.generalService.findAllMatiereBySection(id).subscribe({
      next:(data:Matiere[])=>{
        this.listMatiereBySection.set(data); 
        console.log(this.listMatiereBySection());
      }, 
      error:()=>{
        console.log('Erreur fecth matiere : failed'); 
      }
    }); 
  }
 
  
  listMatiereOffre = signal<MatiereOffre[]>([]); 
  findAllMatiereOffre(id:number){
    console.log('id de session :'+id); 
      this.repetitionService.findAllMatiereOffre(id).subscribe({
      next:(data:MatiereOffre[])=>{
        this.listMatiereOffre.set(data); 
        console.log('liste matiere repetition:'); 
        console.log(data); 
      }, 
      error:()=>{
        console.log('Erreur fecth matiere repetition : failed'); 
      }
    }); 
  }

  getAllOffre(){
     this.repetitionService.findOffreRepetitionByParentId(this.idParent()).subscribe({
          next : (data : OffreRepetitionM[])=>{
            this.listOffreRepetitionByParent.set(data); 
          }, 
          error : ()=>{
            console.log('Fecth list eleve : failed'); 
          }
        }); 
      
  }


  listEnfant = signal<Eleve[]>([]); 
  getAllEleve(){
     this.utilisateurService.findAllEleveByParent(this.idParent()).subscribe({
          next : (data : Eleve[])=>{
            this.listEnfant.set(data); 
          }, 
          error : ()=>{
            console.log('Fecth list eleve : failed'); 
          }
        }); 
  }


  idOffreSelected = signal<number>(0); 
  voirOffre(o:OffreRepetitionM){

    this.isMatch.set(false); 
    this.idOffreSelected.set(o.id); 

    this.offreRepitionForm.controls['id'].setValue(o.id);
    this.offreRepitionForm.controls['intitule'].setValue(o.intitule);
    this.offreRepitionForm.controls['bio'].setValue(o.bio);
    this.offreRepitionForm.controls['salaireMin'].setValue(o.salaireMin);
    this.offreRepitionForm.controls['salaireMax'].setValue(o.salaireMax);
    this.offreRepitionForm.controls['dateCreation'].setValue(o.dateCreation);
    this.offreRepitionForm.controls['frequence'].setValue(o.frequence);
    this.offreRepitionForm.controls['duree'].setValue(o.duree);
    this.offreRepitionForm.controls['eleve'].setValue(o.eleve.id);
    
  }

  isCreation = signal<boolean>(false); 
  toggleToCreation(){
    this.isCreation.set(true); 
    this.isMatch.set(false); 
  }

  toggleToEdit(){
    this.isCreation.set(false); 
    this.isMatch.set(false);
  }

   //Nous allons creer le systeme qui permet de cliquer sur une matiere et la liste s'actualise
  
  listMatiereSelected = signal<Matiere[]>([]); 
  listResultat : Matiere[] =[]; 

  addMatiereOnList(event :any){
    let idReceived = event.target.value; 
    //on recoit l'id de la matiere 
    for(const ma of this.listMatiereBySection()){
      //on parcours la liste des matiere 
      if (ma.id==idReceived) {
        this.listResultat.push(ma); 
      }
    }

    this.listMatiereSelected.set(this.listResultat); 

  }
  async createMultipleMatiereForOffre(listMatiereForOffre :Matiere[]){
    for(const mo of listMatiereForOffre){
      this.createMatiereOffre(this.idOffreCreated(), mo.id); 
      console.log('creation matiere for offre termine pour '+ mo.intitule); 
    }

    console.log('toutes les matieres ont ete ajoutee'); 
  }
  createMatiereOffre(idOffre : number , idMatiere : number){
    const formData : FormData = new FormData(); 
    this.matiereRepetitionForm.controls['matiere'].setValue(idMatiere); 
    this.matiereRepetitionForm.controls['offreRepetition'].setValue(idOffre); 
    
    formData.append("matiere", JSON.stringify(this.matiereRepetitionForm .value));

    console.log(this.matiereRepetitionForm.value); 

    this.repetitionService.createMatiereOffre(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data.status) {
          this.matiereRepetitionForm.reset(); 
          console.log("la matiere "+ idMatiere + "a ete ajoute pour l'offre " + idOffre); 
          //this.findAllMatiereOffre(this.idOffreCreated()) ; 
          //alert('Matiere repetition : created'); 
        }

      }, 
      error:()=>{
        console.log('Erreur creation matiere  repetition: failed'); 
      }
    }); 
  }

  idOffreCreated = signal<number>(0); 
  createOffreRepetition() {
  if (this.isCreation()) {
    let formData: FormData = new FormData();
    formData.append('offrerepetition', JSON.stringify(this.offreRepitionForm.value));

    this.repetitionService.createOffreRepetition(formData).subscribe({
      next: (response: number) => {
        if (response != 0) {
          this.idOffreCreated.set(response);
          console.log('L offre de repetition a bien ete cree ')
          // Créer toutes les matières de manière séquentielle ou parallèle
          // const matierePromises = this.listMatiereSelected().map(m => 
          //   new Promise<void>((resolve, reject) => {
          //     this.createMatiereOffre(this.idOffreCreated(), m.id);
          //     // Attendre un court délai pour laisser l'observable se compléter
          //     setTimeout(() => resolve(), 100);
          //   })
          // );

          // Promise.all(matierePromises).then(() => {
          //   alert('Offre Repetition created successfully');
          //   this.loadPage();
          //   this.offreRepitionForm.reset();
          //   this.listMatiereSelected.set([]);
          // });

          this.createMultipleMatiereForOffre(this.listMatiereSelected());
        }
      },
      error: (error) => {
        console.error("Error creating Offre Repetition", error);
      }
    });
  }
  
  if (!this.isCreation()) {
    let formData: FormData = new FormData();
    formData.append('offrerepetition', JSON.stringify(this.offreRepitionForm.value));

    this.repetitionService.updateOffreRepetition(formData).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) {
          alert("Offre Repetition updated successfully");
          this.loadPage();
          this.offreRepitionForm.reset();
          this.isCreation.set(false);
        }
      },
      error: (error) => {
        console.error("Error creating Offre Repetition", error);
      }
    });
  }
}
  deleteOffre(o:OffreRepetitionM){
    // this.repetitionService.updateOffreRepetition(o.id).subscribe({
    //   next:()=>{
    //       this.loadPage(); 
    //     console.log('Delete offre successfully'); 
    //   }, 
    //   error : ()=>{
    //     console.log('Delete offre : failed'); 
    //   }
    // }); 
  }

  listOffresConstruct = signal<OffreRepetitionMConstruct[]>([]); 
  resultatOffreConstruct : OffreRepetitionMConstruct[] = []; 

  async constructOffreRepetitionList(){
    let offres = await this.repetitionService.findOffreRepetitionByParentId(this.idParent()).toPromise(); 

    for(const o of offres!){
      let matieresO = await this.repetitionService.findAllMatiereOffre(o.id).toPromise(); 

      const r : OffreRepetitionMConstruct={
        offre : o , 
        matieres :matieresO || []  
      }

      this.resultatOffreConstruct.push(r); 

    }

    this.listOffresConstruct.set(this.resultatOffreConstruct); 
  }

  listMatchResult = signal<MatchingResult[]>([]); 
  isMatch = signal<Boolean>(false); 
  
  launchMacthingForOffer(o:OffreRepetitionM){

    this.listMatchResult.set([]); 

    this.isMatch.set(true); 

    console.log('id de l offre :' + o.id); 

    this.iaService.matchingForOffre(o.id).subscribe({
      next: (response: MatchingResult[]) => {
        //this.isMatch.set()
        this.listMatchResult.set(response); 
        console.log('list score', this.listMatchResult()); 

      },
      error: (error) => {
        console.error("Error fetching matching Offre ", error);
      }
    });

  }

}
