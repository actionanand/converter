import { Injectable } from '@angular/core';

interface ScriptDefinition {
  name: string;
  ranges: [number, number][];
}

@Injectable({ providedIn: 'root' })
export class PolyglotCipherService {
  private readonly letterPool: string[];
  private readonly letterIndexMap: Map<string, number>;
  private readonly isLetterRegex = /^\p{Letter}$/u;

  private static readonly SCRIPT_DEFINITIONS: ScriptDefinition[] = [
    {
      name: 'Latin',
      ranges: [
        [0x0041, 0x005a],
        [0x0061, 0x007a],
        [0x00c0, 0x024f],
        [0x1e00, 0x1eff],
      ],
    },
    { name: 'Devanagari', ranges: [[0x0900, 0x097f]] },
    { name: 'Bengali', ranges: [[0x0980, 0x09ff]] },
    { name: 'Gurmukhi', ranges: [[0x0a00, 0x0a7f]] },
    { name: 'Gujarati', ranges: [[0x0a80, 0x0aff]] },
    { name: 'Oriya', ranges: [[0x0b00, 0x0b7f]] },
    { name: 'Tamil', ranges: [[0x0b80, 0x0bff]] },
    { name: 'Telugu', ranges: [[0x0c00, 0x0c7f]] },
    { name: 'Kannada', ranges: [[0x0c80, 0x0cff]] },
    { name: 'Malayalam', ranges: [[0x0d00, 0x0d7f]] },
  ];

  constructor() {
    this.letterPool = this.buildLetterPool();
    this.letterIndexMap = new Map();
    this.letterPool.forEach((letter, index) => {
      this.letterIndexMap.set(letter, index);
    });
  }

  get poolSize(): number {
    return this.letterPool.length;
  }

  get supportedScripts(): string[] {
    return PolyglotCipherService.SCRIPT_DEFINITIONS.map((s) => s.name);
  }

  /**
   * 4-layer encode: Substitution → Positional Shift → Substitution → Feedback Shift
   */
  encode(text: string, key: string): string {
    if (!text || !key) return '';
    const subKeys = this.deriveSubKeys(key, 4);
    let result = text;
    result = this.applySubstitution(result, subKeys[0], 'encode');
    result = this.applyPositionalShift(result, subKeys[1], 'encode');
    result = this.applySubstitution(result, subKeys[2], 'encode');
    result = this.applyFeedbackShift(result, subKeys[3], 'encode');
    return result;
  }

  /**
   * 4-layer decode: Inverse Feedback → Inverse Substitution → Inverse Shift → Inverse Substitution
   */
  decode(text: string, key: string): string {
    if (!text || !key) return '';
    const subKeys = this.deriveSubKeys(key, 4);
    let result = text;
    result = this.applyFeedbackShift(result, subKeys[3], 'decode');
    result = this.applySubstitution(result, subKeys[2], 'decode');
    result = this.applyPositionalShift(result, subKeys[1], 'decode');
    result = this.applySubstitution(result, subKeys[0], 'decode');
    return result;
  }

  detectScripts(text: string): string[] {
    const found = new Set<string>();
    for (const char of text) {
      const cp = char.codePointAt(0)!;
      for (const script of PolyglotCipherService.SCRIPT_DEFINITIONS) {
        if (script.ranges.some(([start, end]) => cp >= start && cp <= end)) {
          found.add(script.name);
          break;
        }
      }
    }
    return [...found];
  }

  // --- Internal machinery ---

  private buildLetterPool(): string[] {
    const letters: string[] = [];
    const seen = new Set<string>();
    for (const script of PolyglotCipherService.SCRIPT_DEFINITIONS) {
      for (const [start, end] of script.ranges) {
        for (let cp = start; cp <= end; cp++) {
          const char = String.fromCodePoint(cp);
          if (!seen.has(char) && this.isLetterRegex.test(char)) {
            letters.push(char);
            seen.add(char);
          }
        }
      }
    }
    return letters;
  }

