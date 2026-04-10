import { Component, signal } from '@angular/core';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ResponseServer } from '../../../Core/Model/Server/ResponseServer';
import { Section } from '../../../Core/Model/Academie/Section';
import { FileViewer } from "../../../Composants/file-viewer/file-viewer";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-enseignants',
  imports: [ReactiveFormsModule, FileViewer ],
  templateUrl: './enseignants.html',
  styleUrl: './enseignants.css',
})
export class EnseignantsComponent {

  enseignantForm! : FormGroup; 
  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private generalService: GeneralService, private utilisateurService: UtilisateurService) {
    this.loadPage(); 

    this.enseignantForm = this.fb.group({
      id: new FormControl(),
      nomComplet: new FormControl(),
      telephone: new FormControl(),
      email: new FormControl(),
      password: new FormControl(),
      dateInscription: new FormControl(),
      status: new FormControl(),
      localisation: new FormControl(),
      photo: new FormControl(),
      anneeexperience: new FormControl(),
      dateNaissance: new FormControl(),
      bio: new FormControl(),
      tarifHoraire: new FormControl(),
      statusEnseignant: new FormControl(),
      cv: new FormControl(),
      diplomeurl: new FormControl(),
      section: new FormControl(),
      profilEnseignant: new FormControl(),
      diplome: new FormControl(),
      specialite: new FormControl()
    }); 
  }

  loadPage() {
    this.getAllEnseignants();
  }

  listEnseignants = signal<Enseignant[]>([]); 

  getAllEnseignants() {
    this.utilisateurService.findAllEnseignants().subscribe(
      (response: Enseignant[]) => {
        this.listEnseignants.set(response);
      },
      (error) => {
        console.error('Error fetching enseignants:', error);
      }
    );
  }

  lienPhoto = 'assets/images/apply-bg.jpg';
  cheminFile = 'assets/file/';

  enseignantSelected = signal<Enseignant | null>(null);
  nomDiplome = signal('');
  nomCNI = signal(''); 
  nomCV = signal('');
  lienFichier = signal('');
  photoProfil = signal(''); 

  selectEnseignant(enseignant: Enseignant) {
    this.enseignantSelected.set(enseignant);
    this.enseignantForm.patchValue(enseignant);

    this.nomDiplome.set(enseignant.diplomeurl ?? '');
    this.nomCV.set(enseignant.cv ?? '');
    this.nomCNI.set(enseignant.cni ?? ''); 

    //Photo de profil 
    this.photoProfil.set(this.cheminFile+ enseignant.photo); 
    // Diplôme
    this.loadDiplomeFile(this.cheminFile + enseignant.diplomeurl, enseignant.diplomeurl);
    // CV  
    this.loadCvFile(this.cheminFile + enseignant.cv, enseignant.cv);
    // CNI  
    this.loadCniFile(this.cheminFile + enseignant.cni, enseignant.cni);
  }

  changeStatus(id: number) {
    this.utilisateurService.changeStatus(id).subscribe(
      (response: ResponseServer) => {
        console.log(response);
        this.getAllEnseignants(); 
      },
      (error) => {
        console.error('Error change status enseignants:', error);
      }
    );
  }

  // ──────────────────────────────────────────────
  // Utilitaire : détecter le type d'un fichier
  // ──────────────────────────────────────────────
  getFileType(filename: string): 'image' | 'pdf' | 'docx' | 'other' {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    return 'other';
  }

  // ──────────────────────────────────────────────
  // DIPLÔME
  // ──────────────────────────────────────────────
  diplomeUrl: string = '';
  diplomeFileName: string = '';
  safeDiplomeUrl?: SafeResourceUrl;
  diplomeFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadDiplomeFile(url: string, name: string): void {
    this.diplomeUrl = url;
    this.diplomeFileName = name;
    this.diplomeFileType = this.getFileType(name);
    this.safeDiplomeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ──────────────────────────────────────────────
  // CV
  // ──────────────────────────────────────────────
  cvUrl: string = '';
  cvFileName: string = '';
  safeCvUrl?: SafeResourceUrl;
  cvFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadCvFile(url: string, name: string): void {
    this.cvUrl = url;
    this.cvFileName = name;
    this.cvFileType = this.getFileType(name);
    this.safeCvUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ──────────────────────────────────────────────
  // CNI (Carte Nationale d'Identité)
  // ──────────────────────────────────────────────
  cniUrl: string = '';
  cniFileName: string = '';
  safeCniUrl?: SafeResourceUrl;
  cniFileType: 'image' | 'pdf' | 'docx' | 'other' = 'other';

  loadCniFile(url: string, name: string): void {
    this.cniUrl = url;
    this.cniFileName = name;
    this.cniFileType = this.getFileType(name);
    this.safeCniUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ──────────────────────────────────────────────
  // Sections
  // ──────────────────────────────────────────────
  listSection = signal<Section[]>([]);

  getListSection() {
    this.generalService.findAllSections().subscribe(
      (response: Section[]) => {
        this.listSection.set(response);
      },
      (error) => {
        console.error('Error find all sections', error);
      }
    );
  }

  deleteEnseignant(id: number) {
    // TODO: implémenter la suppression
  }
}