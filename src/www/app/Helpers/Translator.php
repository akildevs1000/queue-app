<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Stichoza\GoogleTranslate\GoogleTranslate;

class Translator
{
    /**
     * Translate given model fields dynamically
     *
     * @param  object  $model
     * @param  string  $language  'ar','fr','es','de'
     * @param  array   $fields
     * @param  int     $cacheDays
     * @return array
     */
    public static function translateModel($model, $language = "en", array $fields = [], $cacheDays = 30)
    {
        $translator = new GoogleTranslate();
        $translator->setSource('en');
        $translator->setTarget($language);
        $translator->setOptions(['verify' => false]);

        // if (app()->environment('local')) {
        //     $translator->setOptions(['verify' => false]);
        // }

        $cacheKey = get_class($model) . "_{$model->id}_{$language}";

        return Cache::remember($cacheKey, now()->addDays($cacheDays), function () use ($model, $fields, $translator, $language) {
            $result = ['id' => $model->id];

            // If fields are empty, try to translate all string columns dynamically
            if (empty($fields)) {
                $fields = collect($model->getAttributes())
                    ->filter(fn($value) => is_string($value))
                    ->keys()
                    ->toArray();
            }

            foreach ($fields as $field) {
                try {
                    $result[$field] = $language === 'en'
                        ? $model->{$field}
                        : $translator->translate($model->{$field});
                } catch (\Exception $e) {
                    $result[$field] = $model->{$field};
                }
            }

            return $result;
        });
    }

    public static function translateText($text, $language, $cacheDays = 30)
    {
        if ($language === 'en') return $text;

        $translator = new \Stichoza\GoogleTranslate\GoogleTranslate();
        $translator->setSource('en');
        $translator->setTarget($language);

        if (app()->environment('local')) {
            $translator->setOptions(['verify' => false]);
        }

        $cacheKey = 'text_' . md5($text) . "_$language";

        return \Illuminate\Support\Facades\Cache::remember($cacheKey, now()->addDays($cacheDays), function () use ($translator, $text) {
            try {
                return $translator->translate($text);
            } catch (\Exception $e) {
                return $text;
            }
        });
    }
}
