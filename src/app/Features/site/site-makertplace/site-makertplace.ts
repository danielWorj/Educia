import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GeneralService } from '../../../Core/Service/General/general-service';
import { MarketPlaceService } from '../../../Core/Service/MarketPlace/market-place-service';
import { TypeRessource } from '../../../Core/Model/MarketPlace/TypeRessource';
import { Support } from '../../../Core/Model/MarketPlace/Support';
import { Matiere } from '../../../Core/Model/Academie/Matiere';
import { DevenirRepetiteur } from "../home/Formulaire/devenir-repetiteur/devenir-repetiteur";
import { VisualiserPdf } from '../../../Shared/Composant/visualiser-pdf/visualiser-pdf';
import { VisualiserImg } from '../../../Shared/Composant/visualiser-img/visualiser-img';
import { VisualiserDocxs } from '../../../Shared/Composant/visualiser-docxs/visualiser-docxs';
import { imageStoreUrl } from '../../../Core/Constant/EndPoints';

@Component({
  selector: 'app-site-makertplace',
  imports: [CommonModule, ReactiveFormsModule, VisualiserPdf, VisualiserDocxs, VisualiserImg, DevenirRepetiteur],
  templateUrl: './site-makertplace.html',
  styleUrl: './site-makertplace.css',
})
export class SiteMakertplace {

  supportFb!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private marketPlaceService: MarketPlaceService,
    private generalService: GeneralService
  ) {
    this.supportFb = this.fb.group({
      id: new FormControl(),
      title: new FormControl(),
      prix: new FormControl(),
      matiere: new FormControl(),
      niveau: new FormControl(),
      filiere: new FormControl(),
      type: new FormControl(),
      enseignant: new FormControl(),
    });
    this.loadPage();
  }

  loadPage() {
    this.imageUrl = imageStoreUrl; 
    console.log('Image URL set to:', this.imageUrl);
    this.getAllSupport();
    this.getAllDataToFilter();
  }

  // ── Données ──────────────────────────────────────────────
  listRessource = signal<TypeRessource[]>([]);
  listMatiere = signal<Matiere[]>([]);
  listSupport = signal<Support[]>([]);
  listSupportSaved = signal<Support[]>([]);
  imageUrl = '';
  isLoading = signal<boolean>(false);

  getAllDataToFilter() {
    this.marketPlaceService.findAllTypeRessource().subscribe({
      next: (data: TypeRessource[]) => this.listRessource.set(data),
      error: (err) => console.log('Erreur type ressources', err)
    });
    this.generalService.findAllMatiere().subscribe({
      next: (data: Matiere[]) => this.listMatiere.set(data),
      error: (err) => console.log('Erreur matières', err)
    });
  }

  getAllSupport() {
    this.isLoading.set(true);
    this.marketPlaceService.findMarketplaceItems().subscribe({
      next: (data: Support[]) => {
        this.listSupport.set(data);
        this.listSupportSaved.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        console.log('Fetch list support : failed');
        this.isLoading.set(false);
      }
    });
  }

  filterByMatiere(id: number) {
    this.listSupport.set(this.listSupportSaved().filter(s => s.matiere.id === id));
  }

  filterByTypeRessource(id: number) {
    this.listSupport.set(this.listSupportSaved().filter(s => s.type.id === id));
  }

  reset() {
    this.listSupport.set(this.listSupportSaved());
  }

  // ── Modal ─────────────────────────────────────────────────
  selectedSupport = signal<Support | null>(null);

  // état du modal
  isModalOpen = signal(false);
  showSuccess = signal(false);
  isProcessing = signal(false);

  // paiement sélectionné : 'card' | 'orange' | 'mtn' | null
  selectedPayment = signal<string | null>(null);

  // étapes input visibles
  showPhoneStep = signal(false);
  showCardStep = signal(false);
  phoneStepLabel = signal('Votre numéro Orange Money');

  // valeurs des champs
  phoneValue = signal('');
  cardNumber = signal('');
  cardExpiry = signal('');
  cardCvv = signal('');

  // bouton confirmer activé ?
  get confirmDisabled(): boolean {
    const p = this.selectedPayment();
    if (!p) return true;
    if (p === 'orange' || p === 'mtn') {
      return this.phoneValue().replace(/\D/g, '').length < 9;
    }
    if (p === 'card') {
      return !(
        this.cardNumber().replace(/\s/g, '').length >= 16 &&
        this.cardExpiry().length === 5 &&
        this.cardCvv().length === 3
      );
    }
    return true;
  }
openPayment(support: Support) {
  console.log('openPayment appelé', support); // ← ajouter
  console.log('isModalOpen avant:', this.isModalOpen()); // ← ajouter
  
  this.selectedSupport.set(support);
  this.selectedPayment.set(null);
  this.showPhoneStep.set(false);
  this.showCardStep.set(false);
  this.showSuccess.set(false);
  this.isProcessing.set(false);
  this.phoneValue.set('');
  this.cardNumber.set('');
  this.cardExpiry.set('');
  this.cardCvv.set('');
  this.isModalOpen.set(true);
  
  console.log('isModalOpen après:', this.isModalOpen()); // ← ajouter
  document.body.style.overflow = 'hidden';
}

  closePaymentModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = '';
  }

  closeOnOverlay(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closePaymentModal();
    }
  }

  selectPayment(type: string) {
    this.selectedPayment.set(type);
    this.showPhoneStep.set(false);
    this.showCardStep.set(false);
    this.phoneValue.set('');
    this.cardNumber.set('');
    this.cardExpiry.set('');
    this.cardCvv.set('');

    if (type === 'orange') {
      this.phoneStepLabel.set('Votre numéro Orange Money');
      this.showPhoneStep.set(true);
    } else if (type === 'mtn') {
      this.phoneStepLabel.set('Votre numéro MTN Mobile Money');
      this.showPhoneStep.set(true);
    } else if (type === 'card') {
      this.showCardStep.set(true);
    }
  }

  // Formatage carte : "1234 5678 9012 3456"
  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
    this.cardNumber.set(formatted);
    input.value = formatted;
  }

  // Formatage expiration : "MM/AA"
  onCardExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    this.cardExpiry.set(v);
    input.value = v;
  }

  onCardCvvInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cardCvv.set(input.value);
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.phoneValue.set(input.value);
  }

  confirmPayment() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.showSuccess.set(true);
    }, 2000);
  }

   isVisualiserOpen = signal(false);
  supportToVisualise = signal<Support | null>(null);
 
  // Retourne l'extension du fichier en minuscules : 'pdf' | 'docx' | 'img' | 'unknown'
  getFileType(file: string): 'pdf' | 'docx' | 'img' | 'unknown' {
    //console.log('getFileType appelé avec:', file); // ← ajouter
    if (!file) return 'unknown';
    const ext = file.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'docx';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'img';
    //console.warn('Type de fichier  reconnu pour visualisation:', ext);
    return 'unknown';

  }
 
  openVisualiser(support: Support): void {
    this.supportToVisualise.set(support);
    this.isVisualiserOpen.set(true);

    console.log('le support à visualiser :', support.file);
    document.body.style.overflow = 'hidden';
  }
 
  closeVisualiser(): void {
    this.isVisualiserOpen.set(false);
    this.supportToVisualise.set(null);
    document.body.style.overflow = '';
  }
 
  closeVisualiserOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeVisualiser();
    }
  }
 
}