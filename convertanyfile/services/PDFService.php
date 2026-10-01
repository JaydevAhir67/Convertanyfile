<?php
/**
 * ConvertAnyFile - PHP PDF Conversion Service
 * Generates genuine PDF vector streams from text, images, and documents
 */

require_once __DIR__ . '/../config/config.php';

class PDFService {
    /**
     * Converts a single image (JPG, PNG) into a valid PDF document
     */
    public static function imageToPdf(string $imagePath, string $outputPath, string $title = 'Document'): bool {
        if (!file_exists($imagePath)) {
            throw new Exception("Source image does not exist: {$imagePath}");
        }

        $info = @getimagesize($imagePath);
        if (!$info) {
            throw new Exception("Cannot read image dimensions.");
        }

        $width = $info[0];
        $height = $info[1];

        // Ensure JPEG format for PDF embedding
        $tempJpg = $imagePath;
        $isTemp = false;
        if ($info['mime'] !== 'image/jpeg') {
            $tempJpg = TEMP_DIR . '/' . uniqid('pdf_img_') . '.jpg';
            require_once __DIR__ . '/ImageService.php';
            ImageService::convertImage($imagePath, $tempJpg, 'jpg', 95);
            $isTemp = true;
        }

        $jpgData = file_get_contents($tempJpg);
        if ($isTemp && file_exists($tempJpg)) {
            @unlink($tempJpg);
        }

        // Standard A4 dimensions in points: 595.28 x 841.89
        $pageW = 595.28;
        $pageH = 841.89;

        // Scale image to fit within margins (36 pt margin)
        $margin = 36.0;
        $maxW = $pageW - ($margin * 2);
        $maxH = $pageH - ($margin * 2);

        $scale = min($maxW / $width, $maxH / $height);
        $drawW = $width * $scale;
        $drawH = $height * $scale;
        $posX = $margin + (($maxW - $drawW) / 2);
        $posY = $margin + (($maxH - $drawH) / 2);

        // Construct standard valid PDF binary stream
        $pdf = self::buildSingleImagePdf($jpgData, $width, $height, $pageW, $pageH, $posX, $posY, $drawW, $drawH);
        return file_put_contents($outputPath, $pdf) !== false;
    }

    /**
     * Converts raw text to a clean PDF document with preserved typography
     */
    public static function textToPdf(string $text, string $outputPath, string $fontFamily = 'Helvetica'): bool {
        $lines = explode("\n", $text);
        $pageW = 595.28;
        $pageH = 841.89;
        $margin = 50.0;
        $fontSize = 11;
        $lineHeight = 15;

        $contentStream = "BT\n";
        $contentStream .= "/F1 {$fontSize} Tf\n";
        $contentStream .= "{$margin} " . ($pageH - $margin) . " Td\n";

        $currentY = $pageH - $margin;
        $pages = [];
        $currentPageContent = "BT\n/F1 {$fontSize} Tf\n{$margin} " . ($pageH - $margin) . " Td\n";

        foreach ($lines as $line) {
            $safeLine = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], trim($line));
            $currentPageContent .= "({$safeLine}) '\n";
            $currentY -= $lineHeight;

            if ($currentY < $margin + 20) {
                $currentPageContent .= "ET\n";
                $pages[] = $currentPageContent;
                $currentPageContent = "BT\n/F1 {$fontSize} Tf\n{$margin} " . ($pageH - $margin) . " Td\n";
                $currentY = $pageH - $margin;
            }
        }
        $currentPageContent .= "ET\n";
        $pages[] = $currentPageContent;

        $pdf = self::buildMultiPageTextPdf($pages, $fontFamily);
        return file_put_contents($outputPath, $pdf) !== false;
    }

    /**
     * Builds raw valid single image PDF stream
     */
    private static function buildSingleImagePdf(string $imageData, int $imgW, int $imgH, float $pageW, float $pageH, float $x, float $y, float $w, float $h): string {
        $imgLen = strlen($imageData);
        $stream = sprintf(
            "q\n%.2f 0 0 %.2f %.2f %.2f cm\n/Im1 Do\nQ\n",
            $w, $h, $x, $y
        );
        $streamLen = strlen($stream);

        $out = "%PDF-1.4\n";
        $offsets = [];

        // 1: Catalog
        $offsets[1] = strlen($out);
        $out .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // 2: Pages
        $offsets[2] = strlen($out);
        $out .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";

        // 3: Page
        $offsets[3] = strlen($out);
        $out .= sprintf(
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2f %.2f] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n",
            $pageW, $pageH
        );

        // 4: Contents Stream
        $offsets[4] = strlen($out);
        $out .= "4 0 obj\n<< /Length {$streamLen} >>\nstream\n{$stream}\nendstream\nendobj\n";

        // 5: Image XObject
        $offsets[5] = strlen($out);
        $out .= sprintf(
            "5 0 obj\n<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n",
            $imgW, $imgH, $imgLen
        );
        $out .= $imageData;
        $out .= "\nendstream\nendobj\n";

        // Xref table
        $xrefOffset = strlen($out);
        $out .= "xref\n0 6\n0000000000 65535 f \n";
        for ($i = 1; $i <= 5; $i++) {
            $out .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $out .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $out;
    }

    /**
     * Builds multi-page text PDF with chosen document font
     */
    private static function buildMultiPageTextPdf(array $pagesContent, string $fontFamily = 'Helvetica'): string {
        $out = "%PDF-1.4\n";
        $numPages = count($pagesContent);
        $offsets = [];

        // 1: Catalog
        $offsets[1] = strlen($out);
        $out .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        // 2: Pages
        $kids = [];
        for ($p = 0; $p < $numPages; $p++) {
            $kids[] = (4 + $p * 2) . " 0 R";
        }
        $offsets[2] = strlen($out);
        $out .= "2 0 obj\n<< /Type /Pages /Kids [" . implode(' ', $kids) . "] /Count {$numPages} >>\nendobj\n";

        // 3: Font
        $offsets[3] = strlen($out);
        $out .= "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /{$fontFamily} /Encoding /WinAnsiEncoding >>\nendobj\n";

        $objIndex = 4;
        for ($p = 0; $p < $numPages; $p++) {
            $pageObj = $objIndex;
            $contentObj = $objIndex + 1;
            $cStream = $pagesContent[$p];
            $cLen = strlen($cStream);

            // Page obj
            $offsets[$pageObj] = strlen($out);
            $out .= "{$pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents {$contentObj} 0 R /Resources << /Font << /F1 3 0 R >> >> >>\nendobj\n";

            // Content obj
            $offsets[$contentObj] = strlen($out);
            $out .= "{$contentObj} 0 obj\n<< /Length {$cLen} >>\nstream\n{$cStream}\nendstream\nendobj\n";

            $objIndex += 2;
        }

        $totalObjs = $objIndex;
        $xrefOffset = strlen($out);
        $out .= "xref\n0 {$totalObjs}\n0000000000 65535 f \n";
        for ($i = 1; $i < $totalObjs; $i++) {
            $out .= sprintf("%010d 00000 n \n", $offsets[$i] ?? 0);
        }
        $out .= "trailer\n<< /Size {$totalObjs} /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF";

        return $out;
    }
}
