import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

interface Format14Bit {
  id: string;
  name: string;
  bits: number[];
}

interface FormatExtended {
  id: string;
  name: string;
  bits: number[];
  totalBits: number;
  description: string;
}

@Component({
  selector: 'app-point-code',
  imports: [FormsModule],
  templateUrl: './point-code.html',
  styleUrl: './point-code.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointCodeConverter {
  private readonly snackbarService = inject(SnackbarService);

  // 14-bit formats
  public readonly formats14Bit: Format14Bit[] = [
    { id: '7-7', name: '7-7 (ITU-T)', bits: [7, 7] },
    { id: '6-8', name: '6-8', bits: [6, 8] },
    { id: '5-9', name: '5-9', bits: [5, 9] },
    { id: '8-6', name: '8-6', bits: [8, 6] },
    { id: '9-5', name: '9-5', bits: [9, 5] },
    { id: '4-3-7', name: '4-3-7', bits: [4, 3, 7] },
    { id: '3-8-3', name: '3-8-3 (ITU-T)', bits: [3, 8, 3] },
    { id: '4-3-4-3', name: '4-3-4-3', bits: [4, 3, 4, 3] },
    { id: '4-4-6', name: '4-4-6', bits: [4, 4, 6] },
  ];

  // Extended formats (16-bit and 24-bit)
  public readonly formatsExtended: FormatExtended[] = [
    {
      id: '8-8-8',
      name: 'ANSI (8-8-8)',
      bits: [8, 8, 8],
      totalBits: 24,
      description: 'North America: Network-Cluster-Member',
    },
    {
      id: '7-4-5',
      name: 'Japanese (7-4-5)',
      bits: [7, 4, 5],
      totalBits: 16,
      description: 'Japan Variant',
    },
    {
      id: '8-8-8-cn',
      name: 'Chinese (8-8-8)',
      bits: [8, 8, 8],
      totalBits: 24,
      description: 'China Variant: Network-Cluster-Member',
    },
    {
      id: '5-8-11',
      name: 'Russian (5-8-11)',
      bits: [5, 8, 11],
      totalBits: 24,
      description: 'Russia: Zone-Area-ID',
    },
    {
      id: '3-8-5',
      name: 'Brazilian (3-8-5)',
      bits: [3, 8, 5],
      totalBits: 16,
      description: 'Brazil Variant',
    },
  ];

  // 14-bit converter state
  public readonly inputBase14 = signal<'decimal' | 'hexadecimal' | 'formatted'>('decimal');
  public readonly decimalInput14 = signal('');
  public readonly hexInput14 = signal('');
  public readonly formattedInput14 = signal('');
  public readonly inputFormat14 = signal('7-7');
  public readonly selectedFormat14 = signal('7-7');

  // Extended converter state
  public readonly inputBaseExt = signal<'decimal' | 'hexadecimal' | 'formatted'>('decimal');
  public readonly decimalInputExt = signal('');
  public readonly hexInputExt = signal('');
  public readonly formattedInputExt = signal('');
  public readonly inputFormatExt = signal('8-8-8');
  public readonly selectedFormatExt = signal('8-8-8');

  // 14-bit computed results
  public readonly result14Bit = computed(() => {
    const base = this.inputBase14();
    let input = '';
    if (base === 'decimal') input = String(this.decimalInput14());
    else if (base === 'hexadecimal') input = String(this.hexInput14());
    else input = String(this.formattedInput14());

    if (!input.trim()) return null;

    try {
      let decimal: number;

      if (base === 'formatted') {
        // Convert from formatted to decimal
        const format = this.formats14Bit.find((f) => f.id === this.inputFormat14());
        if (!format) return { error: 'Invalid format' };

        const parts = input
          .trim()
          .split('-')
          .map((p) => parseInt(p.trim(), 10));
        if (parts.length !== format.bits.length || parts.some(isNaN)) {
          return { error: 'Invalid formatted input' };
        }

        // Check each part doesn't exceed its bit range
        for (let i = 0; i < parts.length; i++) {
          const maxVal = Math.pow(2, format.bits[i]) - 1;
          if (parts[i] < 0 || parts[i] > maxVal) {
            return { error: `Part ${i + 1} exceeds range (0-${maxVal})` };
          }
        }

        // Convert parts to binary and concatenate
        let binary = '';
        for (let i = 0; i < parts.length; i++) {
          binary += parts[i].toString(2).padStart(format.bits[i], '0');
        }
        decimal = parseInt(binary, 2);
      } else {
        decimal = base === 'decimal' ? parseInt(input, 10) : parseInt(input, 16);
      }

      if (isNaN(decimal) || decimal < 0 || decimal > 16383) {
        return { error: 'Invalid input (Range: 0-16383 for 14-bit)' };
      }

      const format = this.formats14Bit.find((f) => f.id === this.selectedFormat14());
      if (!format) return { error: 'Invalid format' };

      const binary = decimal.toString(2).padStart(14, '0');
      const parts = this.splitBinary(binary, format.bits);
      const formatted = parts.map((p) => parseInt(p, 2)).join('-');

      return {
        decimal,
        hex: decimal.toString(16).toUpperCase(),
        binary,
        formatted,
        parts: parts.map((p) => parseInt(p, 2)),
      };
    } catch {
      return { error: 'Invalid input' };
    }
  });

  // Extended format computed results
  public readonly resultExtended = computed(() => {
    const base = this.inputBaseExt();
    let input = '';
    if (base === 'decimal') input = String(this.decimalInputExt());
    else if (base === 'hexadecimal') input = String(this.hexInputExt());
    else input = String(this.formattedInputExt());

    if (!input.trim()) return null;

    try {
      let decimal: number;
      const format = this.formatsExtended.find((f) => f.id === this.selectedFormatExt());
      if (!format) return { error: 'Invalid format' };

      if (base === 'formatted') {
        // Convert from formatted to decimal
        const inputFormat = this.formatsExtended.find((f) => f.id === this.inputFormatExt());
        if (!inputFormat) return { error: 'Invalid input format' };

        const parts = input
          .trim()
          .split('-')
          .map((p) => parseInt(p.trim(), 10));
        if (parts.length !== inputFormat.bits.length || parts.some(isNaN)) {
          return { error: 'Invalid formatted input' };
        }

        // Check each part doesn't exceed its bit range
        for (let i = 0; i < parts.length; i++) {
          const maxVal = Math.pow(2, inputFormat.bits[i]) - 1;
          if (parts[i] < 0 || parts[i] > maxVal) {
            return { error: `Part ${i + 1} exceeds range (0-${maxVal})` };
          }
        }

        // Convert parts to binary and concatenate
        let binary = '';
        for (let i = 0; i < parts.length; i++) {
          binary += parts[i].toString(2).padStart(inputFormat.bits[i], '0');
        }
        decimal = parseInt(binary, 2);
      } else {
        decimal = base === 'decimal' ? parseInt(input, 10) : parseInt(input, 16);
      }

      const maxValue = Math.pow(2, format.totalBits) - 1;
      if (isNaN(decimal) || decimal < 0 || decimal > maxValue) {
        return { error: `Invalid input (Range: 0-${maxValue} for ${format.totalBits}-bit)` };
      }

      const binary = decimal.toString(2).padStart(format.totalBits, '0');
      const parts = this.splitBinary(binary, format.bits);
      const formatted = parts.map((p) => parseInt(p, 2)).join('-');

      return {
        decimal,
        hex: decimal.toString(16).toUpperCase(),
        binary,
        formatted,
        parts: parts.map((p) => parseInt(p, 2)),
        formatName: format.name,
        description: format.description,
      };
    } catch {
      return { error: 'Invalid input' };
    }
  });

  // All possible conversions for 14-bit
  public readonly allConversions14 = computed(() => {
    const base = this.inputBase14();
    const input = String(base === 'decimal' ? this.decimalInput14() : this.hexInput14());
    if (!input.trim()) return null;

    try {
      const decimal = base === 'decimal' ? parseInt(input, 10) : parseInt(input, 16);
      if (isNaN(decimal) || decimal < 0 || decimal > 16383) return null;

      const binary = decimal.toString(2).padStart(14, '0');

      return this.formats14Bit.map((format) => {
        const parts = this.splitBinary(binary, format.bits);
        const formatted = parts.map((p) => parseInt(p, 2)).join('-');
        return {
          formatName: format.name,
          formatted,
        };
      });
    } catch {
      return null;
    }
  });

  private splitBinary(binary: string, bitSizes: number[]): string[] {
    const parts: string[] = [];
    let offset = 0;
    for (const size of bitSizes) {
      parts.push(binary.substring(offset, offset + size));
      offset += size;
    }
    return parts;
  }

  protected copyResult14(): void {
    const result = this.result14Bit();
    if (result && !('error' in result)) {
      navigator.clipboard.writeText(result.formatted);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }

  protected copyResultExt(): void {
    const result = this.resultExtended();
    if (result && !('error' in result)) {
      navigator.clipboard.writeText(result.formatted);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }

  protected clearAll14(): void {
    this.decimalInput14.set('');
    this.hexInput14.set('');
    this.formattedInput14.set('');
  }

  protected clearAllExt(): void {
    this.decimalInputExt.set('');
    this.hexInputExt.set('');
    this.formattedInputExt.set('');
  }

  protected loadSample14(): void {
    const base = this.inputBase14();
    if (base === 'decimal') {
      this.decimalInput14.set('8010');
    } else if (base === 'hexadecimal') {
      this.hexInput14.set('1F4A');
    } else {
      this.formattedInput14.set('62-74');
    }
  }

  protected loadSampleExt(): void {
    const base = this.inputBaseExt();
    if (base === 'decimal') {
      this.decimalInputExt.set('1234567');
    } else if (base === 'hexadecimal') {
      this.hexInputExt.set('12D687');
    } else {
      this.formattedInputExt.set('75-37-103');
    }
  }
}
