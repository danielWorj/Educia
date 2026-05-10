import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';

@Component({
  selector: 'app-gmatchings',
  imports: [],
  templateUrl: './gmatchings.html',
  styleUrl: './gmatchings.css',
})
export class Gmatchings {
  constructor(private fb : FormBuilder, private iaService : AssistantService){
    
  }
}
