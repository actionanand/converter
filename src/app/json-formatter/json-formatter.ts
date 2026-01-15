import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

interface JsonDiff {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: unknown;
  newValue?: unknown;
}

@Component({
  selector: 'app-json-formatter',
  imports: [FormsModule],
  templateUrl: './json-formatter.html',
  styleUrl: './json-formatter.scss',
})
export class JsonFormatter {
  private readonly snackbarService = inject(SnackbarService);

  protected readonly jsonInput1 = signal('');
  protected readonly jsonInput2 = signal('');
  protected readonly indentSize = signal(2);
  protected readonly showComparison = signal(false);

  protected readonly formatted1 = computed(() => {
    try {
      const parsed = JSON.parse(this.jsonInput1());
      return JSON.stringify(parsed, null, this.indentSize());
    } catch {
      return '';
    }
  });

  protected readonly formatted2 = computed(() => {
    try {
      const parsed = JSON.parse(this.jsonInput2());
      return JSON.stringify(parsed, null, this.indentSize());
    } catch {
      return '';
    }
  });

  protected readonly isValid1 = computed(() => {
    if (!this.jsonInput1()) return null;
    try {
      JSON.parse(this.jsonInput1());
      return true;
    } catch {
      return false;
    }
  });

  protected readonly isValid2 = computed(() => {
    if (!this.jsonInput2()) return null;
    try {
      JSON.parse(this.jsonInput2());
      return true;
    } catch {
      return false;
    }
  });

  protected readonly errorMessage1 = computed(() => {
    if (!this.jsonInput1()) return '';
    try {
      JSON.parse(this.jsonInput1());
      return '';
    } catch (e) {
      return (e as Error).message;
    }
  });

  protected readonly errorMessage2 = computed(() => {
    if (!this.jsonInput2()) return '';
    try {
      JSON.parse(this.jsonInput2());
      return '';
    } catch (e) {
      return (e as Error).message;
    }
  });

  protected readonly differences = computed(() => {
    if (!this.isValid1() || !this.isValid2()) return [];

    try {
      const obj1 = JSON.parse(this.jsonInput1());
      const obj2 = JSON.parse(this.jsonInput2());
      return this.findDifferences(obj1, obj2, '');
    } catch {
      return [];
    }
  });

  protected readonly diffStats = computed(() => {
    const diffs = this.differences();
    return {
      added: diffs.filter((d) => d.type === 'added').length,
      removed: diffs.filter((d) => d.type === 'removed').length,
      modified: diffs.filter((d) => d.type === 'modified').length,
    };
  });

  protected formatJson(inputNumber: 1 | 2): void {
    const formatted = inputNumber === 1 ? this.formatted1() : this.formatted2();

    if (formatted) {
      if (inputNumber === 1) {
        this.jsonInput1.set(formatted);
      } else {
        this.jsonInput2.set(formatted);
      }
      this.snackbarService.show('JSON formatted successfully!', 'success');
    } else {
      this.snackbarService.show('Invalid JSON!', 'error');
    }
  }

  protected minifyJson(inputNumber: 1 | 2): void {
    const input = inputNumber === 1 ? this.jsonInput1() : this.jsonInput2();

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      if (inputNumber === 1) {
        this.jsonInput1.set(minified);
      } else {
        this.jsonInput2.set(minified);
      }
      this.snackbarService.show('JSON minified successfully!', 'success');
    } catch {
      this.snackbarService.show('Invalid JSON!', 'error');
    }
  }

  protected copyFormatted(inputNumber: 1 | 2): void {
    const formatted = inputNumber === 1 ? this.formatted1() : this.formatted2();
    if (formatted) {
      navigator.clipboard.writeText(formatted);
      this.snackbarService.show('Formatted JSON copied!', 'success');
    }
  }

  protected clearAll(): void {
    this.jsonInput1.set('');
    this.jsonInput2.set('');
    this.showComparison.set(false);
  }

  protected loadSample(): void {
    this.jsonInput1.set(
      '{"name":"John","age":30,"city":"New York","hobbies":["reading","gaming"]}',
    );
    this.jsonInput2.set(
      '{"name":"John","age":31,"city":"Los Angeles","hobbies":["reading","swimming","gaming"],"email":"john@example.com"}',
    );
    this.showComparison.set(true);
  }

  private findDifferences(obj1: unknown, obj2: unknown, path: string): JsonDiff[] {
    const diffs: JsonDiff[] = [];

    if (typeof obj1 !== typeof obj2) {
      diffs.push({
        path: path || 'root',
        type: 'modified',
        oldValue: obj1,
        newValue: obj2,
      });
      return diffs;
    }

    if (typeof obj1 !== 'object' || obj1 === null) {
      if (obj1 !== obj2) {
        diffs.push({
          path: path || 'root',
          type: 'modified',
          oldValue: obj1,
          newValue: obj2,
        });
      }
      return diffs;
    }

    const keys1 = Object.keys(obj1 as Record<string, unknown>);
    const keys2 = Object.keys(obj2 as Record<string, unknown>);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      const val1 = (obj1 as Record<string, unknown>)[key];
      const val2 = (obj2 as Record<string, unknown>)[key];

      if (!(key in (obj1 as Record<string, unknown>))) {
        diffs.push({ path: newPath, type: 'added', newValue: val2 });
      } else if (!(key in (obj2 as Record<string, unknown>))) {
        diffs.push({ path: newPath, type: 'removed', oldValue: val1 });
      } else if (typeof val1 === 'object' && typeof val2 === 'object') {
        diffs.push(...this.findDifferences(val1, val2, newPath));
      } else if (val1 !== val2) {
        diffs.push({ path: newPath, type: 'modified', oldValue: val1, newValue: val2 });
      }
    }

    return diffs;
  }

  protected formatValue(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
