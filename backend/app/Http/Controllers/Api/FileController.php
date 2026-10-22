<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Services\LocalFileService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileController extends Controller
{
    protected LocalFileService $fileService;

    public function __construct(LocalFileService $fileService)
    {
        $this->fileService = $fileService;
    }

    /**
     * View / Stream file directly (high-performance binary response).
     */
    public function show(int $id): BinaryFileResponse
    {
        $file = File::findOrFail($id);
        return $this->fileService->streamFile($file);
    }

    /**
     * Download or view as Base64 payload (matching MERN GraphQL resolver).
     */
    public function base64(int $id): JsonResponse
    {
        $file = File::findOrFail($id);
        $base64 = $this->fileService->downloadToBase64($file);

        if ($base64 === null) {
            return response()->json(['message' => 'File data could not be retrieved from disk.'], 404);
        }

        return response()->json([
            'id'        => $file->id,
            'fileName'  => $file->file_name,
            'mimeType'  => $file->mime_type,
            'fileType'  => $file->file_type,
            'filePath'  => $file->file_path,
            'fileSize'  => $file->file_size,
            'fileData'  => $base64,
            'url'       => $file->url,
        ]);
    }
}
