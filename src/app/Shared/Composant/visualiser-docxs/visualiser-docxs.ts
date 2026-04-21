import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualiser-docx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualiser-docxs.html',
  styleUrl: './visualiser-docxs.css',
})
export class VisualiserDocxs implements OnChanges {
  @Input() fileUrl: string = '';

  // Office Online Viewer embed URL
  safeUrl: SafeResourceUrl | null = null;
  isLoading = true;
  hasError = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl'] && this.fileUrl) {
      this.isLoading = true;
      this.hasError = false;
      // Utilise Microsoft Office Online pour prévisualiser le docx
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.fileUrl)}`;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(officeUrl);
    }
  }

  onLoad(): void {
    this.isLoading = false;
  }

  onError(): void {
    this.isLoading = false;
    this.hasError = true;
  }
}