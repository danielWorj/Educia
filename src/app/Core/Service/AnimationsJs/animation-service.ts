// core/animations.service.ts
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnimationsService {

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Effet reveal au scroll
  initReveal() {
    if (!this.isBrowser) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Compteurs animés (data-target, data-suffix)
  initCounters() {
    if (!this.isBrowser) return;

    const counters = document.querySelectorAll('[data-target]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = +el.getAttribute('data-target')!;
          const suffix = el.getAttribute('data-suffix') || '';
          let current = 0;
          const step = target / 60;

          const update = () => {
            current += step;
            if (current < target) {
              el.textContent = Math.floor(current) + suffix;
              requestAnimationFrame(update);
            } else {
              el.textContent = target + suffix;
            }
          };
          update();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // Barre de progression (data-progress)
  initProgressBars() {
    if (!this.isBrowser) return;
    
    const bars = document.querySelectorAll('.lesson-bar-fill[data-progress]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const progress = el.getAttribute('data-progress') + '%';
          el.style.width = progress;
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(el => observer.observe(el));
  }
}