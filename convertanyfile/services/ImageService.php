<?php
/**
 * ConvertAnyFile - PHP Image Conversion Service
 * High-performance image conversion using PHP GD (built-in with XAMPP)
 */

require_once __DIR__ . '/../config/config.php';

class ImageService {
    /**
     * Convert raster image (JPG, PNG, WEBP, BMP, GIF) to target format
     */
    public static function convertImage(string $inputPath, string $outputPath, string $targetExt, int $quality = 90): bool {
        if (!file_exists($inputPath)) {
            throw new Exception("Source image does not exist: {$inputPath}");
        }

        $imageInfo = @getimagesize($inputPath);
        if (!$imageInfo) {
            throw new Exception("Invalid or corrupt image format.");
        }

        $mime = $imageInfo['mime'];
        $srcImage = null;

        switch ($mime) {
            case 'image/jpeg':
            case 'image/jpg':
                $srcImage = imagecreatefromjpeg($inputPath);
                break;
            case 'image/png':
                $srcImage = imagecreatefrompng($inputPath);
                break;
            case 'image/webp':
                if (function_exists('imagecreatefromwebp')) {
                    $srcImage = imagecreatefromwebp($inputPath);
                }
                break;
            case 'image/gif':
                $srcImage = imagecreatefromgif($inputPath);
                break;
            case 'image/bmp':
                if (function_exists('imagecreatefrombmp')) {
                    $srcImage = imagecreatefrombmp($inputPath);
                }
                break;
            default:
                throw new Exception("Unsupported source image format: {$mime}");
        }

        if (!$srcImage) {
            throw new Exception("Failed to load source image into memory.");
        }

        // Handle transparency for PNG / WEBP
        $width = imagesx($srcImage);
        $height = imagesy($srcImage);
        $targetExt = strtolower($targetExt);

        $result = false;

        switch ($targetExt) {
            case 'jpg':
            case 'jpeg':
                // Create truecolor canvas with white background to prevent black alpha artifacts
                $trueColor = imagecreatetruecolor($width, $height);
                $white = imagecolorallocate($trueColor, 255, 255, 255);
                imagefill($trueColor, 0, 0, $white);
                imagecopy($trueColor, $srcImage, 0, 0, 0, 0, $width, $height);
                $result = imagejpeg($trueColor, $outputPath, $quality);
                imagedestroy($trueColor);
                break;

            case 'png':
                $trueColor = imagecreatetruecolor($width, $height);
                imagealphablending($trueColor, false);
                imagesavealpha($trueColor, true);
                $transparent = imagecolorallocatealpha($trueColor, 255, 255, 255, 127);
                imagefilledrectangle($trueColor, 0, 0, $width, $height, $transparent);
                imagecopy($trueColor, $srcImage, 0, 0, 0, 0, $width, $height);
                $pngCompression = (int)round((100 - $quality) / 10);
                $result = imagepng($trueColor, $outputPath, min(9, max(0, $pngCompression)));
                imagedestroy($trueColor);
                break;

            case 'webp':
                if (function_exists('imagewebp')) {
                    $result = imagewebp($srcImage, $outputPath, $quality);
                } else {
                    throw new Exception("WebP output requires GD WebP extension.");
                }
                break;

            default:
                imagedestroy($srcImage);
                throw new Exception("Unsupported target image extension: {$targetExt}");
        }

        imagedestroy($srcImage);
        return $result;
    }

    /**
     * Compress an image by reducing quality or dimensions
     */
    public static function compressImage(string $inputPath, string $outputPath, int $quality = 70): bool {
        $info = getimagesize($inputPath);
        $ext = 'jpg';
        if ($info['mime'] === 'image/png') $ext = 'png';
        if ($info['mime'] === 'image/webp') $ext = 'webp';
        return self::convertImage($inputPath, $outputPath, $ext, $quality);
    }
}
