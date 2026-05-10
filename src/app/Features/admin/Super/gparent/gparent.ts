import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../../Core/Service/General/general-service';
import { UtilisateurService } from '../../../../Core/Service/Utlisateur/utilisateur-service';
import { Parent } from '../../../../Core/Model/Utilisateur/Parents';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-gparent',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './gparent.html',
  styleUrl: './gparent.css',
})
export class GParent {
  ParentForm!: FormGroup;

  // --- Signals d'état UI ---
  activeFilter = signal<'all' | 'parent' | 'etudiant' | 'actif' | 'inactif'>('all');
  showFormModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  parentToDelete = signal<Parent | null>(null);

  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private utilisateurService: UtilisateurService
  ) {
    this.loadPage();

    this.ParentForm = this.fb.group({
      id: new FormControl(),
      nomComplet: new FormControl(),
      telephone: new FormControl(),
      email: new FormControl(),
      role: new FormControl(),
      password: new FormControl(),
      dateInscription: new FormControl(),
      status: new FormControl(),
      localisation: new FormControl(),
      photo: new FormControl(),
      profession: new FormControl(),
      cni: new FormControl(),
    });
  }

  loadPage() {
    this.getAllParents();
  }

  // --- Données ---
  listParents = signal<Parent[]>([]);

  getAllParents() {
    this.utilisateurService.findAllParent().subscribe(
      (response: Parent[]) => {
        this.listParents.set(response);
      },
      (error) => {
        console.error('Error fetching Parents:', error);
      }
    );
  }

  parentSelected = signal<Parent | null>(null);

  selectParent(p: Parent) {
    this.parentSelected.set(p);
  }

  // --- Signal computed pour filtrage ---
  filteredParents = computed<Parent[]>(() => {
    const filter = this.activeFilter();
    const parents = this.listParents();
    switch (filter) {
      case 'actif':     return parents.filter(p => p.status === true);
      case 'inactif':   return parents.filter(p => p.status === false);
      default:          return parents;
    }
  });

  setFilter(filter: 'all' | 'parent' | 'etudiant' | 'actif' | 'inactif') {
    this.activeFilter.set(filter);
  }

  // getParentsByRole(role: string): Parent[] {
  //  // return this.listParents().filter(p => p.role?.toUpperCase() === role);
  // }

  // --- Modals ---
  openAddModal() {
    this.isEditMode.set(false);
    this.ParentForm.reset();
    this.showFormModal.set(true);
  }

  openEditModal(parent: Parent) {
    this.isEditMode.set(true);
    this.ParentForm.patchValue(parent);
    this.showFormModal.set(true);
  }

  closeDetailModal(event: MouseEvent) {
    this.parentSelected.set(null);
  }

  closeFormModal(event: MouseEvent) {
    this.showFormModal.set(false);
  }

  confirmDelete(parent: Parent) {
    this.parentToDelete.set(parent);
  }

  // --- Actions CRUD ---
  submitForm() {
    if (this.ParentForm.invalid) return;
    if (this.isEditMode()) {
      // TODO: appeler le service de mise à jour
      console.log('Update parent:', this.ParentForm.value);
    } else {
      // TODO: appeler le service de création
      console.log('Create parent:', this.ParentForm.value);
    }
    this.showFormModal.set(false);
    this.getAllParents();
  }

  changeStatus(id: number) {
    this.utilisateurService.changeStatus(id).subscribe(
      (response: ResponseServer) => {
        if (response.status) {
          console.log(response.message);
          this.getAllParents(); // Rafraîchir la liste
        }
      },
      (error) => {
        console.error('Error change status Parents:', error);
      }
    );
  }

  deleteParent(id: number) {
    this.utilisateurService.deleteParent(id).subscribe(
      (response: ResponseServer) => {
        if (response.status) {
          console.log(response.message);
          this.parentToDelete.set(null);
          this.getAllParents(); // Rafraîchir la liste
        }
      },
      (error) => {
        console.error('Error delete Parents:', error);
      }
    );
  }

  // --- Utilitaires UI ---
  getInitials(nomComplet: string | undefined): string {
    if (!nomComplet) return '?';
    return nomComplet
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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