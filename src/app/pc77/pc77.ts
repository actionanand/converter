import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-pc77',
  imports: [FormsModule],
  templateUrl: './pc77.html',
  styleUrl: './pc77.scss',
})
export class Pc77Converter {
  private readonly snackbarService = inject(SnackbarService);

  public readonly mode = signal<'toPC77' | 'toDec'>('toPC77');
  public readonly decimalInput = signal('');
  public readonly pc77Input = signal('');

  public readonly pc77Result = computed(() => {
    const dec = String(this.decimalInput() || '').trim();
    if (!dec) return '';

    const num = parseInt(dec, 10);
    if (isNaN(num) || num < 0 || num > 16383) {
      return 'Invalid (Range: 0-16383)';
    }

    return this.decimalToPC77(num);
  });

  public readonly decimalResult = computed(() => {
    const pc77 = String(this.pc77Input() || '').trim();
    if (!pc77) return '';

    try {
      return this.pc77ToDecimal(pc77);
    } catch {
      return 'Invalid PC77 format';
    }
  });

  public readonly binaryRepresentation = computed<{
    original: string;
    padded: string;
    first7: string;
    second7: string;
  } | null>(() => {
    if (this.mode() === 'toPC77') {
      const dec = String(this.decimalInput() || '').trim();
      if (!dec) return null;
      const num = parseInt(dec, 10);
      if (isNaN(num) || num < 0 || num > 16383) return null;

      const binary = num.toString(2);
      const padded = binary.padStart(14, '0');
      return {
        original: binary,
        padded: padded,
        first7: padded.substring(0, 7),
        second7: padded.substring(7, 14),
      };
    } else {
      const pc77 = this.pc77Input();
      if (!pc77 || pc77.trim() === '') return null;
      try {
        const parts = pc77.split('-');
        if (parts.length !== 2) return null;
        const first = parseInt(parts[0], 10);
        const second = parseInt(parts[1], 10);
        if (isNaN(first) || isNaN(second) || first > 127 || second > 127) return null;

        const firstBin = first.toString(2).padStart(7, '0');
        const secondBin = second.toString(2).padStart(7, '0');
        return {
          first7: firstBin,
          second7: secondBin,
          padded: firstBin + secondBin,
          original: (firstBin + secondBin).replace(/^0+/, '') || '0',
        };
      } catch {
        return null;
      }
    }
  });

  private decimalToPC77(decimal: number): string {
    // Convert to 14-bit binary
    const binary = decimal.toString(2);
    const padded = binary.padStart(14, '0');

    // Split into two 7-bit parts
    const first7 = padded.substring(0, 7);
    const second7 = padded.substring(7, 14);

    // Convert each 7-bit part to decimal
    const firstDec = parseInt(first7, 2);
    const secondDec = parseInt(second7, 2);

    return `${firstDec}-${secondDec}`;
  }

  private pc77ToDecimal(pc77: string): string {
    const parts = pc77.trim().split('-');

    if (parts.length !== 2) {
      throw new Error('Invalid format');
    }

    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);

    if (isNaN(first) || isNaN(second) || first < 0 || first > 127 || second < 0 || second > 127) {
      throw new Error('Invalid range');
    }

    // Convert each part to 7-bit binary
    const firstBin = first.toString(2).padStart(7, '0');
    const secondBin = second.toString(2).padStart(7, '0');

    // Concatenate and convert to decimal
    const combined = firstBin + secondBin;
    return parseInt(combined, 2).toString();
  }

  protected copyResult(): void {
    const result = this.mode() === 'toPC77' ? this.pc77Result() : this.decimalResult();
    if (result && !result.includes('Invalid')) {
      navigator.clipboard.writeText(result);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }

  public swapMode(): void {
    this.mode.set(this.mode() === 'toPC77' ? 'toDec' : 'toPC77');
  }

  protected clearAll(): void {
    this.decimalInput.set('');
    this.pc77Input.set('');
  }

  protected loadSample(): void {
    if (this.mode() === 'toPC77') {
      this.decimalInput.set('1234');
    } else {
      this.pc77Input.set('9-82');
    }
  }

  protected parseInt(value: string, radix: number): number {
    return parseInt(value, radix);
  }
}
