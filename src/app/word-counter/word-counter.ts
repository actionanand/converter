import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-word-counter',
  imports: [FormsModule],
  templateUrl: './word-counter.html',
  styleUrl: './word-counter.scss',
})
export class WordCounter {
  protected readonly text = signal('');

  protected readonly stats = computed(() => {
    const content = this.text();
    const trimmedContent = content.trim();

    return {
      characters: content.length,
      charactersNoSpaces: content.replace(/\s/g, '').length,
      words: trimmedContent ? trimmedContent.split(/\s+/).length : 0,
      lines: content.split('\n').length,
      paragraphs: trimmedContent
        ? trimmedContent.split(/\n\s*\n/).filter((p) => p.trim()).length
        : 0,
      sentences: trimmedContent ? (trimmedContent.match(/[.!?]+/g) || []).length : 0,
      readingTime: this.calculateReadingTime(trimmedContent),
      averageWordLength: this.calculateAverageWordLength(trimmedContent),
    };
  });

  protected readonly topWords = computed(() => {
    const content = this.text().toLowerCase();
    const words = content.match(/\b[a-z]+\b/g) || [];

    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      if (word.length > 3) {
        // Only count words longer than 3 characters
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
  });

  protected clearText(): void {
    this.text.set('');
  }

  protected loadSample(): void {
    this.text.set(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n' +
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\n' +
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    );
  }

  private calculateReadingTime(text: string): string {
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 words per minute
    return `${minutes} min`;
  }

  private calculateAverageWordLength(text: string): number {
    const words = text.match(/\b[a-z]+\b/gi) || [];
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return Math.round((totalLength / words.length) * 10) / 10;
  }
}
