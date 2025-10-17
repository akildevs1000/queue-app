<?php

namespace App\Observers;

use App\Models\Counter;
use Illuminate\Support\Facades\Cache;

class CounterObserver
{
    public function saved(Counter $counter)
    {
        Cache::forget('counters_list');
        Cache::forget("counters_by_service_{$counter->service_id}");
    }

    /**
     * Handle the Counter "created" event.
     */
    public function created(Counter $counter): void
    {
        //
    }

    /**
     * Handle the Counter "updated" event.
     */
    public function updated(Counter $counter): void
    {
        //
    }

    /**
     * Handle the Counter "deleted" event.
     */
    public function deleted(Counter $counter): void
    {
        Cache::forget('counters_list');
        Cache::forget("counters_by_service_{$counter->service_id}");
    }

    /**
     * Handle the Counter "restored" event.
     */
    public function restored(Counter $counter): void
    {
        //
    }

    /**
     * Handle the Counter "force deleted" event.
     */
    public function forceDeleted(Counter $counter): void
    {
        //
    }
}
