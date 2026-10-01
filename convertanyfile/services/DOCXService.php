<?php
/**
 * ConvertAnyFile - PHP DOCX OpenXML Service
 * Parses and generates Microsoft Word documents with strict document typography preservation
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/PDFService.php';

class DOCXService {
    /**
     * Extracts text, fonts, and structure from a DOCX file
     */
    public static function parseDocx(string $docxPath): array {
        if (!file_exists($docxPath)) {
            throw new Exception("Source DOCX file not found: {$docxPath}");
        }

        $zip = new ZipArchive();
        if ($zip->open($docxPath) !== true) {
            throw new Exception("Unable to open DOCX archive.");
        }

        // Read word/document.xml
        $docXml = $zip->getFromName('word/document.xml');
        $stylesXml = $zip->getFromName('word/styles.xml');
        $zip->close();

        if (!$docXml) {
            throw new Exception("word/document.xml missing from DOCX package.");
        }

        // Detect Primary Document Font
        $detectedFont = 'Times-Roman';
        if (preg_match('/w:rFonts[^>]+w:ascii=["\']([^"\']+)["\']/i', $docXml, $matches)) {
            $fontName = $matches[1];
            if (stripos($fontName, 'Times') !== false || stripos($fontName, 'Serif') !== false) {
                $detectedFont = 'Times-Roman';
            } elseif (stripos($fontName, 'Arial') !== false || stripos($fontName, 'Helvetica') !== false || stripos($fontName, 'Calibri') !== false) {
                $detectedFont = 'Helvetica';
            } elseif (stripos($fontName, 'Courier') !== false || stripos($fontName, 'Mono') !== false) {
                $detectedFont = 'Courier';
            }
        }

        // Extract paragraphs
        $paragraphs = [];
        if (preg_match_all('/<w:p\b[^>]*>(.*?)<\/w:p>/is', $docXml, $pMatches)) {
            foreach ($pMatches[1] as $pXml) {
                // Extract text runs inside paragraph
                if (preg_match_all('/<w:t\b[^>]*>(.*?)<\/w:t>/is', $pXml, $tMatches)) {
                    $pText = implode('', array_map('html_entity_decode', $tMatches[1]));
                    if (trim($pText) !== '') {
                        $paragraphs[] = $pText;
                    }
                }
            }
        }

        return [
            'font' => $detectedFont,
            'paragraphs' => $paragraphs,
            'fullText' => implode("\n\n", $paragraphs)
        ];
    }

    /**
     * Converts a DOCX file to a PDF file preserving original document fonts
     */
    public static function docxToPdf(string $docxPath, string $outputPath): bool {
        $parsed = self::parseDocx($docxPath);
        $font = $parsed['font'];
        $text = $parsed['fullText'];

        if (empty(trim($text))) {
            $text = "Converted Document\n\n(Document contains no readable text streams)";
        }

        return PDFService::textToPdf($text, $outputPath, $font);
    }

    /**
     * Generates a valid DOCX file from raw text with clean standard OpenXML styles
     */
    public static function textToDocx(string $text, string $outputPath, string $docFont = 'Calibri'): bool {
        $zip = new ZipArchive();
        if ($zip->open($outputPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new Exception("Cannot create DOCX output file.");
        }

        $lines = explode("\n", $text);
        $paragraphsXml = '';

        foreach ($lines as $line) {
            $cleanLine = htmlspecialchars(trim($line), ENT_XML1, 'UTF-8');
            if ($cleanLine === '') {
                $paragraphsXml .= "<w:p><w:pPr><w:spacing w:after=\"120\"/></w:pPr></w:p>";
            } else {
                $isHeading = str_starts_with($cleanLine, '# ') || (strlen($cleanLine) < 60 && $cleanLine === strtoupper($cleanLine) && strlen($cleanLine) > 4);
                $fontSize = $isHeading ? '32' : '22'; // half-points: 16pt vs 11pt
                $boldTag = $isHeading ? '<w:b/>' : '';
                $cleanText = ltrim($cleanLine, '# ');

                $paragraphsXml .= "<w:p>
                    <w:pPr>
                        <w:spacing w:after=\"160\" w:line=\"276\" w:lineRule=\"auto\"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:rFonts w:ascii=\"{$docFont}\" w:hAnsi=\"{$docFont}\"/>
                            {$boldTag}
                            <w:sz w:val=\"{$fontSize}\"/>
                            <w:color w:val=\"111827\"/>
                        </w:rPr>
                        <w:t xml:space=\"preserve\">{$cleanText}</w:t>
                    </w:r>
                </w:p>";
            }
        }

        // [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        </Types>';
        $zip->addFromString('[Content_Types].xml', $contentTypes);

        // _rels/.rels
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>';
        $zip->addFromString('_rels/.rels', $rels);

        // word/document.xml
        $documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
                ' . $paragraphsXml . '
                <w:sectPr>
                    <w:pgSz w:w="11906" w:h="16838"/>
                    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
                </w:sectPr>
            </w:body>
        </w:document>';
        $zip->addFromString('word/document.xml', $documentXml);

        $zip->close();
        return true;
    }
}
