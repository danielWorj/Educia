// photo-profil-upload.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, Output, EventEmitter, ChangeDetectorRef, signal } from '@angular/core';
import { ToastService } from '../../Service/Toast/toast-service.ts';

@Component({
  selector: 'app-upload',
  imports : [DecimalPipe],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css']
})
export class upload {
  fileUpload: File | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;
  fileName: string = '';
  fileSize: string = '';
  isDragOver: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  statusMessage: string = '';
  
  statusType: 'success' | 'error' | '' = '';

  isViewImage = signal(false);

  @Output() photoUploaded = new EventEmitter<File>();

  constructor(private cdr: ChangeDetectorRef , private toastService: ToastService) {}

  // Gestion du clic sur la zone d'upload
  onUploadAreaClick(): void {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    fileInput?.click();
  }

  // Gestion de la sélection de fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  // Gestion du Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  // Traitement du fichier
  handleFile(file: File): void {
    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.showStatus('Format non accepté. Utilisez JPG, PNG ou JPEG.', 'error');
      return;
    }

    // Validation de la taille (5 MB max)
    const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
    if (file.size > maxSize) {
      this.showStatus('Fichier trop volumineux. Taille maximale: 5 MB.', 'error');
      return;
    }

    // Stocker le fichier
    this.fileUpload = file;
    this.fileName = file.name;
    this.fileSize = this.formatFileSize(file.size);

    // Créer l'aperçu AVANT de simuler l'upload
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result;
      // Simuler l'upload APRÈS avoir affiché la prévisualisation
      this.simulateUpload();
    };
    reader.readAsDataURL(file);
  }

  // Simuler l'upload
  simulateUpload(): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    this.cdr.detectChanges(); // Forcer la détection des changements

    const interval = setInterval(() => {
      this.uploadProgress += Math.random() * 30;
      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.isUploading = false;
          this.showStatus('Photo téléchargée avec succès !', 'success');
          this.photoUploaded.emit(this.fileUpload!);
          this.cdr.detectChanges(); // Forcer la détection des changements
        }, 500);
      }
      this.cdr.detectChanges(); // Forcer la détection des changements
    }, 200);
  }

  // Supprimer la photo
  removePhoto(): void {
    if (confirm('Voulez-vous vraiment supprimer cette photo ?')) {
      this.fileUpload = null;
      this.photoPreviewUrl = null;
      this.fileName = '';
      this.fileSize = '';
      this.uploadProgress = 0;
      this.statusMessage = '';
      this.statusType = '';

      // Réinitialiser l'input
      const fileInput = document.getElementById('photoInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      this.cdr.detectChanges(); // Forcer la détection des changements
    }
  }

  // Changer la photo
  changePhoto(): void {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    fileInput?.click();
  }

  // Afficher un message de statut
  showStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 5000);
  }

  // Formater la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Obtenir le fichier (pour l'utiliser ailleurs)
  getPhoto(): File | null {
    return this.fileUpload;
  }



  showSuccess() {
    this.toastService.success('Opération réussie avec succès ! 🎉');
  }

  showError() {
    this.toastService.error('Une erreur est survenue lors du traitement');
  }

  showWarning() {
    this.toastService.warning('Attention : cette action est irréversible');
  }

  showInfo() {
    this.toastService.info('Nouvelle notification disponible');
  }
}