import { Component, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';
import { inject } from '@angular/core';

interface FaviconTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  pattern?: 'solid' | 'gradient' | 'circle' | 'rounded' | 'badge';
  gradientEnd?: string;
}

@Component({
  selector: 'app-favicon-generator',
  imports: [FormsModule],
  templateUrl: './favicon-generator.html',
  styleUrl: './favicon-generator.scss',
})
export class FaviconGenerator implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: false }) previewCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput', { static: false }) fileInputRef?: ElementRef<HTMLInputElement>;

  private readonly snackbarService = inject(SnackbarService);

  protected readonly mode = signal<'text' | 'image' | 'emoji'>('text');
  protected readonly text = signal('AI');
  protected readonly emoji = signal('🚀');
  protected readonly selectedTemplate = signal<string>('green-gradient');
  protected readonly customBgColor = signal('#10b981');
  protected readonly customTextColor = signal('#ffffff');
  protected readonly useCustomTextColor = signal(false);
  protected readonly useTransparent = signal(false);
  protected readonly size = signal<16 | 32 | 48>(32);
  protected readonly uploadedImage = signal<string | null>(null);
  protected readonly downloadFormat = signal<'png' | 'ico'>('png');
  protected readonly fontFamily = signal<string>('Arial, sans-serif');
  protected readonly combineEmojiText = signal(false);
  protected readonly emojiPosition = signal<
    'top' | 'bottom' | 'left' | 'right' | 'text-over-emoji' | 'emoji-over-text'
  >('top');

  protected readonly fontFamilies = [
    { name: 'Arial (Default)', value: 'Arial, sans-serif', style: 'normal' },
    { name: 'Arial Black (Bold)', value: '"Arial Black", sans-serif', style: 'bold' },
    { name: 'Georgia (Serif)', value: 'Georgia, serif', style: 'elegant' },
    { name: 'Courier New (Mono)', value: '"Courier New", monospace', style: 'tech' },
    { name: 'Impact (Strong)', value: 'Impact, sans-serif', style: 'strong' },
    { name: 'Comic Sans (Fun)', value: '"Comic Sans MS", cursive', style: 'playful' },
    { name: 'Verdana (Clean)', value: 'Verdana, sans-serif', style: 'clean' },
    { name: 'Times New Roman (Classic)', value: '"Times New Roman", serif', style: 'classic' },
    { name: 'Trebuchet (Modern)', value: '"Trebuchet MS", sans-serif', style: 'modern' },
    { name: 'Brush Script (Cursive)', value: '"Brush Script MT", cursive', style: 'cursive' },
    { name: 'Lucida (Rounded)', value: '"Lucida Sans", sans-serif', style: 'rounded' },
    { name: 'Palatino (Elegant)', value: '"Palatino Linotype", serif', style: 'elegant' },
  ];

  protected readonly popularEmojis = [
    '🚀',
    '⭐',
    '💡',
    '🔥',
    '💎',
    '🎯',
    '✨',
    '🌟',
    '🎨',
    '🎭',
    '🎪',
    '🎬',
    '🎮',
    '🎲',
    '🎵',
    '🎸',
    '💻',
    '📱',
    '⚡',
    '🔧',
    '🔨',
    '⚙️',
    '🛠️',
    '🔩',
    '🌈',
    '🌸',
    '🌺',
    '🌻',
    '🌼',
    '🌷',
    '🌹',
    '🏵️',
    '🍀',
    '🌿',
    '🍃',
    '🌱',
    '🌾',
    '🌴',
    '🌳',
    '🌲',
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '❤️',
    '💚',
    '💙',
    '💜',
    '🧡',
    '💛',
    '🤍',
    '🖤',
    '😀',
    '😎',
    '🤩',
    '🥳',
    '😇',
    '🤗',
    '🤓',
    '🧐',
    '😍',
    '😘',
    '🙏🏻',
    '👌🏻',
    '👍🏻',
    '🧒🏻',
    '👧🏻',
    '👶🏻',
    '👨🏻‍💻',
    '👑',
    '🌏',
    '⛅️',
    '🌙',
    '🎀',
    '🪔',
    '👻',
  ];

  protected readonly templates: FaviconTemplate[] = [
    {
      id: 'green-gradient',
      name: 'Green Gradient',
      bgColor: '#10b981',
      textColor: '#ffffff',
      pattern: 'gradient',
      gradientEnd: '#059669',
    },
    {
      id: 'green-circle',
      name: 'Green Circle',
      bgColor: '#22c55e',
      textColor: '#ffffff',
      pattern: 'circle',
    },
    {
      id: 'green-rounded',
      name: 'Green Rounded',
      bgColor: '#16a34a',
      textColor: '#ffffff',
      pattern: 'rounded',
    },
    {
      id: 'emerald-badge',
      name: 'Emerald Badge',
      bgColor: '#059669',
      textColor: '#ffffff',
      borderColor: '#d1fae5',
      pattern: 'badge',
    },
    {
      id: 'mint-fresh',
      name: 'Mint Fresh',
      bgColor: '#6ee7b7',
      textColor: '#065f46',
      pattern: 'rounded',
    },
    {
      id: 'forest-green',
      name: 'Forest Green',
      bgColor: '#047857',
      textColor: '#d1fae5',
      pattern: 'solid',
    },
    {
      id: 'lime-bright',
      name: 'Lime Bright',
      bgColor: '#84cc16',
      textColor: '#1a2e05',
      pattern: 'circle',
    },
    {
      id: 'teal-ocean',
      name: 'Teal Ocean',
      bgColor: '#14b8a6',
      textColor: '#ffffff',
      pattern: 'gradient',
      gradientEnd: '#0d9488',
    },
    {
      id: 'sage-green',
      name: 'Sage Green',
      bgColor: '#86efac',
      textColor: '#14532d',
      pattern: 'rounded',
    },
    {
      id: 'dark-green',
      name: 'Dark Green',
      bgColor: '#065f46',
      textColor: '#a7f3d0',
      pattern: 'solid',
    },
    {
      id: 'blue-gradient',
      name: 'Blue Gradient',
      bgColor: '#3b82f6',
      textColor: '#ffffff',
      pattern: 'gradient',
      gradientEnd: '#2563eb',
    },
    {
      id: 'purple-gradient',
      name: 'Purple Gradient',
      bgColor: '#8b5cf6',
      textColor: '#ffffff',
      pattern: 'gradient',
      gradientEnd: '#7c3aed',
    },
    {
      id: 'red-circle',
      name: 'Red Circle',
      bgColor: '#ef4444',
      textColor: '#ffffff',
      pattern: 'circle',
    },
    {
      id: 'orange-badge',
      name: 'Orange Badge',
      bgColor: '#f97316',
      textColor: '#ffffff',
      borderColor: '#fed7aa',
      pattern: 'badge',
    },
    {
      id: 'pink-rounded',
      name: 'Pink Rounded',
      bgColor: '#ec4899',
      textColor: '#ffffff',
      pattern: 'rounded',
    },
  ];

  protected readonly currentTemplate = computed(() => {
    return this.templates.find((t) => t.id === this.selectedTemplate());
  });

  protected readonly previewUrl = computed(() => {
    this.generatePreview();
    return '';
  });

  ngAfterViewInit(): void {
    this.generatePreview();
  }

  protected generatePreview(): void {
    setTimeout(() => {
      if (this.mode() === 'text' || this.mode() === 'emoji') {
        this.generateTextFavicon();
      } else if (this.uploadedImage()) {
        this.generateImageFavicon();
      }
    }, 0);
  }

  private generateTextFavicon(): void {
    const canvas = this.previewCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 128; // Preview size
    canvas.width = size;
    canvas.height = size;

    const template = this.currentTemplate();
    const text = this.text() || 'A';
    const displayText = text.substring(0, 2).toUpperCase();

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    if (this.useTransparent()) {
      // Transparent background
      ctx.fillStyle = 'transparent';
    } else if (template?.pattern === 'gradient' && template.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, template.bgColor);
      gradient.addColorStop(1, template.gradientEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = this.useTransparent()
        ? 'transparent'
        : template?.bgColor || this.customBgColor();
    }

    // Draw background shape
    if (template?.pattern === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (template?.pattern === 'rounded' || template?.pattern === 'badge') {
      this.roundRect(ctx, 0, 0, size, size, size * 0.2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    // Draw border for badge
    if (template?.pattern === 'badge' && template.borderColor) {
      ctx.strokeStyle = template.borderColor;
      ctx.lineWidth = size * 0.08;
      this.roundRect(
        ctx,
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        size - ctx.lineWidth,
        size - ctx.lineWidth,
        size * 0.2,
      );
      ctx.stroke();
    }

    // Draw text or emoji
    ctx.fillStyle = this.useCustomTextColor()
      ? this.customTextColor()
      : template?.textColor || this.customTextColor();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.combineEmojiText() && this.mode() === 'text') {
      // Combined emoji + text mode
      const position = this.emojiPosition();

      if (position === 'text-over-emoji') {
        // Big emoji background with text on top
        const emojiSize = size * 0.7;
        const textSize = size * 0.35;

        ctx.font = `${emojiSize}px Arial, sans-serif`;
        ctx.fillText(this.emoji(), size / 2, size / 2);

        ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
        ctx.fillText(displayText, size / 2, size / 2);
      } else if (position === 'emoji-over-text') {
        // Big text background with emoji at bottom right
        const textSize = size * 0.55;
        const emojiSize = size * 0.3;

        ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
        ctx.fillText(displayText, size / 2, size / 2);

        ctx.font = `${emojiSize}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.emoji(), size - size * 0.05, size - size * 0.05);
      } else {
        // Top, Bottom, Left, Right positions
        const emojiSize = size * 0.35;
        const textSize = size * 0.3;
        const spacing = size * 0.08;

        if (position === 'top') {
          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.fillText(this.emoji(), size / 2, size / 2 - spacing - textSize / 2);

          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.fillText(displayText, size / 2, size / 2 + spacing + emojiSize / 2);
        } else if (position === 'bottom') {
          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.fillText(displayText, size / 2, size / 2 - spacing - emojiSize / 2);

          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.fillText(this.emoji(), size / 2, size / 2 + spacing + textSize / 2);
        } else if (position === 'left') {
          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(this.emoji(), size / 2 - spacing, size / 2);

          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.textAlign = 'left';
          ctx.fillText(displayText, size / 2 + spacing, size / 2);
        } else if (position === 'right') {
          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.textAlign = 'right';
          ctx.fillText(displayText, size / 2 - spacing, size / 2);

          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(this.emoji(), size / 2 + spacing, size / 2);
        }
      }
    } else if (this.mode() === 'emoji') {
      ctx.font = `${size * 0.6}px Arial, sans-serif`;
      ctx.fillText(this.emoji(), size / 2, size / 2);
    } else {
      ctx.font = `bold ${size * 0.5}px ${this.fontFamily()}`;
      ctx.fillText(displayText, size / 2, size / 2);
    }
  }

  private generateImageFavicon(): void {
    const canvas = this.previewCanvasRef?.nativeElement;
    const imageUrl = this.uploadedImage();
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // Calculate scaling to fit image
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.src = imageUrl;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.snackbarService.show('Please select an image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage.set(e.target?.result as string);
        this.generatePreview();
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeImage(): void {
    this.uploadedImage.set(null);
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  protected async downloadFavicon(): Promise<void> {
    const canvas = document.createElement('canvas');
    const size = this.size();
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (this.mode() === 'text' || this.mode() === 'emoji') {
      this.renderTextToCanvas(ctx, size);
    } else if (this.uploadedImage()) {
      await this.renderImageToCanvas(ctx, size);
    }

    if (this.downloadFormat() === 'ico') {
      const icoBlob = await this.convertToICO(canvas);
      const url = URL.createObjectURL(icoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'favicon.ico';
      a.click();
      URL.revokeObjectURL(url);
      this.snackbarService.show('Favicon ICO downloaded!', 'success');
    } else {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `favicon-${size}x${size}.png`;
          a.click();
          URL.revokeObjectURL(url);
          this.snackbarService.show(`Favicon ${size}x${size} downloaded!`, 'success');
        }
      }, 'image/png');
    }
  }

  protected async downloadAllSizes(): Promise<void> {
    this.snackbarService.show('Downloading favicons (16x16, 32x32, 48x48)...', 'success');

    for (const size of [16, 32, 48]) {
      await new Promise<void>((resolve) => {
        setTimeout(async () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve();
            return;
          }

          if (this.mode() === 'text' || this.mode() === 'emoji') {
            this.renderTextToCanvas(ctx, size);
          } else if (this.uploadedImage()) {
            await this.renderImageToCanvas(ctx, size);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `favicon-${size}x${size}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
            resolve();
          }, 'image/png');
        }, 100);
      });
    }
  }

  private renderTextToCanvas(ctx: CanvasRenderingContext2D, size: number): void {
    const template = this.currentTemplate();
    const text = this.text() || 'A';
    const displayText = text.substring(0, 2).toUpperCase();

    ctx.clearRect(0, 0, size, size);

    if (this.useTransparent()) {
      ctx.fillStyle = 'transparent';
    } else if (template?.pattern === 'gradient' && template.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, template.bgColor);
      gradient.addColorStop(1, template.gradientEnd);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = template?.bgColor || this.customBgColor();
    }

    if (template?.pattern === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (template?.pattern === 'rounded' || template?.pattern === 'badge') {
      this.roundRect(ctx, 0, 0, size, size, size * 0.2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    if (template?.pattern === 'badge' && template.borderColor) {
      ctx.strokeStyle = template.borderColor;
      ctx.lineWidth = Math.max(2, size * 0.08);
      this.roundRect(
        ctx,
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        size - ctx.lineWidth,
        size - ctx.lineWidth,
        size * 0.2,
      );
      ctx.stroke();
    }

    ctx.fillStyle = this.useCustomTextColor()
      ? this.customTextColor()
      : template?.textColor || this.customTextColor();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (this.combineEmojiText() && this.mode() === 'text') {
      // Combined emoji + text mode
      const position = this.emojiPosition();

      if (position === 'text-over-emoji') {
        // Big emoji background with text on top
        const emojiSize = size * 0.7;
        const textSize = size * 0.35;

        ctx.font = `${emojiSize}px Arial, sans-serif`;
        ctx.fillText(this.emoji(), size / 2, size / 2);

        ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
        ctx.fillText(displayText, size / 2, size / 2);
      } else if (position === 'emoji-over-text') {
        // Big text background with emoji at bottom right
        const textSize = size * 0.55;
        const emojiSize = size * 0.3;

        ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
        ctx.fillText(displayText, size / 2, size / 2);

        ctx.font = `${emojiSize}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.emoji(), size - size * 0.05, size - size * 0.05);
      } else {
        // Top, Bottom, Left, Right positions
        const emojiSize = size * 0.35;
        const textSize = size * 0.3;
        const spacing = size * 0.08;

        if (position === 'top') {
          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.fillText(this.emoji(), size / 2, size / 2 - spacing - textSize / 2);

          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.fillText(displayText, size / 2, size / 2 + spacing + emojiSize / 2);
        } else if (position === 'bottom') {
          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.fillText(displayText, size / 2, size / 2 - spacing - emojiSize / 2);

          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.fillText(this.emoji(), size / 2, size / 2 + spacing + textSize / 2);
        } else if (position === 'left') {
          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(this.emoji(), size / 2 - spacing, size / 2);

          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.textAlign = 'left';
          ctx.fillText(displayText, size / 2 + spacing, size / 2);
        } else if (position === 'right') {
          ctx.font = `bold ${textSize}px ${this.fontFamily()}`;
          ctx.textAlign = 'right';
          ctx.fillText(displayText, size / 2 - spacing, size / 2);

          ctx.font = `${emojiSize}px Arial, sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(this.emoji(), size / 2 + spacing, size / 2);
        }
      }
    } else if (this.mode() === 'emoji') {
      ctx.font = `${size * 0.6}px Arial, sans-serif`;
      ctx.fillText(this.emoji(), size / 2, size / 2);
    } else {
      ctx.font = `bold ${size * 0.5}px ${this.fontFamily()}`;
      ctx.fillText(displayText, size / 2, size / 2);
    }
  }

  private renderImageToCanvas(ctx: CanvasRenderingContext2D, size: number): Promise<void> {
    const imageUrl = this.uploadedImage();
    if (!imageUrl) return Promise.resolve();

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = imageUrl;
    });
  }

  private async convertToICO(canvas: HTMLCanvasElement): Promise<Blob> {
    // ICO format: Create a multi-size ICO file
    const sizes = [16, 32, 48];
    const images: ImageData[] = [];

    for (const size of sizes) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        if (this.mode() === 'text' || this.mode() === 'emoji') {
          this.renderTextToCanvas(tempCtx, size);
        } else if (this.uploadedImage()) {
          await this.renderImageToCanvas(tempCtx, size);
        }
        images.push(tempCtx.getImageData(0, 0, size, size));
      }
    }

    // Simple ICO format (converts to PNG blob for now, browsers accept PNG as .ico)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    });
  }
}
