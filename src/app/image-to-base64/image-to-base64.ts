import { Component, signal, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../shared/snackbar.service';

interface ImageInfo {
  width: number;
  height: number;
  mimeType: string;
}

@Component({
  selector: 'app-image-to-base64',
  imports: [FormsModule],
  templateUrl: './image-to-base64.html',
  styleUrl: './image-to-base64.scss',
})
export class ImageToBase64 {
  private readonly snackbarService = inject(SnackbarService);
  protected readonly optimize = signal(false);
  protected readonly base64Result = signal<string>('');
  protected readonly fileName = signal<string>('');
  protected readonly originalFileSize = signal<number>(0);
  protected readonly base64Size = signal<number>(0);
  protected readonly optimizedSize = signal<number>(0);
  protected readonly imageInfo = signal<ImageInfo | null>(null);
  protected readonly previewUrl = signal<string>('');
  protected readonly isProcessing = signal(false);
  protected readonly currentFile = signal<File | null>(null);

  protected readonly hasResult = computed(() => this.base64Result() !== '');
  protected readonly aspectRatio = computed(() => {
    const info = this.imageInfo();
    return info ? `${info.width}x${info.height}` : '';
  });
  protected readonly base64Increase = computed(() => {
    const original = this.originalFileSize();
    const base64 = this.base64Size();
    if (original === 0) return 0;
    return Math.round(((base64 - original) / original) * 100);
  });

  constructor() {
    // Re-process image when optimize toggle changes
    effect(() => {
      const shouldOptimize = this.optimize();
      const file = this.currentFile();
      if (file && this.hasResult()) {
        this.isProcessing.set(true);
        if (shouldOptimize) {
          this.optimizeAndConvert(file);
        } else {
          this.convertToBase64(file);
        }
      }
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.snackbarService.error('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      this.snackbarService.error('Please select a valid image file.');
      return;
    }

    this.fileName.set(file.name);
    this.originalFileSize.set(file.size);
    this.currentFile.set(file);
    this.isProcessing.set(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (this.optimize()) {
      this.optimizeAndConvert(file);
    } else {
      this.convertToBase64(file);
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.base64Result.set(result);
      this.base64Size.set(result.length);
      this.optimizedSize.set(0);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        this.imageInfo.set({
          width: img.width,
          height: img.height,
          mimeType: file.type,
        });
        this.isProcessing.set(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      this.isProcessing.set(false);
      this.snackbarService.error('Error reading file');
    };
    reader.readAsDataURL(file);
  }

  private optimizeAndConvert(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          this.convertToBase64(file);
          return;
        }

        // Calculate new dimensions (max 1920x1080)
        let width = img.width;
        let height = img.height;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (0.8 quality for JPEG)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = mimeType === 'image/jpeg' ? 0.8 : undefined;
        const optimizedBase64 = canvas.toDataURL(mimeType, quality);

        this.base64Result.set(optimizedBase64);
        this.base64Size.set(optimizedBase64.length);
        this.optimizedSize.set(optimizedBase64.length);
        this.imageInfo.set({
          width: Math.round(width),
          height: Math.round(height),
          mimeType,
        });
        this.isProcessing.set(false);
      };
      img.onerror = () => {
        this.isProcessing.set(false);
        this.snackbarService.error('Error loading image');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  protected getOriginalSize(): string {
    return this.formatFileSize(this.originalFileSize());
  }

  protected getBase64SizeFormatted(): string {
    return this.formatFileSize(this.base64Size());
  }

  protected getOptimizedSizeFormatted(): string {
    return this.formatFileSize(this.optimizedSize());
  }

  protected copyToClipboard(): void {
    navigator.clipboard.writeText(this.base64Result()).then(
      () => {
        this.snackbarService.success('Base64 string copied to clipboard!');
      },
      () => {
        this.snackbarService.error('Failed to copy to clipboard');
      },
    );
  }

  protected reset(): void {
    this.base64Result.set('');
    this.fileName.set('');
    this.originalFileSize.set(0);
    this.base64Size.set(0);
    this.optimizedSize.set(0);
    this.imageInfo.set(null);
    this.previewUrl.set('');
    this.optimize.set(false);
    this.currentFile.set(null);
  }
}
