<?php
/**
 * ConvertAnyFile - Master Conversion Orchestration Service
 * Connects file pipeline, SHA-256 integrity, time measurement, and MySQL records
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/security.php';
require_once __DIR__ . '/ImageService.php';
require_once __DIR__ . '/PDFService.php';
require_once __DIR__ . '/DOCXService.php';

class ConversionService {
    /**
     * Executes conversion job, updates database, and returns file result metadata
     */
    public static function execute(int $fileId, string $targetFormat, ?int $userId = null): array {
        $pdo = Database::getConnection();

        // 1. Fetch file record
        $stmt = $pdo->prepare("SELECT * FROM files WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            throw new Exception("Source file record not found.");
        }

        $inputPath = UPLOAD_DIR . '/' . $file['stored_filename'];
        if (!file_exists($inputPath)) {
            throw new Exception("Source file is missing from storage.");
        }

        $sourceExt = strtolower($file['extension']);
        $targetExt = strtolower($targetFormat);

        // 2. Generate conversion job UUID & output filename
        $jobUuid = bin2hex(random_bytes(16));
        $outputStoredFilename = SecurityMiddleware::generateSecureFilename($targetExt);
        $outputPath = PROCESSED_DIR . '/' . $outputStoredFilename;

        $pathInfo = pathinfo($file['original_filename']);
        $outputOriginalFilename = ($pathInfo['filename'] ?? 'converted') . '.' . $targetExt;

        // 3. Create 'conversions' pending record
        $insertJob = $pdo->prepare("
            INSERT INTO conversions (job_uuid, user_id, source_file_id, source_format, target_format, status, progress_percent)
            VALUES (:uuid, :uid, :fid, :sfmt, :tfmt, 'processing', 25)
        ");
        $insertJob->execute([
            ':uuid' => $jobUuid,
            ':uid'  => $userId,
            ':fid'  => $fileId,
            ':sfmt' => $sourceExt,
            ':tfmt' => $targetExt
        ]);
        $conversionId = (int)$pdo->lastInsertId();

        $startTime = microtime(true);
        $success = false;
        $errorMessage = null;

        try {
            // Ensure processed directory exists
            if (!is_dir(PROCESSED_DIR)) {
                mkdir(PROCESSED_DIR, 0755, true);
            }

            // Route Conversion Matrix
            if (in_array($sourceExt, ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif']) &&
                in_array($targetExt, ['jpg', 'jpeg', 'png', 'webp'])) {
                $success = ImageService::convertImage($inputPath, $outputPath, $targetExt, 90);
            } elseif (in_array($sourceExt, ['jpg', 'jpeg', 'png', 'webp']) && $targetExt === 'pdf') {
                $success = PDFService::imageToPdf($inputPath, $outputPath, $file['original_filename']);
            } elseif (($sourceExt === 'docx' || $sourceExt === 'doc') && $targetExt === 'pdf') {
                $success = DOCXService::docxToPdf($inputPath, $outputPath);
            } elseif ($sourceExt === 'txt' && $targetExt === 'pdf') {
                $text = file_get_contents($inputPath);
                $success = PDFService::textToPdf($text, $outputPath);
            } elseif ($sourceExt === 'txt' && $targetExt === 'docx') {
                $text = file_get_contents($inputPath);
                $success = DOCXService::textToDocx($text, $outputPath);
            } elseif ($sourceExt === 'csv' && $targetExt === 'json') {
                $csv = array_map('str_getcsv', file($inputPath));
                $header = array_shift($csv);
                $json = [];
                foreach ($csv as $row) {
                    if (count($row) === count($header)) {
                        $json[] = array_combine($header, $row);
                    }
                }
                $success = file_put_contents($outputPath, json_encode($json, JSON_PRETTY_PRINT)) !== false;
            } elseif ($sourceExt === 'json' && $targetExt === 'csv') {
                $data = json_decode(file_get_contents($inputPath), true);
                if (is_array($data) && count($data) > 0) {
                    $fp = fopen($outputPath, 'w');
                    fputcsv($fp, array_keys(reset($data)));
                    foreach ($data as $fields) {
                        fputcsv($fp, $fields);
                    }
                    fclose($fp);
                    $success = true;
                }
            } else {
                throw new Exception("Conversion route from {$sourceExt} to {$targetExt} is not supported locally.");
            }

            if (!$success || !file_exists($outputPath)) {
                throw new Exception("Conversion engine failed to produce target output file.");
            }
        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
            $success = false;
        }

        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 3);

        if ($success) {
            $outputFileSize = filesize($outputPath);
            $outputSha256 = SecurityMiddleware::calculateSha256($outputPath);

            // Update conversions record
            $update = $pdo->prepare("
                UPDATE conversions
                SET status = 'completed', progress_percent = 100, processing_time_sec = :time,
                    output_stored_filename = :stored, output_original_filename = :orig,
                    output_file_size = :size, output_sha256 = :sha, completed_at = NOW()
                WHERE id = :id
            ");
            $update->execute([
                ':time'   => $duration,
                ':stored' => $outputStoredFilename,
                ':orig'   => $outputOriginalFilename,
                ':size'   => $outputFileSize,
                ':sha'    => $outputSha256,
                ':id'     => $conversionId
            ]);

            // Save in conversion_history
            $histUuid = bin2hex(random_bytes(16));
            $hist = $pdo->prepare("
                INSERT INTO conversion_history
                (history_uuid, user_id, original_filename, output_filename, source_format, target_format, file_size_bytes, output_size_bytes, sha256_input, sha256_output, status, processing_seconds)
                VALUES (:huuid, :uid, :orig, :outorig, :sfmt, :tfmt, :insize, :outsize, :insha, :outsha, 'completed', :sec)
            ");
            $hist->execute([
                ':huuid'   => $histUuid,
                ':uid'     => $userId,
                ':orig'    => $file['original_filename'],
                ':outorig' => $outputOriginalFilename,
                ':sfmt'    => $sourceExt,
                ':tfmt'    => $targetExt,
                ':insize'  => $file['file_size'],
                ':outsize' => $outputFileSize,
                ':insha'   => $file['sha256'],
                ':outsha'  => $outputSha256,
                ':sec'     => $duration
            ]);

            return [
                'job_id'             => $jobUuid,
                'status'             => 'completed',
                'original_filename'  => $file['original_filename'],
                'output_filename'    => $outputOriginalFilename,
                'download_url'       => APP_URL . '/api/files/download.php?job=' . $jobUuid,
                'file_size'          => $outputFileSize,
                'sha256'             => $outputSha256,
                'processing_seconds' => $duration
            ];
        } else {
            $pdo->prepare("UPDATE conversions SET status = 'failed', error_message = :err WHERE id = :id")
                ->execute([':err' => $errorMessage, ':id' => $conversionId]);
            throw new Exception("Conversion failed: " . $errorMessage);
        }
    }
}
