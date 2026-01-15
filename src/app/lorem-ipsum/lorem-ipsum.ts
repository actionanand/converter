import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-lorem-ipsum',
  imports: [FormsModule],
  templateUrl: './lorem-ipsum.html',
  styleUrl: './lorem-ipsum.scss',
})
export class LoremIpsum {
  private readonly snackbarService = inject(SnackbarService);

  protected readonly paragraphCount = signal(3);
  protected readonly wordsPerParagraph = signal(50);
  protected readonly startWithLorem = signal(true);
  protected readonly generatedText = signal('');

  private readonly loremWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
  ];

  protected readonly stats = computed(() => {
    const text = this.generatedText();
    return {
      characters: text.length,
      words: text ? text.split(/\s+/).length : 0,
      paragraphs: text ? text.split('\n\n').filter((p) => p.trim()).length : 0,
    };
  });

  protected generate(): void {
    const paragraphs: string[] = [];
    const paragraphsToGenerate = this.paragraphCount();
    const wordsPerPara = this.wordsPerParagraph();

    for (let i = 0; i < paragraphsToGenerate; i++) {
      const words: string[] = [];

      // First paragraph starts with "Lorem ipsum" if the option is enabled
      if (i === 0 && this.startWithLorem()) {
        words.push('Lorem', 'ipsum');
      }

      while (words.length < wordsPerPara) {
        const randomWord = this.loremWords[Math.floor(Math.random() * this.loremWords.length)];
        words.push(randomWord);
      }

      // Capitalize first letter and add period at the end
      let paragraph = words.join(' ');
      paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1) + '.';

      paragraphs.push(paragraph);
    }

    this.generatedText.set(paragraphs.join('\n\n'));
    this.snackbarService.show('Lorem ipsum generated!', 'success');
  }

  protected copyText(): void {
    const text = this.generatedText();
    if (text) {
      navigator.clipboard.writeText(text);
      this.snackbarService.show('Text copied to clipboard!', 'success');
    }
  }

  protected clearText(): void {
    this.generatedText.set('');
  }
}
