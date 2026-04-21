import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualiser-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualiser-pdf.html',
  styleUrl: './visualiser-pdf.css',
})
export class VisualiserPdf implements OnChanges {
  @Input() fileUrl: string = '';

  safeUrl: SafeResourceUrl | null = null;
  isLoading = true;
  hasError = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl'] && this.fileUrl) {
      this.isLoading = true;
      this.hasError = false;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
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