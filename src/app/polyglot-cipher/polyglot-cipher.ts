import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PolyglotCipherService } from './polyglot-cipher.service';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-polyglot-cipher',
  imports: [FormsModule],
  templateUrl: './polyglot-cipher.html',
  styleUrl: './polyglot-cipher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolyglotCipher {
  private readonly cipherService = inject(PolyglotCipherService);
  private readonly snackbarService = inject(SnackbarService);

  protected readonly mode = signal<'encode' | 'decode'>('encode');
  protected readonly inputText = signal('');
  protected readonly secretKey = signal('');

  protected readonly outputText = computed(() => {
    const text = this.inputText();
    const key = this.secretKey();
    if (!text || !key) return '';
    return this.mode() === 'encode'
      ? this.cipherService.encode(text, key)
      : this.cipherService.decode(text, key);
  });

  protected readonly stats = computed(() => {
    const input = this.inputText();
    const output = this.outputText();
    return {
      inputLength: input.length,
      outputLength: output.length,
      inputWords: input.trim() ? input.trim().split(/\s+/).length : 0,
      outputWords: output.trim() ? output.trim().split(/\s+/).length : 0,
    };
  });

  protected readonly inputScripts = computed(() =>
    this.cipherService.detectScripts(this.inputText()),
  );

  protected readonly outputScripts = computed(() =>
    this.cipherService.detectScripts(this.outputText()),
  );

  protected readonly poolSize = this.cipherService.poolSize;
  protected readonly supportedScripts = this.cipherService.supportedScripts;

  protected copyOutput(): void {
    const output = this.outputText();
    if (output) {
      navigator.clipboard.writeText(output);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }

  protected swapMode(): void {
    const currentOutput = this.outputText();
    const newMode = this.mode() === 'encode' ? 'decode' : 'encode';
    this.mode.set(newMode);
    if (currentOutput) {
      this.inputText.set(currentOutput);
    }
  }

  protected clearAll(): void {
    this.inputText.set('');
    this.secretKey.set('');
  }

  protected loadSample(): void {
    this.mode.set('encode');
    this.inputText.set('Hello World! வணக்கம் ನಮಸ್ಕಾರ नमस्ते - Grüße, ñoño, ā, ū, ṇ');
    this.secretKey.set('polyglot-secret-2024');
  }
}
