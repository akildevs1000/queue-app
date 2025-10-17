<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Service extends Model
{
    protected $guarded = [];

    /**
     * Get all of the counters for the Service
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function counters()
    {
        return $this->hasMany(Counter::class);
    }

    /**
     * Get all of the counters for the Service
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tokens()
    {
        return $this->hasMany(Token::class);
    }
}
