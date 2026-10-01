<?php
/**
 * ConvertAnyFile - Security Middleware
 * OWASP Defense: Input sanitization, path traversal prevention, magic byte verification
 */

require_once __DIR__ . '/../config/config.php';

class SecurityMiddleware {
    /**
     * Set standard security headers on API responses
     */
    public static function applyHeaders(): void {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Type: application/json; charset=utf-8');
    }

    /**
     * Prevent path traversal attacks (strips ../, ..\, null bytes)
     */
    public static function sanitizeFilename(string $filename): string {
        $filename = basename($filename);
        $filename = preg_replace('/[^\w\.\-_]/', '', $filename);
        $filename = trim($filename, '.');
        return empty($filename) ? 'unnamed_file' : $filename;
    }

    /**
     * Generate cryptographically secure random filename
     */
    public static function generateSecureFilename(string $extension): string {
        return bin2hex(random_bytes(16)) . '.' . ltrim(strtolower($extension), '.');
    }

    /**
     * Compute SHA-256 integrity hash of a file
     */
    public static function calculateSha256(string $filePath): string {
        if (!file_exists($filePath)) {
            return '';
        }
        return hash_file('sha256', $filePath);
    }

    /**
     * Inspect file magic bytes to verify genuine file type
     */
    public static function verifyMagicBytes(string $filePath, string $expectedExt): bool {
        if (!file_exists($filePath) || filesize($filePath) < 4) {
            return false;
        }

        $handle = fopen($filePath, 'rb');
        $header = fread($handle, 8);
        fclose($handle);

        $bytes = bin2hex($header);

        // Check for disguised executables (MZ / PE / ELF / Mach-O)
        if (str_starts_with($bytes, '4d5a')) return false; // DOS / Windows PE
        if (str_starts_with($bytes, '7f454c46')) return false; // Linux ELF
        if (str_starts_with($bytes, 'cafebabe')) return false; // Java class

        switch (strtolower($expectedExt)) {
            case 'pdf':
                return str_starts_with($bytes, '25504446'); // %PDF
            case 'jpg':
            case 'jpeg':
                return str_starts_with($bytes, 'ffd8ff'); // JPEG SOI
            case 'png':
                return str_starts_with($bytes, '89504e470d0a1a0a'); // PNG
            case 'gif':
                return str_starts_with($bytes, '47494638'); // GIF8
            case 'webp':
                return str_starts_with($bytes, '52494646'); // RIFF
            case 'docx':
            case 'xlsx':
            case 'pptx':
            case 'zip':
                return str_starts_with($bytes, '504b0304'); // PK ZIP
            default:
                // Text/CSV formats
                return true;
        }
    }
}
