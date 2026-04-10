import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RepetitionService } from '../../../Core/Service/Repetition/repetition-service';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { SessionRepetition, SessionRepetitionConstruct } from '../../../Core/Model/Repetition/SessionRepetition';
import { OffreRepetitionM } from '../../../Core/Model/Repetition/OffreRepetition';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { MatiereRepetition } from '../../../Core/Model/Repetition/MatiereRepetition';
import { HoraireRepetition } from '../../../Core/Model/Repetition/HoraireRepetition';

@Component({
  selector: 'app-repetition',
  imports: [ReactiveFormsModule , FormsModule],
  templateUrl: './repetition.html',
  styleUrl: './repetition.css',
})
export class Repetition {
  idEnseignant = signal<number>(0);  
  sessionRepetitionForm!:FormGroup; 
  horaireRepetitionForm!:FormGroup; 
  matiereRepetitionForm!:FormGroup; 
  constructor(private fb : FormBuilder, private repetitionService : RepetitionService , private generalService : GeneralService){
    this.sessionRepetitionForm = this.fb.group({
      id : new FormControl(),
      enseignant : new FormControl(),
      offreRepetition : new FormControl(),
      montant : new FormControl(),
    }); 


    this.horaireRepetitionForm = this.fb.group({
      id :new FormControl(), 
      jour :new FormControl(), 
      timeStart :new FormControl(), 
      timeEnd :new FormControl(), 
      repetition :new FormControl(), 
    }); 


    this.matiereRepetitionForm = this.fb.group({
      id : new FormControl(),
      repetition : new FormControl(),
      matiere : new FormControl(),
    })

    //this.idEnseignant.set(2); //TEST
    this.idEnseignant.set(parseInt(sessionStorage.getItem("id")!)); 

    console.log("Enseignant Id : ", this.idEnseignant());
  
    this.loadPage(); 
  }

  loadPage(){
    this.getAllSessionRepetition(); 
  }

  listSessionRepetition = signal<SessionRepetition[]>([]); 
  
  getAllSessionRepetition(){
    this.listSessionRepetition.set([]); 
    this.repetitionService.findAllSessionRepetitionByEnseignant(this.idEnseignant()).subscribe({
      next : (data : SessionRepetition[])=>{
        
        this.listSessionRepetition.set(data); 

        //console.log('Liste session repetition : ');
        //console.log(this.listSessionRepetition());
        this.createSessionRepetitionConstruct(data);
      }, 
      error: ()=>{
        console.log('Erreur fetch session repetition : failed'); 
      }
    }); 
  }

  isCreation = signal<boolean>(false); 

  openModal(){
    this.codeOffre = ''; 
    this.isWritable.set(false); 
    this.listMatiereBySection.set([]); 
    this.listHoraiteRepetition.set([]); 
  }

  toggleCreation(){
    this.isCreation.set(true); 
  }

  selectSession(s:SessionRepetition){
    
    this.isCreation.set(false); 

    this.sessionRepetitionForm.controls['id'].setValue(s.id); 
    this.sessionRepetitionForm.controls['enseignant'].setValue(s.enseignant); 
    this.sessionRepetitionForm.controls['offreRepetition'].setValue(s.offreRepetition.id); 

  }



  isWritable = signal<boolean>(false); 
  offreIsPresent = signal<boolean>(false); 
  codeOffre = ''; 
  offreRepetition = signal<OffreRepetitionM | undefined >(undefined); 
  findOffreByCode(){
    this.repetitionService.findOffreByCode(this.codeOffre).subscribe({
      next:(data:OffreRepetitionM)=>{
        this.offreRepetition.set(data); 
        this.offreIsPresent.set(true);
        //this.isWritable.set(true); 
        //this.loadModal(data); 
      }, 
      error:()=>{
        console.log('Erreur fecth offre'); 
      }
    }); 
  }

