import { Component, inject } from '@angular/core';
import { SnackbarService } from './snackbar.service';

@Component({
  selector: 'app-snackbar',
  imports: [],
  template: `
    <div class="snackbar-container">
      @for (msg of snackbarService.messages(); track msg.id) {
        <div class="snackbar" [class]="'snackbar-' + msg.type">
          <span class="snackbar-icon">{{ getIcon(msg.type) }}</span>
          <span class="snackbar-message">{{ msg.message }}</span>
          <button
            class="snackbar-close"
            (click)="snackbarService.hide(msg.id)"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .snackbar-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .snackbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
      color: white;
      font-weight: 500;
    }

    .snackbar-success {
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    }

    .snackbar-error {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .snackbar-info {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    }

    .snackbar-warning {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }

    .snackbar-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .snackbar-message {
      flex: 1;
      line-height: 1.4;
    }

    .snackbar-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    @media (max-width: 768px) {
      .snackbar-container {
        top: 70px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .snackbar {
        min-width: auto;
      }
    }
  `,
})
export class SnackbarComponent {
  protected readonly snackbarService = inject(SnackbarService);

  protected getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}
