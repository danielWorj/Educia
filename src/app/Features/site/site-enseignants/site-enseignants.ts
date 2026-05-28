import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UtilisateurService } from '../../../Core/Service/Utlisateur/utilisateur-service';
import { Enseignant } from '../../../Core/Model/Utilisateur/Enseignant/Enseignant';

@Component({
  selector: 'app-site-enseignants',
  imports: [DatePipe],
  templateUrl: './site-enseignants.html',
  styleUrl: './site-enseignants.css',
})
export class SiteEnseignants implements OnInit {

  constructor(private utilisateurService: UtilisateurService) {}

  listEnseignants  = signal<Enseignant[]>([]);
  isLoading        = signal<boolean>(false);
  modalEnseignant  = signal<Enseignant | null>(null);

  ngOnInit(): void {
    this.getAllEnseignants();
  }

  getAllEnseignants(): void {
    this.isLoading.set(true);
    this.utilisateurService.findAllEnseignants().subscribe({
      next: (data: Enseignant[]) => {
        this.listEnseignants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur fetch enseignants', err);
        this.isLoading.set(false);
      },
    });
  }

  // ── Modal ────────────────────────────────────────────
  openModal(enseignant: Enseignant): void {
    this.modalEnseignant.set(enseignant);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.modalEnseignant.set(null);
    document.body.style.overflow = '';
  }

  // ── WhatsApp ─────────────────────────────────────────
  getWhatsappLink(enseignant: Enseignant): string {
    // Nettoie le numéro : supprime espaces, tirets, parenthèses
    const raw = enseignant.telephone?.replace(/[\s\-()]/g, '') ?? '';
    // Ajoute l'indicatif Cameroun (+237) si le numéro ne commence pas par +
    const numero = raw.startsWith('+') ? raw : `+237${raw}`;
    const message = encodeURIComponent(
      `Bonjour ${enseignant.nomComplet}, j'ai vu votre profil sur Educia et je souhaite prendre des cours avec vous.`
    );
    return `https://wa.me/${numero.replace('+', '')}?text=${message}`;
  }

  // ── Helpers ──────────────────────────────────────────
  getInitiales(nomComplet: string): string {
    return nomComplet
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }
}