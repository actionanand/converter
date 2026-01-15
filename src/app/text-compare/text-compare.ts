import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  text: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

@Component({
  selector: 'app-text-compare',
  imports: [FormsModule],
  templateUrl: './text-compare.html',
  styleUrl: './text-compare.scss',
})
export class TextCompare {
  protected readonly text1 = signal('');
  protected readonly text2 = signal('');
  protected readonly viewMode = signal<'side-by-side' | 'inline'>('side-by-side');

  protected readonly stats = computed(() => {
    const t1 = this.text1();
    const t2 = this.text2();

    return {
      text1Lines: t1.split('\n').length,
      text2Lines: t2.split('\n').length,
      text1Chars: t1.length,
      text2Chars: t2.length,
      text1Words: t1.trim() ? t1.trim().split(/\s+/).length : 0,
      text2Words: t2.trim() ? t2.trim().split(/\s+/).length : 0,
    };
  });

  protected readonly diff = computed(() => {
    const lines1 = this.text1().split('\n');
    const lines2 = this.text2().split('\n');
    return this.computeDiff(lines1, lines2);
  });

  protected readonly diffStats = computed(() => {
    const diffs = this.diff();
    return {
      equal: diffs.filter((d) => d.type === 'equal').length,
      added: diffs.filter((d) => d.type === 'added').length,
      removed: diffs.filter((d) => d.type === 'removed').length,
    };
  });

  protected swapTexts(): void {
    const temp = this.text1();
    this.text1.set(this.text2());
    this.text2.set(temp);
  }

  protected clearAll(): void {
    this.text1.set('');
    this.text2.set('');
  }

  protected loadSample(): void {
    this.text1.set('Hello World\nThis is a test\nLine three\nFinal line');
    this.text2.set('Hello World\nThis is a demo\nLine three\nNew final line\nExtra line');
  }

  private computeDiff(lines1: string[], lines2: string[]): DiffLine[] {
    const result: DiffLine[] = [];
    const matrix: number[][] = [];

    // LCS algorithm
    for (let i = 0; i <= lines1.length; i++) {
      matrix[i] = [];
      for (let j = 0; j <= lines2.length; j++) {
        if (i === 0 || j === 0) {
          matrix[i][j] = 0;
        } else if (lines1[i - 1] === lines2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff
    let i = lines1.length;
    let j = lines2.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        result.unshift({
          type: 'equal',
          text: lines1[i - 1],
          lineNumber1: i,
          lineNumber2: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        result.unshift({
          type: 'added',
          text: lines2[j - 1],
          lineNumber2: j,
        });
        j--;
      } else if (i > 0) {
        result.unshift({
          type: 'removed',
          text: lines1[i - 1],
          lineNumber1: i,
        });
        i--;
      }
    }

    return result;
  }
}
