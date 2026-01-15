import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
}

@Component({
  selector: 'app-color-picker',
  imports: [FormsModule],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
})
export class ColorPicker {
  private readonly snackbarService = inject(SnackbarService);

  protected readonly selectedColor = signal('#3498db');
  protected readonly hexInput = signal('#3498db');
  protected readonly rgbR = signal(52);
  protected readonly rgbG = signal(152);
  protected readonly rgbB = signal(219);

  protected readonly colorFormats = computed<ColorFormats>(() => {
    const r = this.rgbR();
    const g = this.rgbG();
    const b = this.rgbB();

    return {
      hex: this.rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: this.rgbToHsl(r, g, b),
      hsv: this.rgbToHsv(r, g, b),
      cmyk: this.rgbToCmyk(r, g, b),
    };
  });

  protected readonly shades = computed(() => {
    return this.generateShades(this.selectedColor());
  });

  protected readonly complementary = computed(() => {
    return this.getComplementaryColor(this.selectedColor());
  });

  protected readonly analogous = computed(() => {
    return this.getAnalogousColors(this.selectedColor());
  });

  protected readonly triadic = computed(() => {
    return this.getTriadicColors(this.selectedColor());
  });

  protected onColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.selectedColor.set(color);
    this.updateFromHex(color);
  }

  protected onHexInputChange(): void {
    let hex = this.hexInput();
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      this.selectedColor.set(hex);
      this.updateFromHex(hex);
    }
  }

  protected onRgbChange(): void {
    const hex = this.rgbToHex(this.rgbR(), this.rgbG(), this.rgbB());
    this.selectedColor.set(hex);
    this.hexInput.set(hex);
  }

  private updateFromHex(hex: string): void {
    this.hexInput.set(hex);
    const rgb = this.hexToRgb(hex);
    if (rgb) {
      this.rgbR.set(rgb.r);
      this.rgbG.set(rgb.g);
      this.rgbB.set(rgb.b);
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  private rgbToHsl(r: number, g: number, b: number): string {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  private rgbToHsv(r: number, g: number, b: number): string {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
  }

  private rgbToCmyk(r: number, g: number, b: number): string {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);

    const cFinal = k === 1 ? 0 : (c - k) / (1 - k);
    const mFinal = k === 1 ? 0 : (m - k) / (1 - k);
    const yFinal = k === 1 ? 0 : (y - k) / (1 - k);

    return `cmyk(${Math.round(cFinal * 100)}%, ${Math.round(mFinal * 100)}%, ${Math.round(yFinal * 100)}%, ${Math.round(k * 100)}%)`;
  }

  private generateShades(hex: string): string[] {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return [];

    const shades: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const factor = i / 10;
      const r = Math.round(rgb.r * factor);
      const g = Math.round(rgb.g * factor);
      const b = Math.round(rgb.b * factor);
      shades.push(this.rgbToHex(r, g, b));
    }
    return shades.reverse();
  }

  private getComplementaryColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    return this.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  }

  private getAnalogousColors(hex: string): string[] {
    return [this.rotateHue(hex, -30), hex, this.rotateHue(hex, 30)];
  }

  private getTriadicColors(hex: string): string[] {
    return [hex, this.rotateHue(hex, 120), this.rotateHue(hex, 240)];
  }

  private rotateHue(hex: string, degrees: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    let { r, g, b } = rgb;
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const s = max === 0 ? 0 : (max - min) / max;
    const v = max;

    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    h = (h * 360 + degrees) % 360;
    if (h < 0) h += 360;

    return this.hsvToHex(h, s, v);
  }

  private hsvToHex(h: number, s: number, v: number): string {
    h /= 60;
    const c = v * s;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;
    if (h >= 0 && h < 1) {
      r = c;
      g = x;
    } else if (h >= 1 && h < 2) {
      r = x;
      g = c;
    } else if (h >= 2 && h < 3) {
      g = c;
      b = x;
    } else if (h >= 3 && h < 4) {
      g = x;
      b = c;
    } else if (h >= 4 && h < 5) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }

    const rFinal = Math.round((r + m) * 255);
    const gFinal = Math.round((g + m) * 255);
    const bFinal = Math.round((b + m) * 255);

    return this.rgbToHex(rFinal, gFinal, bFinal);
  }

  protected copyFormat(format: string, value: string): void {
    navigator.clipboard.writeText(value).then(
      () => this.snackbarService.success(`${format} copied to clipboard!`),
      () => this.snackbarService.error('Failed to copy to clipboard'),
    );
  }

  protected useColor(color: string): void {
    this.selectedColor.set(color);
    this.updateFromHex(color);
    this.snackbarService.info('Color updated!');
  }
}
