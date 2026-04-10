import { Component, signal } from '@angular/core';
import { Toast } from '../../Model/Toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class ToastComponent {
  
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear() {
    this.toasts.set([]);
  }

}
