import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-cipher',
  imports: [FormsModule],
  templateUrl: './cipher.html',
  styleUrl: './cipher.scss',
})
export class Cipher {
  private readonly snackbarService = inject(SnackbarService);

  protected readonly mode = signal<'encode' | 'decode'>('encode');
  protected readonly inputText = signal('');
  protected readonly secretKey = signal('');
  protected readonly outputText = computed(() => {
    const text = this.inputText();
    const key = this.secretKey();

    if (!text || !key) return '';

    if (this.mode() === 'encode') {
      return this.encode(text, key);
    } else {
      return this.decode(text, key);
    }
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

  private encode(text: string, key: string): string {
    const shuffledAlphabet = this.generateShuffledAlphabet(key);
    return this.transform(text, this.normalAlphabet(), shuffledAlphabet);
  }

  private decode(text: string, key: string): string {
    const shuffledAlphabet = this.generateShuffledAlphabet(key);
    return this.transform(text, shuffledAlphabet, this.normalAlphabet());
  }

  private transform(text: string, fromAlphabet: string, toAlphabet: string): string {
    return text
      .split('')
      .map((char) => {
        const lowerChar = char.toLowerCase();
        const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
        const index = fromAlphabet.indexOf(lowerChar);

        if (index === -1) {
          // Not a letter, keep as is
          return char;
        }

        const transformedChar = toAlphabet[index];
        return isUpper ? transformedChar.toUpperCase() : transformedChar;
      })
      .join('');
  }

  private normalAlphabet(): string {
    return 'abcdefghijklmnopqrstuvwxyz';
  }

  private generateShuffledAlphabet(key: string): string {
    if (!key) return this.normalAlphabet();

    // Create a seeded random number generator from the key
    const seed = this.stringToSeed(key);
    const random = this.seededRandom(seed);

    // Start with normal alphabet
    const alphabet = this.normalAlphabet().split('');

    // Fisher-Yates shuffle with seeded random
    for (let i = alphabet.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
    }

    return alphabet.join('');
  }

  private stringToSeed(str: string): number {
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      seed = (seed << 5) - seed + char;
      seed = seed & seed; // Convert to 32-bit integer
    }
    // Ensure positive seed
    return Math.abs(seed) || 1;
  }

  private seededRandom(seed: number): () => number {
    // Linear congruential generator
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert hash to a longer string for better distribution
    return Math.abs(hash).toString(36) + str.split('').reverse().join('');
  }

  protected copyOutput(): void {
    const output = this.outputText();
    if (output) {
      navigator.clipboard.writeText(output);
      this.snackbarService.show('Copied to clipboard!', 'success');
    }
  }

  protected swapMode(): void {
    this.mode.set(this.mode() === 'encode' ? 'decode' : 'encode');
  }

  protected clearAll(): void {
    this.inputText.set('');
    this.secretKey.set('');
  }

  protected loadSample(): void {
    this.mode.set('encode');
    this.inputText.set('Hello World! This is a secret message.');
    this.secretKey.set('mysecret123');
  }

  protected readonly alphabetMapping = computed(() => {
    const key = this.secretKey();
    if (!key) return [];

    const normal = this.normalAlphabet();
    const shuffled = this.generateShuffledAlphabet(key);

    return normal.split('').map((char, index) => ({
      original: char.toUpperCase(),
      cipher: shuffled[index].toUpperCase(),
    }));
  });
}
