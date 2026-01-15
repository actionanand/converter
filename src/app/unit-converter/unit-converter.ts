import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ConversionCategory = 'length' | 'temperature' | 'weight' | 'pressure' | 'typography';

@Component({
  selector: 'app-unit-converter',
  imports: [FormsModule],
  templateUrl: './unit-converter.html',
  styleUrl: './unit-converter.scss',
})
export class UnitConverter {
  protected readonly category = signal<ConversionCategory>('typography');
  protected readonly inputValue = signal(16);
  protected readonly fromUnit = signal('rem');
  protected readonly toUnit = signal('px');

  protected readonly categories = [
    { value: 'typography', label: '📝 Typography (rem/px/em)', icon: '📝' },
    { value: 'temperature', label: '🌡️ Temperature', icon: '🌡️' },
    { value: 'weight', label: '⚖️ Weight/Mass', icon: '⚖️' },
    { value: 'pressure', label: '💨 Pressure', icon: '💨' },
    { value: 'length', label: '📏 Length/Distance', icon: '📏' },
  ] as const;

  protected readonly units = computed(() => {
    const cat = this.category();
    switch (cat) {
      case 'typography':
        return ['rem', 'px', 'em', 'pt'];
      case 'temperature':
        return ['°C', '°F', 'K'];
      case 'weight':
        return ['kg', 'g', 'lb', 'oz', 'ton', 'stone'];
      case 'pressure':
        return ['PSI', 'bar', 'Pa', 'kPa', 'atm'];
      case 'length':
        return ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'];
      default:
        return [];
    }
  });

  protected readonly result = computed(() => {
    const value = this.inputValue();
    const from = this.fromUnit();
    const to = this.toUnit();
    const cat = this.category();

    if (isNaN(value)) return 0;

    return this.convert(value, from, to, cat);
  });

  protected readonly categoryName = computed(() => {
    return this.categories.find((c) => c.value === this.category())?.label || '';
  });

  protected onCategoryChange(): void {
    const units = this.units();
    if (units.length > 0) {
      this.fromUnit.set(units[0]);
      this.toUnit.set(units[1] || units[0]);
    }
  }

  protected swapUnits(): void {
    const temp = this.fromUnit();
    this.fromUnit.set(this.toUnit());
    this.toUnit.set(temp);
  }

  private convert(value: number, from: string, to: string, category: ConversionCategory): number {
    if (from === to) return value;

    switch (category) {
      case 'typography':
        return this.convertTypography(value, from, to);
      case 'temperature':
        return this.convertTemperature(value, from, to);
      case 'weight':
        return this.convertWeight(value, from, to);
      case 'pressure':
        return this.convertPressure(value, from, to);
      case 'length':
        return this.convertLength(value, from, to);
      default:
        return 0;
    }
  }

  private convertTypography(value: number, from: string, to: string): number {
    const baseFontSize = 16; // 1rem = 16px (standard)

    // Convert to px first
    let inPx = value;
    if (from === 'rem' || from === 'em') {
      inPx = value * baseFontSize;
    } else if (from === 'pt') {
      inPx = value * 1.333333; // 1pt = 1.333px
    }

    // Convert from px to target
    if (to === 'rem' || to === 'em') {
      return Math.round((inPx / baseFontSize) * 1000) / 1000;
    } else if (to === 'pt') {
      return Math.round((inPx / 1.333333) * 1000) / 1000;
    }

    return Math.round(inPx * 1000) / 1000;
  }

  private convertTemperature(value: number, from: string, to: string): number {
    let celsius = value;

    // Convert to Celsius first
    if (from === '°F') {
      celsius = (value - 32) * (5 / 9);
    } else if (from === 'K') {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target
    if (to === '°F') {
      return Math.round((celsius * (9 / 5) + 32) * 100) / 100;
    } else if (to === 'K') {
      return Math.round((celsius + 273.15) * 100) / 100;
    }

    return Math.round(celsius * 100) / 100;
  }

  private convertWeight(value: number, from: string, to: string): number {
    // Convert to kg first
    let inKg = value;
    const conversions: Record<string, number> = {
      kg: 1,
      g: 0.001,
      lb: 0.453592,
      oz: 0.0283495,
      ton: 1000,
      stone: 6.35029,
    };

    inKg = value * (conversions[from] || 1);

    // Convert from kg to target
    return Math.round((inKg / (conversions[to] || 1)) * 100000) / 100000;
  }

  private convertPressure(value: number, from: string, to: string): number {
    // Convert to Pa first
    let inPa = value;
    const conversions: Record<string, number> = {
      Pa: 1,
      kPa: 1000,
      bar: 100000,
      PSI: 6894.76,
      atm: 101325,
    };

    inPa = value * (conversions[from] || 1);

    // Convert from Pa to target
    return Math.round((inPa / (conversions[to] || 1)) * 100000) / 100000;
  }

  private convertLength(value: number, from: string, to: string): number {
    // Convert to meters first
    let inMeters = value;
    const conversions: Record<string, number> = {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    };

    inMeters = value * (conversions[from] || 1);

    // Convert from meters to target
    return Math.round((inMeters / (conversions[to] || 1)) * 100000) / 100000;
  }
}
