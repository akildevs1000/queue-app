<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class CacheContainer extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \App\Services\CacheContainer::class;
    }
}
