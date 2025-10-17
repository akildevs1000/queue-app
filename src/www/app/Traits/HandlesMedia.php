<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

trait HandlesMedia
{
    /**
     * Upload and manage media files for a model.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param \Illuminate\Http\Request $request
     * @param string $field The name of the media field (e.g., 'media_url')
     * @param string $mediaTypeField The name of the media type field (e.g., 'media_type')
     * @param string $disk Storage disk (default: public)
     * @return array|string
     */
    public function handleMediaUpload($model, Request $request, string $field, string $mediaTypeField = 'media_type', string $disk = 'public')
    {
        $mediaType = $request->input($mediaTypeField);

        if ($mediaType === 'youtube') {
            return $request->input($field);
        }

        $folderPrefix = "uploads/{$mediaType}";

        Log::info('Preparing to delete old media:', [
            'field' => $field,
            'media_type' => $mediaType,
            'old_media' => $model->$field,
            'disk' => $disk,
            'check_type' => in_array($model->$mediaTypeField, ['image', 'video', 'gif']),
            'check_field' => is_array($model->$field)
        ]);

        // ✅ Delete previous files from correct folder
        if (in_array($model->$mediaTypeField, ['image', 'video', 'gif']) && is_array($model->$field)) {
            Log::info('Preparing to delete old media:', [
                'field' => $field,
                'media_type' => $mediaType,
                'old_media' => $model->$field,
                'disk' => $disk,
            ]);

            foreach ($model->$field as $oldPath) {
                if (str_starts_with($oldPath, $folderPrefix) && Storage::disk($disk)->exists($oldPath)) {
                    Storage::disk($disk)->delete($oldPath);
                    Log::info('Deleted file:', ['path' => $oldPath]);
                } else {
                    Log::info('Skipped file (not matched or not found):', ['path' => $oldPath]);
                }
            }
        }

        // ✅ Store new files
        $paths = [];

        if ($request->hasFile($field)) {
            foreach ($request->file($field) as $file) {
                $filename = time() . '_' . $file->getClientOriginalName();
                $paths[] = $file->storeAs($folderPrefix, $filename, $disk);
            }

            return $paths;
        }

        return [];
    }
}
