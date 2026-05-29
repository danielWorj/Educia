import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { Parent } from '../../../../Core/Model/Utilisateur/Parents';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { AssistantService } from '../../../../Core/Service/IA/Assistant-Service/assistant-service';

@Component({
  selector: 'app-gparent',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gparent.html',
  styleUrl: './gparent.css',
})
export class GParent {

  ParentForm!: FormGroup;

  // ── Signals UI ──────────────────────────────────────────────────────────────
  activeFilter   = signal<'all' | 'parent' | 'etudiant' | 'actif' | 'inactif'>('all');
  showFormModal  = signal<boolean>(false);
  isEditMode     = signal<boolean>(false);
  parentToDelete = signal<Parent | null>(null);
  parentSelected = signal<Parent | null>(null);

  // ── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal<boolean>(true);

  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private utilisateurService: UtilisateurService,
    private iaService : AssistantService, 
  ) {
    this.ParentForm = this.fb.group({
      id:           new FormControl(null),
      nomComplet:   new FormControl(''),
      telephone:    new FormControl(''),
      email:        new FormControl(''),
      password:     new FormControl(''),
      localisation: new FormControl(''),
      profession:   new FormControl(''),
    });

    this.loadPage();
  }

  loadPage(): void { this.getAllParents(); }

  // ── Données ─────────────────────────────────────────────────────────────────
  listParents = signal<Parent[]>([]);

  getAllParents(): void {
    this.isLoading.set(true);
    this.utilisateurService.findAllParent().subscribe({
      next: (response: Parent[]) => {
        this.listParents.set(response);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Erreur chargement parents :', err);
        this.isLoading.set(false);
      },
    });
  }

  filteredParents = computed<Parent[]>(() => {
    const filter  = this.activeFilter();
    const parents = this.listParents();
    switch (filter) {
      case 'actif':   return parents.filter(p => p.status === true);
      case 'inactif': return parents.filter(p => p.status === false);
      default:        return parents;
    }
  });

  setFilter(filter: 'all' | 'parent' | 'etudiant' | 'actif' | 'inactif'): void {
    this.activeFilter.set(filter);
  }

  selectParent(p: Parent): void { this.parentSelected.set(p); }

  // ── Fichiers – Photo ─────────────────────────────────────────────────────────
  modalPhotoFile!: File;
  modalPhotoFileName = signal<string>('');
  modalPhotoPreview  = signal<string>('');
  modalPhotoUploaded = signal<boolean>(false);

  onModalSelectPhoto(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.modalPhotoFile = file;
      this.modalPhotoFileName.set(file.name);
      this.modalPhotoUploaded.set(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        this.modalPhotoPreview.set(ev.target?.result as string);
      };
    }
  }

  // ── Fichiers – CNI ───────────────────────────────────────────────────────────
  modalCniFile!: File;
  modalCniFileName = signal<string>('');
  modalCniUploaded = signal<boolean>(false);

  onModalSelectCNI(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      this.modalCniFile = input.files[0];
      this.modalCniFileName.set(this.modalCniFile.name);
      this.modalCniUploaded.set(true);
    }
  }

  // ── Modals ───────────────────────────────────────────────────────────────────
  openAddModal(): void {
    this.isEditMode.set(false);
    this.ParentForm.reset();
    this.modalPhotoFile = undefined!;
    this.modalPhotoFileName.set(''); this.modalPhotoPreview.set(''); this.modalPhotoUploaded.set(false);
    this.modalCniFile = undefined!;
    this.modalCniFileName.set(''); this.modalCniUploaded.set(false);
    this.showFormModal.set(true);
  }

  openEditModal(parent: Parent): void {
    this.isEditMode.set(true);
    this.ParentForm.patchValue({
      id: parent.id, nomComplet: parent.nomComplet, telephone: parent.telephone,
      email: parent.email, localisation: parent.localisation, profession: parent.profession,
    });
    this.showFormModal.set(true);
  }

  confirmDelete(parent: Parent): void { this.parentToDelete.set(parent); }

  // ── Soumission ───────────────────────────────────────────────────────────────
  submitForm(): void {
    if (this.ParentForm.invalid) return;

    if (this.isEditMode()) {
      const parentDTO = {
        id: this.ParentForm.value.id, nomComplet: this.ParentForm.value.nomComplet,
        telephone: this.ParentForm.value.telephone, email: this.ParentForm.value.email,
        localisation: this.ParentForm.value.localisation, profession: this.ParentForm.value.profession,
      };
      console.log('Update parent :', parentDTO);
      this.showFormModal.set(false);
      this.getAllParents();
      return;
    }

    if (!this.modalPhotoFile) { alert('Veuillez sélectionner une photo de profil.'); return; }
    if (!this.modalCniFile)   { alert('Veuillez téléverser la CNI.'); return; }

    const parentDTO = {
      nomComplet: this.ParentForm.value.nomComplet, telephone: this.ParentForm.value.telephone,
      email: this.ParentForm.value.email, password: this.ParentForm.value.password,
      localisation: this.ParentForm.value.localisation, profession: this.ParentForm.value.profession,
    };

    const formData = new FormData();
    formData.append('parent', JSON.stringify(parentDTO));
    formData.append('photo',  this.modalPhotoFile);
    formData.append('cni',    this.modalCniFile);

    this.utilisateurService.createParent(formData).subscribe({
      next: (response: number) => {
        if (response > 0) { this.showFormModal.set(false); this.ParentForm.reset(); this.getAllParents(); }
        else { alert('Erreur lors de la création du compte.'); }
      },
      error: (err: any) => console.error('Erreur création parent :', err),
    });
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  changeStatus(id: number): void {
    this.utilisateurService.actuverLecompte(id).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) { 
          console.log(response.message); 
          this.getAllParents(); 


        }
      },
      error: (err: any) => console.error('Erreur changement statut :', err),
    });
  }

  lancerLeMatchingOffreDuParent(id:number){
    this.iaService.matchingSilencieuxForOffre(id).subscribe({
      next:(data : ResponseServer)=>{
        console.log('Matching envoye au parent'); 
      }, 
      error:()=>{
        console.log('Echec de lancement du matching : failed'); 
      }
    })
  }
  deleteParent(id: number): void {
    this.utilisateurService.deleteParent(id).subscribe({
      next: (response: ResponseServer) => {
        if (response.status) { console.log(response.message); this.parentToDelete.set(null); this.getAllParents(); }
      },
      error: (err: any) => console.error('Erreur suppression parent :', err),
    });
  }

  // ── Utilitaires UI ───────────────────────────────────────────────────────────
  getInitials(nomComplet: string | undefined): string {
    if (!nomComplet) return '?';
    return nomComplet.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private gradients = [
    'linear-gradient(135deg,#0A4FFF,#22C55E)',
    'linear-gradient(135deg,#A855F7,#FF6B35)',
    'linear-gradient(135deg,#22C55E,#F59E0B)',
    'linear-gradient(135deg,#EF4444,#A855F7)',
    'linear-gradient(135deg,#0A4FFF,#A855F7)',
    'linear-gradient(135deg,#FF6B35,#F59E0B)',
  ];

  getAvatarGradient(parent: Parent): string {
    const index = (parent.id ?? 0) % this.gradients.length;
    return this.gradients[index];
  }
}