import { Injectable, signal, computed } from '@angular/core';

export type OutputFormat =
  | 'markdown'
  | 'csv'
  | 'html'
  | 'json'
  | 'xml'
  | 'yaml'
  | 'toml'
  | 'jira'
  | 'latex'
  | 'ascii';

interface HistoryEntry {
  data: string[][];
}

@Injectable({
  providedIn: 'root',
})
export class TableEditorService {
  private readonly maxHistory = 50;

  readonly data = signal<string[][]>(this.createEmptyGrid(5, 5));
  readonly outputFormat = signal<OutputFormat>('markdown');

  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  readonly canUndo = signal(false);
  readonly canRedo = signal(false);

  readonly output = computed(() => {
    const d = this.data();
    const fmt = this.outputFormat();
    return this.convert(d, fmt);
  });

  createEmptyGrid(rows: number, cols: number): string[][] {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
  }

  pushHistory(): void {
    const snapshot = this.data().map((r) => [...r]);
    this.undoStack.push({ data: snapshot });
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.canUndo.set(true);
    this.canRedo.set(false);
  }

  undo(): void {
    if (this.undoStack.length === 0) return;
    const current = this.data().map((r) => [...r]);
    this.redoStack.push({ data: current });
    const prev = this.undoStack.pop()!;
    this.data.set(prev.data);
    this.canUndo.set(this.undoStack.length > 0);
    this.canRedo.set(true);
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    const current = this.data().map((r) => [...r]);
    this.undoStack.push({ data: current });
    const next = this.redoStack.pop()!;
    this.data.set(next.data);
    this.canRedo.set(this.redoStack.length > 0);
    this.canUndo.set(true);
  }

  setCell(row: number, col: number, value: string): void {
    this.data.update((d) => {
      const copy = d.map((r) => [...r]);
      if (copy[row] && col < copy[row].length) {
        copy[row][col] = value;
      }
      return copy;
    });
  }

