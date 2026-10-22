<?php

namespace App\Services;

use App\Models\File as FileModel;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LocalFileService
{
    /**
     * Disk name used for file storage.
     */
    protected string $disk = 'public';

    /**
     * Root directory inside the storage disk.
     */
    protected string $uploadRoot = 'uploads';

    /**
     * Supported magic number signatures.
     */
    protected array $magicSignatures = [
        'pdf'  => ['%PDF-'],
        'jpg'  => ["\xFF\xD8\xFF"],
        'jpeg' => ["\xFF\xD8\xFF"],
        'png'  => ["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
        'gif'  => ['GIF87a', 'GIF89a'],
        'webp' => ['RIFF'], // Will also check WEBP at offset 8
    ];

    /**
     * Upload a file from a standard Multipart UploadedFile.
     *
     * @param UploadedFile $uploadedFile
     * @param string $module e.g. 'users', 'properties', 'inquiries'
     * @param int|string $parentId Entity / Record ID
     * @param string $fileType Semantic type: 'avatar', 'property_image', 'document'
     * @param Model|null $fileable Optional Eloquent model to associate
     * @param array $extraMeta
     * @return FileModel
     * @throws Exception
     */
    public function uploadFile(
        UploadedFile $uploadedFile,
        string $module,
        int|string $parentId,
        string $fileType = 'file',
        ?Model $fileable = null,
        array $extraMeta = []
    ): FileModel {
        $originalName = $uploadedFile->getClientOriginalName();
        $tempPath = $this->createTempFileFromStream(file_get_contents($uploadedFile->getRealPath()));

        return $this->processAndCommit(
            $tempPath,
            $module,
            $parentId,
            $fileType,
            $originalName,
            $fileable,
            $extraMeta
        );
    }

    /**
     * Upload a file from a Base64 string (compatible with MERN uploadFromBase64 pattern).
     *
     * @param string $base64String
     * @param string $module
     * @param int|string $parentId
     * @param string $fileType
     * @param string|null $originalName
     * @param Model|null $fileable
     * @param array $extraMeta
     * @return FileModel
     * @throws Exception
     */
    public function uploadFromBase64(
        string $base64String,
        string $module,
        int|string $parentId,
        string $fileType = 'file',
        ?string $originalName = null,
        ?Model $fileable = null,
        array $extraMeta = []
    ): FileModel {
        // Strip data:image/...;base64, prefix if present
        if (preg_match('/^data:([a-zA-Z0-9\/\+.-]+);base64,/', $base64String, $matches)) {
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
        }

        $decodedData = base64_decode($base64String, true);
        if ($decodedData === false) {
            throw new Exception('Invalid base64 payload provided for upload.');
        }

        $tempPath = $this->createTempFileFromStream($decodedData);

        return $this->processAndCommit(
            $tempPath,
            $module,
            $parentId,
            $fileType,
            $originalName ?: "file_" . time(),
            $fileable,
            $extraMeta
        );
    }

    /**
     * Process temporary file, inspect security, build directory hierarchy,
     * and atomically move to final path.
     *
     * @throws Exception
     */
    protected function processAndCommit(
        string $tempAbsolutePath,
        string $module,
        int|string $parentId,
        string $fileType,
        string $originalName,
        ?Model $fileable = null,
        array $extraMeta = []
    ): FileModel {
        try {
            // 1. Sanitize inputs to avoid path-traversal
            $cleanModule = $this->sanitizePathComponent($module);
            $cleanParentId = $this->sanitizePathComponent((string) $parentId);

            // 2. Security validation: Magic number inspection
            $mimeType = $this->detectMimeType($tempAbsolutePath);
            $extension = $this->validateAndDetermineExtension($tempAbsolutePath, $mimeType, $originalName);

            // 3. Build time-partitioned, entity-scoped directory hierarchy:
            // uploads/{service_or_module}/{YYYY}/{MM}/{DD}/{parentId}/
            $year = date('Y');
            $month = date('m');
            $day = date('d');
            
            $relativeDir = "{$this->uploadRoot}/{$cleanModule}/{$year}/{$month}/{$day}/{$cleanParentId}";
            $absoluteDir = Storage::disk($this->disk)->path($relativeDir);

            // Ensure destination directory exists
            if (! File::exists($absoluteDir)) {
                File::makeDirectory($absoluteDir, 0755, true);
            }

            // 4. Generate unique, safe file name
            $safeBaseName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
            if (empty($safeBaseName)) {
                $safeBaseName = $fileType;
            }
            $uniqueSuffix = Str::random(8);
            $finalFileName = "{$safeBaseName}-{$cleanParentId}-{$uniqueSuffix}.{$extension}";
            
            $relativeFilePath = "{$relativeDir}/{$finalFileName}";
            $finalAbsolutePath = Storage::disk($this->disk)->path($relativeFilePath);

            // 5. ATOMIC MOVE: rename from .tmp to final path
            if (! @rename($tempAbsolutePath, $finalAbsolutePath)) {
                // Fallback copy + delete if cross-device link error occurs
                if (! File::copy($tempAbsolutePath, $finalAbsolutePath)) {
                    throw new Exception("Failed to atomically move temporary file to {$finalAbsolutePath}");
                }
                @unlink($tempAbsolutePath);
            }

            $fileSize = File::size($finalAbsolutePath);

            // 6. Persist file metadata in DB (Option A schema)
            $fileRecord = FileModel::create([
                'fileable_type' => $fileable ? get_class($fileable) : null,
                'fileable_id'   => $fileable ? $fileable->getKey() : (is_numeric($parentId) ? (int)$parentId : null),
                'file_name'     => $finalFileName,
                'file_path'     => $relativeFilePath,
                'mime_type'     => $mimeType,
                'file_type'     => $fileType,
                'file_size'     => $fileSize,
                'metadata'      => array_merge($extraMeta, [
                    'original_name' => $originalName,
                    'extension'     => $extension,
                    'uploaded_at'   => now()->toISOString(),
                ]),
            ]);

            return $fileRecord;
        } catch (Exception $e) {
            // Clean up temporary file on failure
            if (File::exists($tempAbsolutePath)) {
                @unlink($tempAbsolutePath);
            }
            throw $e;
        }
    }

    /**
     * Writes raw stream data to a hidden .tmp file for atomic handling.
     */
    protected function createTempFileFromStream(string $data): string
    {
        $tempDir = Storage::disk($this->disk)->path("{$this->uploadRoot}/.tmp");
        if (! File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        $tempFileName = '.tmp_' . uniqid('', true) . '_' . Str::random(12);
        $tempFilePath = "{$tempDir}/{$tempFileName}";

        if (file_put_contents($tempFilePath, $data) === false) {
            throw new Exception('Failed to write stream to temporary upload buffer.');
        }

        return $tempFilePath;
    }

    /**
     * Inspect file headers for true MIME type via finfo.
     */
    protected function detectMimeType(string $filePath): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        return $mime ?: 'application/octet-stream';
    }

    /**
     * Inspect magic numbers and validate file against allowed types.
     *
     * @throws Exception
     */
    protected function validateAndDetermineExtension(string $filePath, string $mimeType, string $originalName): string
    {
        $handle = fopen($filePath, 'rb');
        if (! $handle) {
            throw new Exception('Unable to read temporary upload for security inspection.');
        }

        $headerBytes = fread($handle, 32);
        fclose($handle);

        // Security check: Magic Byte validation
        if (str_starts_with($headerBytes, '%PDF-')) {
            return 'pdf';
        }
        if (str_starts_with($headerBytes, "\xFF\xD8\xFF")) {
            return 'jpg';
        }
        if (str_starts_with($headerBytes, "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A")) {
            return 'png';
        }
        if (str_starts_with($headerBytes, 'GIF87a') || str_starts_with($headerBytes, 'GIF89a')) {
            return 'gif';
        }
        // WebP format: "RIFF" .... "WEBP"
        if (str_starts_with($headerBytes, 'RIFF') && substr($headerBytes, 8, 4) === 'WEBP') {
            return 'webp';
        }

        // Map MIME fallback if valid text/csv or office document
        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            'application/pdf' => 'pdf',
            'text/plain' => 'txt',
            'text/csv'   => 'csv',
        ];

        if (isset($mimeMap[$mimeType])) {
            return $mimeMap[$mimeType];
        }

        // Fallback to sanitized extension from original name if MIME allows
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'txt', 'csv'];

        if (in_array($ext, $allowedExtensions, true)) {
            return $ext === 'jpeg' ? 'jpg' : $ext;
        }

        throw new Exception("Security inspection rejected file with MIME [{$mimeType}] and unknown byte signature.");
    }

    /**
     * Sanitize path components against directory traversal attacks.
     */
    protected function sanitizePathComponent(string $component): string
    {
        // Strip null bytes, .. and path separators
        $cleaned = str_replace(["\0", '..', '/', '\\'], '', $component);
        $cleaned = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $cleaned);
        return trim($cleaned, '._-') ?: 'default';
    }

    /**
     * Download file content as Base64 string.
     */
    public function downloadToBase64(FileModel|string $fileOrPath): ?string
    {
        $relativePath = $fileOrPath instanceof FileModel ? $fileOrPath->file_path : $fileOrPath;

        if (! Storage::disk($this->disk)->exists($relativePath)) {
            return null;
        }

        $content = Storage::disk($this->disk)->get($relativePath);
        return base64_encode($content);
    }

    /**
     * Stream file as high-performance HTTP response.
     */
    public function streamFile(FileModel|string $fileOrPath, ?string $customFileName = null): BinaryFileResponse
    {
        $relativePath = $fileOrPath instanceof FileModel ? $fileOrPath->file_path : $fileOrPath;
        $absolutePath = Storage::disk($this->disk)->path($relativePath);

        if (! File::exists($absolutePath)) {
            abort(404, 'File not found on disk.');
        }

        $mime = $fileOrPath instanceof FileModel ? $fileOrPath->mime_type : $this->detectMimeType($absolutePath);
        $downloadName = $customFileName ?: ($fileOrPath instanceof FileModel ? $fileOrPath->file_name : basename($absolutePath));

        return response()->file($absolutePath, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . addslashes($downloadName) . '"',
            'Cache-Control'       => 'public, max-age=86400',
        ]);
    }

    /**
     * Safely delete a file from disk and database.
     */
    public function deleteFile(FileModel|string $fileOrPath): bool
    {
        $relativePath = $fileOrPath instanceof FileModel ? $fileOrPath->file_path : $fileOrPath;

        if (Storage::disk($this->disk)->exists($relativePath)) {
            Storage::disk($this->disk)->delete($relativePath);
        }

        if ($fileOrPath instanceof FileModel) {
            $fileOrPath->delete();
        }

        return true;
    }
}
