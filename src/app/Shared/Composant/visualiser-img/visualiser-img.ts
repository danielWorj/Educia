import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualiser-img',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualiser-img.html',
  styleUrl: './visualiser-img.css',
})
export class VisualiserImg implements OnChanges {
  @Input() fileUrl: string = '';

  safeUrl: SafeUrl | null = null;
  isLoading = true;
  hasError = false;
  isZoomed = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl'] && this.fileUrl) {
      this.isLoading = true;
      this.hasError = false;
      this.isZoomed = false;
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.fileUrl);
    }
  }

  onLoad(): void {
    this.isLoading = false;
  }

  onError(): void {
    this.isLoading = false;
    this.hasError = true;
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }
}