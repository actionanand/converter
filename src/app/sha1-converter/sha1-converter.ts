import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sha1-converter',
  imports: [FormsModule],
  templateUrl: './sha1-converter.html',
  styleUrl: './sha1-converter.scss',
})
export class Sha1Converter {
  protected readonly inputText = signal('');
  protected readonly sha1Result = signal('');

  protected async convertToSha1(): Promise<void> {
    const text = this.inputText();

    if (!text) {
      this.sha1Result.set('');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      this.sha1Result.set(hashHex);
    } catch (error) {
      console.error('Error generating SHA1:', error);
      this.sha1Result.set('Error generating SHA1');
    }
  }

  protected copyToClipboard(): void {
    if (!this.sha1Result()) return;

    navigator.clipboard.writeText(this.sha1Result()).then(
      () => {
        alert('SHA1 hash copied to clipboard!');
      },
      () => {
        alert('Failed to copy to clipboard');
      },
    );
  }

  protected reset(): void {
    this.inputText.set('');
    this.sha1Result.set('');
  }
}
