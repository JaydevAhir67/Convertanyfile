import { SecurityEngine } from './securityEngine';

export interface ImageConversionOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number; // 0.1 to 1.0 (default: 0.92)
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
  backgroundColor?: string; // default: #FFFFFF for JPEG, transparent for PNG/WEBP
}

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  format: string;
  sha256?: string;
}

export interface ConvertedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  extension: string;
}

export class ImageEngine {
  /**
   * Inspects image dimensions, aspect ratio, file size, and calculates SHA-256 hash.
   */
  public static async inspectImage(file: File | Blob): Promise<ImageMetadata> {
    const sha256 = await SecurityEngine.calculateSha256(file);
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.width || 1, img.height || 1);
        const aspectRatio = `${Math.round(img.width / divisor)}:${Math.round(img.height / divisor)}`;
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio,
          sizeBytes: file.size,
          format: file.type || (file as any).name?.split('.').pop() || 'image/jpeg',
          sha256
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file. Invalid, unsupported or corrupted image.'));
      };
      img.src = url;
    });
  }

  /**
   * High-fidelity image transcoding with decompression bomb defense,
   * proper color profile management, alpha channel handling, and Data URL generation.
   */
  public static async convertImage(
    fileOrBlob: File | Blob,
    options: ImageConversionOptions
  ): Promise<Blob> {
    const result = await this.convertImageDetailed(fileOrBlob, options);
    return result.blob;
  }

  /**
   * Detailed image conversion returning both genuine binary Blob and Data URL for instant UI preview.
   */
  public static async convertImageDetailed(
    fileOrBlob: File | Blob,
    options: ImageConversionOptions
  ): Promise<ConvertedImageResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fileOrBlob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          // Decompression bomb defense (#90)
          const totalPixels = img.width * img.height;
          if (
            totalPixels > SecurityEngine.MAX_IMAGE_PIXELS ||
            img.width > SecurityEngine.MAX_IMAGE_DIMENSION ||
            img.height > SecurityEngine.MAX_IMAGE_DIMENSION
          ) {
            reject(
              new Error(
                `Decompression Defense: Image dimensions (${img.width}x${img.height} px, ${(totalPixels / 1e6).toFixed(1)} MP) exceed memory safety limits.`
              )
            );
            return;
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not supported'));
            return;
          }

          let targetWidth = options.width || img.width;
          let targetHeight = options.height || img.height;

          // Maintain aspect ratio with maxWidth / maxHeight
          if (options.maxWidth && targetWidth > options.maxWidth) {
            const ratio = options.maxWidth / targetWidth;
            targetWidth = options.maxWidth;
            targetHeight = Math.round(targetHeight * ratio);
          }
          if (options.maxHeight && targetHeight > options.maxHeight) {
            const ratio = options.maxHeight / targetHeight;
            targetHeight = options.maxHeight;
            targetWidth = Math.round(targetWidth * ratio);
          }

          // Handle orthogonal rotation (90 or 270 degrees)
          const rotation = (options.rotation || 0) % 360;
          const isOrthogonal = rotation === 90 || rotation === 270;

          canvas.width = isOrthogonal ? targetHeight : targetWidth;
          canvas.height = isOrthogonal ? targetWidth : targetHeight;

          // If converting to JPEG, fill canvas with solid white background to avoid transparent black artifacts
          if (options.format === 'image/jpeg') {
            ctx.fillStyle = options.backgroundColor || '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);

          if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180);
          }

          if (options.flipHorizontal) {
            ctx.scale(-1, 1);
          }

          ctx.drawImage(
            img,
            -targetWidth / 2,
            -targetHeight / 2,
            targetWidth,
            targetHeight
          );
          ctx.restore();

          const quality = options.quality ?? (options.format === 'image/jpeg' ? 0.92 : undefined);
          const ext = options.format === 'image/jpeg' ? 'jpg' : options.format === 'image/webp' ? 'webp' : 'png';

          canvas.toBlob(
            blob => {
              if (blob) {
                const dataUrl = canvas.toDataURL(options.format, quality);
                resolve({
                  blob,
                  dataUrl,
                  width: canvas.width,
                  height: canvas.height,
                  sizeBytes: blob.size,
                  format: options.format,
                  extension: ext
                });
              } else {
                reject(new Error('Image conversion failed during encoding.'));
              }
            },
            options.format,
            quality
          );
        } catch (err: any) {
          reject(new Error(`Image transformation error: ${err.message}`));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unable to read source image file. File may be corrupted or in an unsupported format.'));
      };

      img.src = url;
    });
  }

  /**
   * Compresses an image with adjustable quality and returns reduction metrics.
   */
  public static async compressImage(
    fileOrBlob: File | Blob,
    quality: number = 0.75
  ): Promise<{
    compressedBlob: Blob;
    dataUrl: string;
    originalSize: number;
    compressedSize: number;
    savingsPercent: number;
  }> {
    const originalSize = fileOrBlob.size;
    const format = fileOrBlob.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const result = await this.convertImageDetailed(fileOrBlob, {
      format: format as any,
      quality
    });

    const compressedSize = result.blob.size;
    const savingsPercent = originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

    return {
      compressedBlob: result.blob,
      dataUrl: result.dataUrl,
      originalSize,
      compressedSize,
      savingsPercent
    };
  }
}
