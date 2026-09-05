export interface ImageConversionOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number; // 0.1 to 1.0
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  format: string;
}

export class ImageEngine {
  public static async inspectImage(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.width, img.height);
        const aspectRatio = `${img.width / divisor}:${img.height / divisor}`;
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio,
          sizeBytes: file.size,
          format: file.type || file.name.split('.').pop() || 'unknown'
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file. Invalid or corrupted image.'));
      };
      img.src = url;
    });
  }

  public static async convertImage(file: File, options: ImageConversionOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not supported'));
            return;
          }

          let targetWidth = options.width || img.width;
          let targetHeight = options.height || img.height;

          // If rotation is 90 or 270, swap dimensions
          const rotation = (options.rotation || 0) % 360;
          const isOrthogonal = rotation === 90 || rotation === 270;

          canvas.width = isOrthogonal ? targetHeight : targetWidth;
          canvas.height = isOrthogonal ? targetWidth : targetHeight;

          // If converting to JPEG, fill canvas with white background (handles transparent PNGs)
          if (options.format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
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

          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Image conversion failed during encoding.'));
              }
            },
            options.format,
            options.quality ?? 0.92
          );
        } catch (err: any) {
          reject(new Error(`Image transformation error: ${err.message}`));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unable to read source image file.'));
      };

      img.src = url;
    });
  }
}