  loadModal(offrerepetition : OffreRepetitionM){
    this.findMatiereBySection(offrerepetition.eleve.niveau.section.id); 
   
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

  idRepetitionCreated = signal<number>(0); 
  idSessionRepetitionCreated = signal<number>(0); 

  createSessionRepetition(){
     const formData : FormData = new FormData(); 

      this.sessionRepetitionForm.controls['offreRepetition'].setValue(this.offreRepetition()?.id); 
      this.sessionRepetitionForm.controls['enseignant'].setValue(this.idEnseignant()); 

      formData.append("repetition", JSON.stringify(this.sessionRepetitionForm.value));

      console.log(this.sessionRepetitionForm.value); 

      this.repetitionService.createSessionRepetition(formData).subscribe({
        next:(data:number)=>{
            //alert("ID de retour:" + data); 
            this.idSessionRepetitionCreated.set(data); 
            this.sessionRepetitionForm.reset(); 
            this.offreIsPresent.set(false); 
            this.isWritable.set(true); 
            //this.findMatiereRepetition(this.idRepetitionCreated()) ; 
            //this.loadModal(this.offreRepetition());
            this.findMatiereBySection(this.offreRepetition()!.eleve.niveau.section.id); 
    
            //alert('Matiere repetition : created'); 
        }, 
        error:()=>{
          console.log('Erreur creation matiere  repetition: failed'); 
        }
      }); 
  }

  sessionRepetitionCreated = signal<SessionRepetition | undefined>(undefined); 

  listMatiereRepetition = signal<MatiereRepetition[]>([]); 
  findMatiereRepetition(id:number){
    console.log('id de session :'+id); 
     this.repetitionService.findAllMatiereRepetition(id).subscribe({
      next:(data:MatiereRepetition[])=>{
        this.listMatiereRepetition.set(data); 
        console.log('liste matiere repetition:'); 
        console.log(data); 
      }, 
      error:()=>{
        console.log('Erreur fecth matiere repetition : failed'); 
      }
    }); 
  }

  listHoraiteRepetition = signal<HoraireRepetition[]>([]); 
  findHoraireRepetition(id:number){
     this.repetitionService.findAllHoraireRepetition(id).subscribe({
      next:(data:HoraireRepetition[])=>{
        this.listHoraiteRepetition.set(data); 
      }, 
      error:()=>{
        console.log('Erreur fecth horaire  repetition: failed'); 
      }
    }); 
  }

  createMatiereRepetition(){
    const formData : FormData = new FormData(); 
    this.matiereRepetitionForm.controls['repetition'].setValue(this.idSessionRepetitionCreated()); 
    formData.append("matiererepetition", JSON.stringify(this.matiereRepetitionForm.value));

    console.log(this.matiereRepetitionForm.value); 

    this.repetitionService.createMatiereRepetition(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data.status) {
          this.matiereRepetitionForm.reset(); 
          this.findMatiereRepetition(this.idSessionRepetitionCreated()) ; 
          //alert('Matiere repetition : created'); 
        }

      }, 
      error:()=>{
        console.log('Erreur creation matiere  repetition: failed'); 
      }
    }); 
  }

  createHoraireRepetition(){
    const formData : FormData = new FormData(); 
    this.horaireRepetitionForm.controls['repetition'].setValue(this.idSessionRepetitionCreated()); 
    formData.append("horairerepetition", JSON.stringify(this.horaireRepetitionForm.value));

    //console.log(this.horaireRepetitionForm.value); 

    this.repetitionService.createHoraireRepetition(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data.status) {
          this.horaireRepetitionForm.reset(); 
          this.findHoraireRepetition(this.idSessionRepetitionCreated()) ; 
          //alert('Horaire repetition : created'); 
        }

      }, 
      error:()=>{
        console.log('Erreur creation matiere  repetition: failed'); 
      }
    }); 
  }

  
  resultatsSessionRepetitinConstruct = signal<SessionRepetitionConstruct[]>([]); 
  resultats : SessionRepetitionConstruct[] = []; 

  async createSessionRepetitionConstruct(listRepetiton : SessionRepetition[]){

    //on construit une offre de repetition pour l'afficher
    for(const s of listRepetiton){
      //console.log('Fetching session repetition construct for session id : '+ s.id);
      let matieresByRepetition = await this.repetitionService.findAllMatiereRepetition(s.id).toPromise(); 

      console.log('la session de repetition est  '+ s.offreRepetition.bio);

      const sessionConstruct : SessionRepetitionConstruct ={
        sessionRepetition : s, 
        matieres: matieresByRepetition! 
      }; 

      this.resultats.push(sessionConstruct); 

    }
    
    console.log('Resultats avant set : ');
    console.log(this.resultats);
    this.resultatsSessionRepetitinConstruct.set(this.resultats);

    console.log(this.resultatsSessionRepetitinConstruct());
  }


  isEditable = signal<boolean>(false);

  toggleToEdit(){
    //this.isEditable.set(true);
    this.isWritable.set(true); 
    
  }

  selectRepetition(s:SessionRepetition){
    this.offreRepetition.set(s.offreRepetition);
    this.isWritable.set(true); 
    this.findMatiereBySection(s.offreRepetition.eleve.niveau.section.id); 
    this.findMatiereRepetition(s.id);
    this.findHoraireRepetition(s.id);  
  }
 


   
}
