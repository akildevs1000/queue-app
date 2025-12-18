<?php

namespace App\Providers;

use App\Models\Counter;
use App\Models\Service;
use App\Observers\CounterObserver;
use App\Observers\ServiceObserver;
use App\Services\CacheContainer;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB; // <-- Add this

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CacheContainer::class, function ($app) {
            return new CacheContainer();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Service::observe(ServiceObserver::class);
        Counter::observe(CounterObserver::class);

        // SQLite performance settings (WAL mode + faster writes)
        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA journal_mode=WAL;');
            DB::statement('PRAGMA synchronous=NORMAL;');
        }
    }
}