  /**
   * Derive N independent sub-keys from the master key using cross-mixed hashing.
   */
  private deriveSubKeys(key: string, count: number): number[] {
    const keys: number[] = [];
    const primes = [31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
    for (let i = 0; i < count; i++) {
      let h1 = 0xdeadbeef ^ (i * 0x12345678);
      let h2 = 0x41c6ce57 ^ (i * 0x87654321);
      for (let j = 0; j < key.length; j++) {
        const ch = key.charCodeAt(j);
        h1 = Math.imul(h1 ^ ch, primes[j % primes.length] * (i + 1));
        h2 = Math.imul(h2 ^ ch, primes[(j + i) % primes.length]);
        h1 ^= h2 >>> 17;
        h2 ^= h1 >>> 13;
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
      h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
      h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      keys.push((h1 ^ h2) >>> 0);
    }
    return keys;
  }

  /** Mulberry32 PRNG — good distribution, fast, deterministic. */
  private createPRNG(seed: number): () => number {
    let state = seed | 0;
    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private generatePermutation(seed: number): number[] {
    const n = this.letterPool.length;
    const perm = Array.from({ length: n }, (_, i) => i);
    const rng = this.createPRNG(seed);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return perm;
  }

  private invertPermutation(perm: number[]): number[] {
    const inv = new Array<number>(perm.length);
    for (let i = 0; i < perm.length; i++) {
      inv[perm[i]] = i;
    }
    return inv;
  }

  /**
   * Layer 1 & 3 — Key-derived permutation maps every letter to another across all scripts.
   */
  private applySubstitution(text: string, seed: number, mode: 'encode' | 'decode'): string {
    const perm = this.generatePermutation(seed);
    const mapping = mode === 'encode' ? perm : this.invertPermutation(perm);
    const chars = [...text];
    return chars
      .map((char) => {
        const idx = this.letterIndexMap.get(char);
        if (idx === undefined) return char;
        return this.letterPool[mapping[idx]];
      })
      .join('');
  }

  /**
   * Layer 2 — Each character position gets a unique PRNG-derived shift within the pool.
   * PRNG advances ONLY for letter characters so that non-letter markdown syntax
   * (# | > * etc.) stripped by the HTML renderer does not corrupt stream position.
   */
  private applyPositionalShift(text: string, seed: number, mode: 'encode' | 'decode'): string {
    const rng = this.createPRNG(seed);
    const n = this.letterPool.length;
    const chars = [...text];
    return chars
      .map((char) => {
        const idx = this.letterIndexMap.get(char);
        if (idx === undefined) return char; // non-letter: pass through, do NOT advance PRNG
        const shift = Math.floor(rng() * n); // advance PRNG only for letters
        if (mode === 'encode') {
          return this.letterPool[(idx + shift) % n];
        }
        return this.letterPool[(((idx - shift) % n) + n) % n];
      })
      .join('');
  }

  /**
   * Layer 4 — Feedback cipher. PRNG and feedback state advance ONLY for letter
   * characters so that non-letter chars stripped by the HTML renderer do not
   * corrupt the cipher stream when decoding DOM text nodes.
   */
  private applyFeedbackShift(text: string, seed: number, mode: 'encode' | 'decode'): string {
    const rng = this.createPRNG(seed);
    const n = this.letterPool.length;
    const chars = [...text];
    let prev = seed % n;
    const result: string[] = [];

    for (const char of chars) {
      const idx = this.letterIndexMap.get(char);

      if (idx === undefined) {
        result.push(char); // non-letter: pass through, do NOT advance PRNG or feedback
        continue;
      }

      const baseShift = Math.floor(rng() * n); // advance only for letters

      const totalShift = (baseShift + prev) % n;

      if (mode === 'encode') {
        const newIdx = (idx + totalShift) % n;
        result.push(this.letterPool[newIdx]);
        prev = newIdx;
      } else {
        const originalIdx = (((idx - totalShift) % n) + n) % n;
        result.push(this.letterPool[originalIdx]);
        prev = idx;
      }
    }

    return result.join('');
  }
}
