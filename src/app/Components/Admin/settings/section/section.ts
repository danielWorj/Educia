import { Component, signal } from '@angular/core';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Section } from '../../../../Core/Model/Academie/Section';

@Component({
  selector: 'app-section',
  imports: [ReactiveFormsModule],
  templateUrl: './section.html',
  styleUrl: './section.css',
})
export class SectionComponent {
  sectionFb!: FormGroup; 

  constructor(private fb:FormBuilder, private generalService:GeneralService){
    this.sectionFb = this.fb.group({
      id : new FormControl(),
      intitule : new FormControl()
    }); 

    this.getAllSection(); 

  }


   //Section
  listSection = signal<Section[]>([]); 
  getAllSection(){
    this.generalService.findAllSections().subscribe({
      next:(data :Section[])=>{
        this.listSection.set(data); 
      }, 
      error : ()=>{
        console.log('fetch list section : failed');
      }
    }); 
  }

  createSection(){
    const formData = new FormData(); 
   
    formData.append("section", JSON.stringify(this.sectionFb.value)); 
    console.log('data section:', this.sectionFb.value); 

    this.generalService.createSection(formData).subscribe({
      next:(data : ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
          this.getAllSection();
        }
      }, 
      error :()=>{
        console.log('creation section : failed'); 
      }
    });
  }

  isEdit = signal<boolean>(false); 

  selectSection(s:Section){
    this.isEdit.set(true)
    this.sectionFb.controls['id'].setValue(s.id); 
    this.sectionFb.controls['intitule'].setValue(s.intitule); 
  }

  deleteSection(id:any){
    this.generalService.deleteSection(id).subscribe({
      next:(data :ResponseServer)=>{
        if (data.status) {
          alert(data.message); 
        }
      }, 
      error : ()=>{
        console.log('fetch list section : failed');
      }
    }); 
  }


}
