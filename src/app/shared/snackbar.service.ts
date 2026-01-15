import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private messageId = 0;
  readonly messages = signal<SnackbarMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const id = this.messageId++;
    const snackbarMessage: SnackbarMessage = { message, type, id };

    this.messages.update((messages) => [...messages, snackbarMessage]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hide(id);
    }, 5000);
  }

  hide(id: number): void {
    this.messages.update((messages) => messages.filter((msg) => msg.id !== id));
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }
}
