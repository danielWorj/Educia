import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-file-viewer',
  imports: [CommonModule],
  templateUrl: './file-viewer.html',
  styleUrl: './file-viewer.css',
})
export class FileViewer {
  @Input() fileUrl: string = '';
  @Input() fileName: string = '';
  
  fileType: 'image' | 'pdf' | 'other' = 'other';
  safePdfUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.detectFileType();
  }

  detectFileType(): void {
    if (!this.fileUrl) return;

    const extension = this.fileUrl.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExtensions = ['pdf'];

    if (imageExtensions.includes(extension || '')) {
      this.fileType = 'image';
    } else if (pdfExtensions.includes(extension || '')) {
      this.fileType = 'pdf';
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
    } else {
      this.fileType = 'other';
    }
  }

  downloadFile(): void {
    const link = document.createElement('a');
    link.href = this.fileUrl;
    link.download = this.fileName || 'download';
    link.click();
  }
}