  resize(rows: number, cols: number): void {
    this.pushHistory();
    const current = this.data();
    const newData: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(current[r]?.[c] ?? '');
      }
      newData.push(row);
    }
    this.data.set(newData);
  }

  transpose(): void {
    this.pushHistory();
    const d = this.data();
    if (d.length === 0) return;
    const rows = d.length;
    const cols = d[0].length;
    const transposed: string[][] = [];
    for (let c = 0; c < cols; c++) {
      const row: string[] = [];
      for (let r = 0; r < rows; r++) {
        row.push(d[r][c] ?? '');
      }
      transposed.push(row);
    }
    this.data.set(transposed);
  }

  toUpperCase(): void {
    this.pushHistory();
    this.data.update((d) => d.map((r) => r.map((c) => c.toUpperCase())));
  }

  toLowerCase(): void {
    this.pushHistory();
    this.data.update((d) => d.map((r) => r.map((c) => c.toLowerCase())));
  }

  capitalize(): void {
    this.pushHistory();
    this.data.update((d) =>
      d.map((r) =>
        r.map((c) =>
          c
            .split(' ')
            .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
            .join(' '),
        ),
      ),
    );
  }

  removeDuplicateRows(): void {
    this.pushHistory();
    const d = this.data();
    const seen = new Set<string>();
    const result: string[][] = [];
    for (const row of d) {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        result.push([...row]);
      }
    }
    this.data.set(result.length > 0 ? result : this.createEmptyGrid(1, d[0]?.length ?? 1));
  }

  deleteBlankRows(): void {
    this.pushHistory();
    const d = this.data();
    const result = d.filter((row) => row.some((cell) => cell.trim() !== ''));
    this.data.set(result.length > 0 ? result : this.createEmptyGrid(1, d[0]?.length ?? 1));
  }

  deleteBlankColumns(): void {
    this.pushHistory();
    const d = this.data();
    if (d.length === 0) return;
    const cols = d[0].length;
    const nonBlankCols: number[] = [];
    for (let c = 0; c < cols; c++) {
      if (d.some((row) => (row[c] ?? '').trim() !== '')) {
        nonBlankCols.push(c);
      }
    }
    if (nonBlankCols.length === 0) {
      this.data.set(this.createEmptyGrid(d.length, 1));
      return;
    }
    this.data.set(d.map((row) => nonBlankCols.map((c) => row[c] ?? '')));
  }

  clearTable(): void {
    this.pushHistory();
    const d = this.data();
    this.data.set(this.createEmptyGrid(d.length, d[0]?.length ?? 1));
  }

  loadFromPaste(text: string): void {
    this.pushHistory();
    const lines = text.split('\n').filter((l) => l.length > 0);
    if (lines.length === 0) return;

    let rows: string[][];

    // Detect tab-separated
    if (lines[0].includes('\t')) {
      rows = lines.map((l) => l.split('\t'));
    }
    // Detect comma-separated
    else if (lines[0].includes(',')) {
      rows = lines.map((l) => this.parseCSVLine(l));
    }
    // Detect markdown table
    else if (lines[0].includes('|')) {
      rows = this.parseMarkdownTable(text);
    } else {
      rows = lines.map((l) => [l]);
    }

    // Normalize column count
    const maxCols = Math.max(...rows.map((r) => r.length));
    rows = rows.map((r) => {
      while (r.length < maxCols) r.push('');
      return r;
    });

    this.data.set(rows);
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  private parseMarkdownTable(text: string): string[][] {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const rows: string[][] = [];
    for (const line of lines) {
      // Skip separator lines (|---|---|)
      if (/^\|?[\s\-:|]+\|?$/.test(line)) continue;
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((_, i, arr) => {
          // filter empty first/last from leading/trailing pipes
          if (i === 0 && arr[i] === '') return false;
          if (i === arr.length - 1 && arr[i] === '') return false;
          return true;
        });
      if (cells.length > 0) rows.push(cells);
    }
    return rows;
  }

  convert(data: string[][], format: OutputFormat): string {
    // Filter out completely empty tables
    const hasContent = data.some((r) => r.some((c) => c.trim() !== ''));
    if (!hasContent) return '';

    switch (format) {
      case 'markdown':
        return this.toMarkdown(data);
      case 'csv':
        return this.toCSV(data);
      case 'html':
        return this.toHTML(data);
      case 'json':
        return this.toJSON(data);
      case 'xml':
        return this.toXML(data);
      case 'yaml':
        return this.toYAML(data);
      case 'toml':
        return this.toTOML(data);
      case 'jira':
        return this.toJira(data);
      case 'latex':
        return this.toLaTeX(data);
      case 'ascii':
        return this.toASCII(data);
    }
  }

  private toMarkdown(data: string[][]): string {
    if (data.length === 0) return '';
    const header = data[0];
    const colWidths = header.map((_, ci) => Math.max(3, ...data.map((r) => (r[ci] ?? '').length)));
    const headerLine = '| ' + header.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';
    const sepLine = '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |';
    const bodyLines = data
      .slice(1)
      .map((row) => '| ' + row.map((c, i) => c.padEnd(colWidths[i])).join(' | ') + ' |');
    return [headerLine, sepLine, ...bodyLines].join('\n');
  }

  private toCSV(data: string[][]): string {
    return data
      .map((row) =>
        row
          .map((cell) => {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return '"' + cell.replace(/"/g, '""') + '"';
            }
            return cell;
          })
          .join(','),
      )
      .join('\n');
  }

  private toHTML(data: string[][]): string {
    const indent = '  ';
    let html = '<table>\n';
    if (data.length > 0) {
      html += `${indent}<thead>\n${indent}${indent}<tr>\n`;
      for (const cell of data[0]) {
        html += `${indent}${indent}${indent}<th>${this.escapeHtml(cell)}</th>\n`;
      }
      html += `${indent}${indent}</tr>\n${indent}</thead>\n`;
    }
    if (data.length > 1) {
      html += `${indent}<tbody>\n`;
      for (let r = 1; r < data.length; r++) {
        html += `${indent}${indent}<tr>\n`;
        for (const cell of data[r]) {
          html += `${indent}${indent}${indent}<td>${this.escapeHtml(cell)}</td>\n`;
        }
        html += `${indent}${indent}</tr>\n`;
      }
      html += `${indent}</tbody>\n`;
    }
    html += '</table>';
    return html;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private toJSON(data: string[][]): string {
    if (data.length < 2) {
      return JSON.stringify(data, null, 2);
    }
    const headers = data[0];
    const objects = data.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h || `col${i + 1}`] = row[i] ?? '';
      });
      return obj;
    });
    return JSON.stringify(objects, null, 2);
  }

  private toXML(data: string[][]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<table>\n';
    const headers = data[0] ?? [];
    const rows = data.length > 1 ? data.slice(1) : [];
    for (const row of rows) {
      xml += '  <row>\n';
      row.forEach((cell, i) => {
        const tag = this.xmlSafeTag(headers[i] || `col${i + 1}`);
        xml += `    <${tag}>${this.escapeHtml(cell)}</${tag}>\n`;
      });
      xml += '  </row>\n';
    }
    xml += '</table>';
    return xml;
  }

  private xmlSafeTag(name: string): string {
    let tag = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!/^[a-zA-Z_]/.test(tag)) tag = '_' + tag;
    return tag;
  }

  private toYAML(data: string[][]): string {
    if (data.length < 2) return '';
    const headers = data[0];
    const lines: string[] = [];
    for (const row of data.slice(1)) {
      lines.push('- ' + (headers[0] || 'col1') + ': ' + this.yamlValue(row[0] ?? ''));
      for (let i = 1; i < headers.length; i++) {
        lines.push('  ' + (headers[i] || `col${i + 1}`) + ': ' + this.yamlValue(row[i] ?? ''));
      }
    }
    return lines.join('\n');
  }

  private yamlValue(val: string): string {
    if (val === '') return '""';
    if (/[:#{}[\],&*?|>!%@`]/.test(val) || val.includes('\n')) {
      return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    }
    return val;
  }

  private toTOML(data: string[][]): string {
    if (data.length < 2) return '';
    const headers = data[0];
    const lines: string[] = [];
    data.slice(1).forEach((row, idx) => {
      lines.push(`[[rows]]`);
      headers.forEach((h, i) => {
        const key = (h || `col${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        lines.push(`${key} = "${(row[i] ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
      });
      if (idx < data.length - 2) lines.push('');
    });
    return lines.join('\n');
  }

  private toJira(data: string[][]): string {
    if (data.length === 0) return '';
    const headerLine = '|| ' + data[0].join(' || ') + ' ||';
    const bodyLines = data.slice(1).map((row) => '| ' + row.join(' | ') + ' |');
    return [headerLine, ...bodyLines].join('\n');
  }

  private toLaTeX(data: string[][]): string {
    if (data.length === 0) return '';
    const cols = data[0].length;
    const colSpec = Array(cols).fill('l').join(' ');
    let tex = `\\begin{tabular}{${colSpec}}\n`;
    tex += '\\hline\n';
    data.forEach((row, ri) => {
      tex += row.map((c) => this.escapeLatex(c)).join(' & ') + ' \\\\\n';
      if (ri === 0) tex += '\\hline\n';
    });
    tex += '\\hline\n';
    tex += '\\end{tabular}';
    return tex;
  }

  private escapeLatex(str: string): string {
    return str.replace(/\\/g, '\\textbackslash{}').replace(/[&%$#_{}~^]/g, (m) => '\\' + m);
  }

  private toASCII(data: string[][]): string {
    if (data.length === 0) return '';
    const cols = data[0].length;
    const colWidths: number[] = [];
    for (let c = 0; c < cols; c++) {
      colWidths.push(Math.max(3, ...data.map((r) => (r[c] ?? '').length)));
    }
    const sep = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
    const lines = [sep];
    data.forEach((row, ri) => {
      lines.push('| ' + row.map((c, ci) => c.padEnd(colWidths[ci])).join(' | ') + ' |');
      if (ri === 0) lines.push(sep.replace(/-/g, '=').replace(/\+/g, '+'));
      else lines.push(sep);
    });
    return lines.join('\n');
  }
}
