import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { TableEditorService, OutputFormat } from './table-editor.service';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-table-editor',
  imports: [FormsModule],
  templateUrl: './table-editor.html',
  styleUrl: './table-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEditor {
  protected readonly svc = inject(TableEditorService);
  private readonly snackbar = inject(SnackbarService);

  @ViewChild('pasteArea') pasteAreaRef?: ElementRef<HTMLTextAreaElement>;

  protected readonly rowCount = signal(5);
  protected readonly colCount = signal(5);
  protected readonly showPasteInput = signal(false);
  protected readonly pasteText = signal('');
  protected readonly showMarkdownImport = signal(false);
  protected readonly markdownImportText = signal('');

  protected readonly outputFormats: { value: OutputFormat; label: string }[] = [
    { value: 'markdown', label: 'Markdown' },
    { value: 'html', label: 'HTML' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'toml', label: 'TOML' },
    { value: 'jira', label: 'Jira' },
    { value: 'latex', label: 'LaTeX' },
    { value: 'ascii', label: 'ASCII' },
  ];

  protected readonly rows = computed(() => this.svc.data());
  protected readonly outputText = computed(() => this.svc.output());
  protected readonly selectedFormat = computed(() => this.svc.outputFormat());

  constructor() {
    this.syncSize();
  }

  private syncSize(): void {
    const d = this.svc.data();
    this.rowCount.set(d.length);
    this.colCount.set(d[0]?.length ?? 1);
  }

  protected applySize(): void {
    const r = Math.max(1, Math.min(this.rowCount(), 100));
    const c = Math.max(1, Math.min(this.colCount(), 100));
    this.rowCount.set(r);
    this.colCount.set(c);
    this.svc.resize(r, c);
  }

  protected onCellInput(row: number, col: number, event: Event): void {
    const el = event.target as HTMLInputElement;
    this.svc.setCell(row, col, el.value);
  }

  protected onCellFocus(): void {
    // Push history on first edit after focus
    this.svc.pushHistory();
  }

  protected onCellKeydown(event: KeyboardEvent, row: number, col: number): void {
    const data = this.svc.data();
    const maxRow = data.length - 1;
    const maxCol = data[0].length - 1;
    let nextRow = row;
    let nextCol = col;

    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        nextCol = col - 1;
        if (nextCol < 0) {
          nextCol = maxCol;
          nextRow = row - 1;
        }
      } else {
        nextCol = col + 1;
        if (nextCol > maxCol) {
          nextCol = 0;
          nextRow = row + 1;
        }
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      nextRow = event.shiftKey ? row - 1 : row + 1;
    } else if (event.key === 'ArrowDown' && event.ctrlKey) {
      event.preventDefault();
      nextRow = row + 1;
    } else if (event.key === 'ArrowUp' && event.ctrlKey) {
      event.preventDefault();
      nextRow = row - 1;
    } else if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
      event.preventDefault();
      this.svc.undo();
      this.syncSize();
      return;
    } else if (
      (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) ||
      (event.key === 'y' && (event.ctrlKey || event.metaKey))
    ) {
      event.preventDefault();
      this.svc.redo();
      this.syncSize();
      return;
    } else {
      return;
    }

    nextRow = Math.max(0, Math.min(nextRow, maxRow));
    nextCol = Math.max(0, Math.min(nextCol, maxCol));
    this.focusCell(nextRow, nextCol);
  }

  private focusCell(row: number, col: number): void {
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(
        `input[data-row="${row}"][data-col="${col}"]`,
      );
      el?.focus();
    }, 0);
  }

  protected onCellPaste(event: ClipboardEvent, row: number, col: number): void {
    const text = event.clipboardData?.getData('text/plain');
    if (!text) return;

    // If pasting multi-line/multi-cell data, handle it specially
    if (text.includes('\t') || text.includes('\n')) {
      event.preventDefault();
      this.svc.pushHistory();

      const lines = text.split('\n').filter((l) => l.length > 0);
      const pastedRows = lines.map((l) => l.split('\t'));

      const data = this.svc.data();
      const newData = data.map((r) => [...r]);

      // Expand grid if needed
      const neededRows = row + pastedRows.length;
      const neededCols = Math.max(...pastedRows.map((r) => col + r.length));
      while (newData.length < neededRows) {
        newData.push(Array(newData[0]?.length ?? 1).fill(''));
      }
      const finalCols = Math.max(newData[0]?.length ?? 1, neededCols);
      for (const r of newData) {
        while (r.length < finalCols) r.push('');
      }

      for (let ri = 0; ri < pastedRows.length; ri++) {
        for (let ci = 0; ci < pastedRows[ri].length; ci++) {
          if (row + ri < newData.length && col + ci < newData[0].length) {
            newData[row + ri][col + ci] = pastedRows[ri][ci];
          }
        }
      }
      this.svc.data.set(newData);
      this.syncSize();
    }
  }

  protected undo(): void {
    this.svc.undo();
    this.syncSize();
  }

  protected redo(): void {
    this.svc.redo();
    this.syncSize();
  }

  protected transpose(): void {
    this.svc.transpose();
    this.syncSize();
  }

  protected toUpperCase(): void {
    this.svc.toUpperCase();
  }

  protected toLowerCase(): void {
    this.svc.toLowerCase();
  }

  protected capitalize(): void {
    this.svc.capitalize();
  }

  protected removeDuplicates(): void {
    this.svc.removeDuplicateRows();
    this.syncSize();
    this.snackbar.success('Duplicate rows removed');
  }

  protected deleteBlankRows(): void {
    this.svc.deleteBlankRows();
    this.syncSize();
    this.snackbar.success('Blank rows removed');
  }

  protected deleteBlankCols(): void {
    this.svc.deleteBlankColumns();
    this.syncSize();
    this.snackbar.success('Blank columns removed');
  }

  protected clearTable(): void {
    this.svc.clearTable();
    this.snackbar.info('Table cleared');
  }

  protected setFormat(fmt: OutputFormat): void {
    this.svc.outputFormat.set(fmt);
  }

  protected togglePasteInput(): void {
    this.showPasteInput.update((v) => !v);
    if (this.showPasteInput()) {
      this.showMarkdownImport.set(false);
    }
  }

  protected toggleMarkdownImport(): void {
    this.showMarkdownImport.update((v) => !v);
    if (this.showMarkdownImport()) {
      this.showPasteInput.set(false);
    }
  }

  protected applyPaste(): void {
    const text = this.pasteText().trim();
    if (!text) return;
    this.svc.loadFromPaste(text);
    this.syncSize();
    this.pasteText.set('');
    this.showPasteInput.set(false);
    this.snackbar.success('Data loaded into table');
  }

  protected applyMarkdownImport(): void {
    const text = this.markdownImportText().trim();
    if (!text) return;
    this.svc.loadFromPaste(text);
    this.syncSize();
    this.markdownImportText.set('');
    this.showMarkdownImport.set(false);
    this.snackbar.success('Markdown table imported');
  }

  protected async copyOutput(): Promise<void> {
    const text = this.outputText();
    if (!text) {
      this.snackbar.warning('Nothing to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.snackbar.success('Copied to clipboard!');
    } catch {
      this.snackbar.error('Failed to copy');
    }
  }

  protected downloadOutput(): void {
    const text = this.outputText();
    if (!text) {
      this.snackbar.warning('Nothing to download');
      return;
    }
    const ext = this.getFileExtension();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackbar.success(`Downloaded table.${ext}`);
  }

  private getFileExtension(): string {
    const fmt = this.svc.outputFormat();
    const extMap: Record<OutputFormat, string> = {
      markdown: 'md',
      csv: 'csv',
      html: 'html',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      toml: 'toml',
      jira: 'txt',
      latex: 'tex',
      ascii: 'txt',
    };
    return extMap[fmt];
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  protected getColumnLabel(index: number): string {
    let label = '';
    let n = index;
    do {
      label = String.fromCharCode(65 + (n % 26)) + label;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return label;
  }
}
