<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url($this->image); // or use asset() if you're storing images in /public
        }

        return null;
    }

    public function product_category()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
