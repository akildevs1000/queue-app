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

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public static function list($additionalCols = [])
    {
        return self::get(array_merge(["id", "name"], $additionalCols))->toArray();
    }

    public function tokens()
    {
        return $this->hasMany(Token::class);
    }

    public function scopeFilter($query, array $filters)
    {
        if (!empty($filters['counter_id']) && $filters['counter_id'] != -1) {
            $query->where('id', $filters['counter_id']);
        }

        if (!empty($filters['service_id']) && $filters['service_id'] != -1) {
            $query->where('service_id', $filters['service_id']);
        }
        
        return $query;
    }
}
