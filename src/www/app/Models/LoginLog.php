<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    protected $guarded = [];

    protected $appends = ['formatted_logged_in_at'];

    protected function formattedLoggedInAt(): Attribute
    {
        return Attribute::get(function () {
            return $this->logged_in_at
                ? \Carbon\Carbon::parse($this->logged_in_at)->timezone('Asia/Dubai')->format('d M Y h:i:s a')
                : null;
        });
    }
}
