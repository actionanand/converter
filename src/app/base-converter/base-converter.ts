import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

type ConversionType =
  | 'dec2hex'
  | 'hex2dec'
  | 'dec2bin'
  | 'bin2dec'
  | 'dec2oct'
  | 'oct2dec'
  | 'bin2hex'
  | 'hex2bin'
  | 'oct2hex'
  | 'hex2oct'
  | 'bin2oct'
  | 'oct2bin';

interface ConversionOption {
  id: ConversionType;
  label: string;
  fromBase: number;
  toBase: number;
  fromName: string;
  toName: string;
  placeholder: string;
}

@Component({
  selector: 'app-base-converter',
  imports: [FormsModule],
  templateUrl: './base-converter.html',
  styleUrl: './base-converter.scss',
})
export class BaseConverter {
  private readonly snackbarService = inject(SnackbarService);

  public readonly input = signal('');
  public readonly selectedConversion = signal<ConversionType>('dec2hex');

  protected readonly conversions: ConversionOption[] = [
    {
      id: 'dec2hex',
      label: 'Decimal → Hexadecimal',
      fromBase: 10,
      toBase: 16,
      fromName: 'Decimal',
      toName: 'Hexadecimal',
      placeholder: 'e.g., 255',
    },
    {
      id: 'hex2dec',
      label: 'Hexadecimal → Decimal',
      fromBase: 16,
      toBase: 10,
      fromName: 'Hexadecimal',
      toName: 'Decimal',
      placeholder: 'e.g., FF',
    },
    {
      id: 'dec2bin',
      label: 'Decimal → Binary',
      fromBase: 10,
      toBase: 2,
      fromName: 'Decimal',
      toName: 'Binary',
      placeholder: 'e.g., 42',
    },
    {
      id: 'bin2dec',
      label: 'Binary → Decimal',
      fromBase: 2,
      toBase: 10,
      fromName: 'Binary',
      toName: 'Decimal',
      placeholder: 'e.g., 101010',
    },
    {
      id: 'dec2oct',
      label: 'Decimal → Octal',
      fromBase: 10,
      toBase: 8,
      fromName: 'Decimal',
      toName: 'Octal',
      placeholder: 'e.g., 64',
    },
    {
      id: 'oct2dec',
      label: 'Octal → Decimal',
      fromBase: 8,
      toBase: 10,
      fromName: 'Octal',
      toName: 'Decimal',
      placeholder: 'e.g., 100',
    },
    {
      id: 'bin2hex',
      label: 'Binary → Hexadecimal',
      fromBase: 2,
      toBase: 16,
      fromName: 'Binary',
      toName: 'Hexadecimal',
      placeholder: 'e.g., 11111111',
    },
    {
      id: 'hex2bin',
      label: 'Hexadecimal → Binary',
      fromBase: 16,
      toBase: 2,
      fromName: 'Hexadecimal',
      toName: 'Binary',
      placeholder: 'e.g., FF',
    },
    {
      id: 'oct2hex',
      label: 'Octal → Hexadecimal',
      fromBase: 8,
      toBase: 16,
      fromName: 'Octal',
      toName: 'Hexadecimal',
      placeholder: 'e.g., 377',
    },
    {
      id: 'hex2oct',
      label: 'Hexadecimal → Octal',
      fromBase: 16,
      toBase: 8,
      fromName: 'Hexadecimal',
      toName: 'Octal',
      placeholder: 'e.g., FF',
    },
    {
      id: 'bin2oct',
      label: 'Binary → Octal',
      fromBase: 2,
      toBase: 8,
      fromName: 'Binary',
      toName: 'Octal',
      placeholder: 'e.g., 11111111',
    },
    {
      id: 'oct2bin',
      label: 'Octal → Binary',
      fromBase: 8,
      toBase: 2,
      fromName: 'Octal',
      toName: 'Binary',
      placeholder: 'e.g., 377',
    },
  ];

  protected readonly currentConversion = computed(() => {
    return this.conversions.find((c) => c.id === this.selectedConversion());
  });

  public readonly result = computed(() => {
    const inputValue = String(this.input() || '').trim();
    if (!inputValue) return '';

    const conversion = this.currentConversion();
    if (!conversion) return '';

    try {
      // Parse input based on source base
      const decimal = parseInt(inputValue, conversion.fromBase);

      if (isNaN(decimal)) {
        return `Invalid ${conversion.fromName} number`;
      }

      // Convert to target base
      let output = decimal.toString(conversion.toBase);

      // Uppercase for hex
      if (conversion.toBase === 16) {
        output = output.toUpperCase();
      }

      return output;
    } catch {
      return 'Conversion error';
    }
  });

  public readonly breakdown = computed(() => {
    const inputValue = String(this.input() || '').trim();
    if (!inputValue || this.result().includes('Invalid') || this.result().includes('error')) {
      return null;
    }

    const conversion = this.currentConversion();
    if (!conversion) return null;

    try {
      const decimal = parseInt(inputValue, conversion.fromBase);

      return {
        input: inputValue,
        inputBase: conversion.fromBase,
        inputName: conversion.fromName,
        decimal: decimal,
        output: this.result(),
        outputBase: conversion.toBase,
        outputName: conversion.toName,
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        hex: decimal.toString(16).toUpperCase(),
      };
    } catch {
      return null;
    }
  });

  protected clearInput(): void {
    this.input.set('');
  }

  public loadSample(): void {
    const conversion = this.currentConversion();
    if (!conversion) return;

    const samples: Record<ConversionType, string> = {
      dec2hex: '255',
      hex2dec: 'FF',
      dec2bin: '42',
      bin2dec: '101010',
      dec2oct: '64',
      oct2dec: '100',
      bin2hex: '11111111',
      hex2bin: 'FF',
      oct2hex: '377',
      hex2oct: 'FF',
      bin2oct: '11111111',
      oct2bin: '377',
    };

    this.input.set(samples[conversion.id] || '');
  }

  protected copyResult(): void {
    const result = this.result();
    if (result && !result.includes('Invalid') && !result.includes('error')) {
      navigator.clipboard.writeText(result);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }
}
