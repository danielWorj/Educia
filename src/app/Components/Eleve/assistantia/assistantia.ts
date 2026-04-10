import { Component, OnInit, ViewChild, ElementRef, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AssistantService } from '../../../Core/Service/IA/Assistant-Service/assistant-service';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  time: string;
  formattedContent?: ContentBlock[];
}

interface ContentBlock {
  id: string;
  type: 'title' | 'paragraph' | 'math-block';
  content: string;
  rawLatex?: string;
}

interface TextPart {
  isBold: boolean;
  isMath: boolean;
  text: string;
  rawLatex?: string;
}

@Component({
  selector: 'app-assistantia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistantia.html',
  styleUrls: ['./assistantia.css']
})
export class Assistantia implements OnInit {
  promptForm!: FormGroup;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  userInput = signal('');
  messages = signal<Message[]>([]);
  isTyping = signal(false);
  showEmptyState = signal(true);
  private katexLoaded = signal(false);

  constructor(private fb: FormBuilder, private assistantService: AssistantService) {
    effect(() => {
      if (this.messages().length > 0) {
        setTimeout(() => {
          this.scrollToBottom();
          this.renderMath();
        }, 100);
      }
    });

    this.promptForm = this.fb.group({
      prompt: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.loadKaTeX();
  }

  // Charger KaTeX dynamiquement avec gestion d'erreurs
  private loadKaTeX(): void {
    if ((window as any).katex) {
      this.katexLoaded.set(true);
      console.log('KaTeX déjà chargé');
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    link.onerror = () => console.error('Erreur de chargement du CSS KaTeX');
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.onload = () => {
      console.log('KaTeX chargé avec succès');
      this.katexLoaded.set(true);
      // Rendre les maths existantes si présentes
      setTimeout(() => this.renderMath(), 100);
    };
    script.onerror = () => {
      console.error('Erreur de chargement de KaTeX');
      this.katexLoaded.set(false);
    };
    document.head.appendChild(script);
  }

  // Rendre les formules mathématiques
  private renderMath(): void {
    if (!this.katexLoaded() || !(window as any).katex) {
      console.warn('KaTeX non disponible pour le rendu');
      return;
    }

    const mathElements = document.querySelectorAll('.math-content:not(.rendered)');
    
    mathElements.forEach((element: Element) => {
      const latex = element.getAttribute('data-latex') || '';
      const displayMode = element.classList.contains('display-math');
      
      if (!latex) return;

      try {
        (window as any).katex.render(latex, element, {
          displayMode: displayMode,
          throwOnError: false,
          output: 'html',
          strict: false,
          trust: false
        });
        element.classList.add('rendered');
      } catch (e) {
        console.error('Erreur de rendu LaTeX:', latex, e);
        element.textContent = `[Erreur LaTeX: ${latex}]`;
        element.classList.add('rendered');
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  sendMessage(): void {
    const trimmedInput = this.userInput().trim();
    
    if (!trimmedInput || this.isTyping()) return;

    this.showEmptyState.set(false);

    const userMessage: Message = {
      id: this.generateId(),
      type: 'user',
      content: trimmedInput,
      time: this.getCurrentTime()
    };
    
    this.messages.update(msgs => [...msgs, userMessage]);
    this.userInput.set('');
    this.isTyping.set(true);

    this.callAssistantAPI(trimmedInput);
  }

  callAssistantAPI(prompt: string): void {
    const formData: FormData = new FormData(); 
    
    this.promptForm.controls['prompt'].setValue(prompt); 
    formData.append("prompt", JSON.stringify(this.promptForm.value));
     
    this.assistantService.findAssistanceTextuelle(formData).subscribe({
      next: (response: string) => {
        this.isTyping.set(false);
        
        const assistantMessage: Message = {
          id: this.generateId(),
          type: 'assistant',
          content: response,
          time: this.getCurrentTime(),
          formattedContent: this.formatResponse(response)
        };
        
        this.messages.update(msgs => [...msgs, assistantMessage]);
      },
      error: (error) => {
        this.isTyping.set(false);
        console.error('Erreur API:', error);
        
        const errorMessage: Message = {
          id: this.generateId(),
          type: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          time: this.getCurrentTime(),
          formattedContent: [{
            id: this.generateId(),
            type: 'paragraph',
            content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
          }]
        };
        
        this.messages.update(msgs => [...msgs, errorMessage]);
      }
    });
  }

  // Nettoyer le LaTeX en préservant la syntaxe
  private cleanLatex(latex: string): string {
    return latex
      .trim() //Supprimer les espaces et debut et fin d'une chaine de caractere sans affecter les espaces entres mots
      .replace(/\\\[/g, '') // Retirer les délimiteurs de bloc
      .replace(/\\\]/g, '')
      .replace(/\\\(/g, '') // Retirer les délimiteurs inline
      .replace(/\\\)/g, '')
      .replace(/\$\$/g, '')  // Retirer les $$
      .replace(/^\$/, '')    // Retirer $ au début
      .replace(/\$$/, '')    // Retirer $ à la fin
      .trim();
  }

  // Détecter et extraire les blocs mathématiques
  private extractMathBlocks(text: string): { text: string; blocks: Map<string, string> } {
    const blocks = new Map<string, string>();
    let counter = 0;
    let processed = text;
    
    // 1. Remplacer les blocs display math \[ ... \] (non-greedy)
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
      const placeholder = `___MATH_BLOCK_${counter}___`;
      blocks.set(placeholder, this.cleanLatex(latex));
      counter++;
      return `\n${placeholder}\n`;
    });
    
    // 2. Remplacer les blocs display math $$ ... $$ (non-greedy)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
      const placeholder = `___MATH_BLOCK_${counter}___`;
      blocks.set(placeholder, this.cleanLatex(latex));
      counter++;
      return `\n${placeholder}\n`;
    });
    
    return { text: processed, blocks };
  }

  formatResponse(text: string): ContentBlock[] {
    if (!text) return [];

    // Extraire d'abord les blocs mathématiques
    const { text: processedText, blocks: mathBlocks } = this.extractMathBlocks(text);
    
    // Diviser en paragraphes
    const paragraphs = processedText
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return paragraphs.map(para => {
      // Vérifier si c'est un placeholder de bloc mathématique
      const mathBlockMatch = para.match(/^___MATH_BLOCK_(\d+)___$/);
      if (mathBlockMatch) {
        const latex = mathBlocks.get(para);
        if (latex) {
          return {
            id: this.generateId(),
            type: 'math-block' as const,
            content: latex,
            rawLatex: latex
          };
        }
      }

      // Détecter les titres (ligne complète en gras, sans autre contenu)
      if (/^\*\*[^*]+\*\*$/.test(para)) {
        return {
          id: this.generateId(),
          type: 'title' as const,
          content: para.replace(/\*\*/g, '').trim()
        };
      }
      
      // Paragraphe normal (peut contenir des maths inline)
      return {
        id: this.generateId(),
        type: 'paragraph' as const,
        content: para
      };
    }).filter(block => block && block.content);
  }

  formatInlineText(text: string): TextPart[] {
    if (!text) return [];
    
    const parts: TextPart[] = [];
    let currentIndex = 0;
    
    // Pattern pour détecter: \(...\), $...$ (non-$$), **...**
    const pattern = /(\\\([\s\S]*?\\\))|(\$(?!\$)[^\$]+?\$)|(\*\*[^*]+?\*\*)/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Ajouter le texte avant le match
      if (match.index > currentIndex) {
        const normalText = text.substring(currentIndex, match.index);
        if (normalText) {
          parts.push({
            isBold: false,
            isMath: false,
            text: normalText
          });
        }
      }
      
      const fullMatch = match[0];
      
      // Math inline \( ... \)
      if (match[1]) {
        const latex = this.cleanLatex(fullMatch);
        parts.push({
          isBold: false,
          isMath: true,
          text: latex,
          rawLatex: latex
        });
      }
      // Math inline $ ... $
      else if (match[2]) {
        const latex = this.cleanLatex(fullMatch);
        parts.push({
          isBold: false,
          isMath: true,
          text: latex,
          rawLatex: latex
        });
      }
      // Texte en gras ** ... **
      else if (match[3]) {
        parts.push({
          isBold: true,
          isMath: false,
          text: fullMatch.replace(/\*\*/g, '')
        });
      }
      
      currentIndex = match.index + fullMatch.length;
    }
    
    // Ajouter le texte restant
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        parts.push({
          isBold: false,
          isMath: false,
          text: remainingText
        });
      }
    }
    
    return parts.filter(part => part.text && part.text.length > 0);
  }

  sendSuggestion(suggestion: string): void {
    this.userInput.set(suggestion);
    this.sendMessage();
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    if (confirm('Voulez-vous vraiment effacer toute la conversation ?')) {
      this.messages.set([]);
      this.showEmptyState.set(true);
      this.userInput.set('');
    }
  }

  attachFile(): void {
    alert('Fonctionnalité de pièce jointe à venir !');
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch(err) {
      console.error('Erreur de scroll:', err);
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }

  updateUserInput(value: string): void {
    this.userInput.set(value);
  }
}