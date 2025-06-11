<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Counter extends Model
{
    protected $guarded = [];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public static function list($additionalCols = [])
    {
        return self::get(array_merge(["id", "name"], $additionalCols))->toArray();
    }
}
