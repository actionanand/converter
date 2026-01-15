import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

@Component({
  selector: 'app-jwt-decoder',
  imports: [FormsModule],
  templateUrl: './jwt-decoder.html',
  styleUrl: './jwt-decoder.scss',
})
export class JwtDecoder {
  private readonly snackbarService = inject(SnackbarService);
  protected readonly jwtInput = signal('');
  protected readonly decodedJWT = signal<DecodedJWT | null>(null);
  protected readonly error = signal<string>('');

  protected readonly isValid = computed(() => this.decodedJWT() !== null && this.error() === '');

  protected decodeJWT(): void {
    const token = this.jwtInput().trim();

    if (!token) {
      this.decodedJWT.set(null);
      this.error.set('');
      return;
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT must have 3 parts separated by dots.');
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode header
      const header = JSON.parse(this.base64UrlDecode(headerB64));

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(payloadB64));

      this.decodedJWT.set({
        header,
        payload,
        signature,
        raw: {
          header: headerB64,
          payload: payloadB64,
          signature,
        },
      });
      this.error.set('');
    } catch (err) {
      this.decodedJWT.set(null);
      this.error.set(err instanceof Error ? err.message : 'Invalid JWT token');
    }
  }

  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    try {
      // Decode base64
      const decoded = atob(base64);
      // Handle UTF-8 encoding
      return decodeURIComponent(
        decoded
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
    } catch {
      throw new Error('Failed to decode base64. Invalid JWT encoding.');
    }
  }

  protected formatJSON(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
  }

  protected copyHeader(): void {
    const decoded = this.decodedJWT();
    if (!decoded) return;

    navigator.clipboard.writeText(this.formatJSON(decoded.header)).then(
      () => this.snackbarService.success('Header copied to clipboard!'),
      () => this.snackbarService.error('Failed to copy to clipboard'),
    );
  }

  protected copyPayload(): void {
    const decoded = this.decodedJWT();
    if (!decoded) return;

    navigator.clipboard.writeText(this.formatJSON(decoded.payload)).then(
      () => this.snackbarService.success('Payload copied to clipboard!'),
      () => this.snackbarService.error('Failed to copy to clipboard'),
    );
  }

  protected copyToken(): void {
    navigator.clipboard.writeText(this.jwtInput()).then(
      () => this.snackbarService.success('JWT token copied to clipboard!'),
      () => this.snackbarService.error('Failed to copy to clipboard'),
    );
  }

  protected reset(): void {
    this.jwtInput.set('');
    this.decodedJWT.set(null);
    this.error.set('');
  }

  protected getExpiryStatus(): { expired: boolean; timeLeft: string } | null {
    const decoded = this.decodedJWT();
    if (!decoded || !decoded.payload['exp']) return null;

    const exp = decoded.payload['exp'] as number;
    const now = Math.floor(Date.now() / 1000);
    const diff = exp - now;

    if (diff < 0) {
      return { expired: true, timeLeft: 'Expired' };
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    let timeLeft = '';
    if (days > 0) timeLeft += `${days}d `;
    if (hours > 0) timeLeft += `${hours}h `;
    if (minutes > 0) timeLeft += `${minutes}m`;

    return { expired: false, timeLeft: timeLeft || 'Less than a minute' };
  }

  protected formatTimestamp(timestamp: unknown): string {
    if (typeof timestamp !== 'number') return 'Invalid timestamp';
    return new Date(timestamp * 1000).toLocaleString();
  }
}
