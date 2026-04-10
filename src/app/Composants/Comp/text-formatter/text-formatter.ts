import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface TextSegment {
  text: string;
  type: 'title' | 'subtitle' | 'paragraph' | 'list-item' | 'separator' | 'quote';
  level?: number;
}

@Component({
  selector: 'app-text-formatter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-formatter.html',
  styleUrls: ['./text-formatter.css']
})
export class TextFormatterComponent implements OnInit, OnChanges {
  @Input() rawText: string = '';
  @Input() highlightKeywords: string[] = [];
  @Input() theme: 'default' | 'academic' | 'modern' = 'default';
  
  segments: TextSegment[] = [];
  formattedHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.processText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rawText'] || changes['highlightKeywords']) {
      this.processText();
    }
  }

  /**
   * Traite le texte brut et le divise en segments
   */
  private processText(): void {
    if (!this.rawText) {
      this.segments = [];
      return;
    }

    const lines = this.rawText.split('\n');
    this.segments = [];

    for (let line of lines) {
      line = line.trim();
      
      if (!line) continue;

      // Détection des différents types de contenu
      if (this.isSeparator(line)) {
        this.segments.push({ text: '', type: 'separator' });
      } else if (this.isTitle(line)) {
        const { text, level } = this.parseTitle(line);
        this.segments.push({ text, type: 'title', level });
      } else if (this.isQuote(line)) {
        this.segments.push({ text: line.replace(/^>\s*/, ''), type: 'quote' });
      } else if (this.isListItem(line)) {
        this.segments.push({ text: line.replace(/^[-*•]\s*/, ''), type: 'list-item' });
      } else {
        this.segments.push({ text: line, type: 'paragraph' });
      }
    }

    this.generateFormattedHtml();
  }

  /**
   * Vérifie si une ligne est un séparateur
   */
  private isSeparator(line: string): boolean {
    return /^[-=_*]{3,}$/.test(line);
  }

  /**
   * Vérifie si une ligne est un titre
   */
  private isTitle(line: string): boolean {
    return /^#{1,6}\s/.test(line) || /^\*\*.*\*\*$/.test(line);
  }

  /**
   * Parse un titre et retourne son texte et son niveau
   */
  private parseTitle(line: string): { text: string; level: number } {
    // Format Markdown (# Titre)
    if (/^#{1,6}\s/.test(line)) {
      const match = line.match(/^(#{1,6})\s(.+)$/);
      if (match) {
        return { text: match[2], level: match[1].length };
      }
    }
    
    // Format gras (**Titre**)
    if (/^\*\*.*\*\*$/.test(line)) {
      return { text: line.replace(/\*\*/g, ''), level: 1 };
    }

    return { text: line, level: 1 };
  }

  /**
   * Vérifie si une ligne est une citation
   */
  private isQuote(line: string): boolean {
    return /^>\s/.test(line);
  }

  /**
   * Vérifie si une ligne est un élément de liste
   */
  private isListItem(line: string): boolean {
    return /^[-*•]\s/.test(line);
  }

  /**
   * Met en évidence les mots-clés
   */
  private highlightText(text: string): string {
    if (!this.highlightKeywords || this.highlightKeywords.length === 0) {
      return text;
    }

    let highlighted = text;
    
    for (const keyword of this.highlightKeywords) {
      const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<span class="keyword-highlight">$1</span>'
      );
    }
    
    return highlighted;
  }

  /**
   * Échappe les caractères spéciaux pour regex
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Génère le HTML formaté
   */
  private generateFormattedHtml(): void {
    let html = '<div class="text-formatter-content">';
    
    for (const segment of this.segments) {
      switch (segment.type) {
        case 'title':
          html += this.createTitleHtml(segment);
          break;
        case 'paragraph':
          html += this.createParagraphHtml(segment);
          break;
        case 'list-item':
          html += this.createListItemHtml(segment);
          break;
        case 'quote':
          html += this.createQuoteHtml(segment);
          break;
        case 'separator':
          html += this.createSeparatorHtml();
          break;
      }
    }
    
    html += '</div>';
    this.formattedHtml = this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Crée le HTML pour un titre
   */
  private createTitleHtml(segment: TextSegment): string {
    const level = segment.level || 1;
    const iconClass = level === 1 ? 'fa-bookmark' : 'fa-chevron-right';
    const className = `formatted-title level-${level}`;
    
    return `
      <div class="${className}">
        <i class="fas ${iconClass} title-icon"></i>
        <span>${this.highlightText(segment.text)}</span>
      </div>
    `;
  }

  /**
   * Crée le HTML pour un paragraphe
   */
  private createParagraphHtml(segment: TextSegment): string {
    return `<p class="formatted-paragraph">${this.highlightText(segment.text)}</p>`;
  }

  /**
   * Crée le HTML pour un élément de liste
   */
  private createListItemHtml(segment: TextSegment): string {
    return `
      <div class="formatted-list-item">
        <i class="fas fa-circle list-bullet"></i>
        <span>${this.highlightText(segment.text)}</span>
      </div>
    `;
  }

  /**
   * Crée le HTML pour une citation
   */
  private createQuoteHtml(segment: TextSegment): string {
    return `
      <div class="formatted-quote">
        <i class="fas fa-quote-left quote-icon"></i>
        <p>${this.highlightText(segment.text)}</p>
      </div>
    `;
  }

  /**
   * Crée le HTML pour un séparateur
   */
  private createSeparatorHtml(): string {
    return '<hr class="formatted-separator">';
  }
}