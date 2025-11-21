<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'whatsapp',
        'address',
        'vip_number',
        'date_of_birth',
    ];

     protected static function booted()
    {
        static::creating(function ($customer) {
            if ($customer->vip_number) {
                // Keep only the first VIP number
                preg_match('/VIP-\d+/', $customer->vip_number, $matches);
                if (!empty($matches)) {
                    $customer->vip_number = $matches[0];
                }
            }
        });
    }

    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($customer) {
    //         if (empty($customer->vip_number)) {
    //             // Get the latest VIP number
    //             $latestCustomer = self::orderByDesc('id')->first();
    //             $lastNumber     = 0;

    //             if ($latestCustomer && preg_match('/VIP-(\d+)/', $latestCustomer->vip_number, $matches)) {
    //                 $lastNumber = (int) $matches[1];
    //             }

    //             // Increment and format new VIP number
    //             $nextNumber           = $lastNumber + 1;
    //             $customer->vip_number = 'VIP-' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    //         }
    //     });
    // }

    public static function getNextVipNumber(): string
    {
        // Get the latest customer with a VIP number
        $latestCustomer = self::whereNotNull('vip_number')
            ->orderByDesc('id')
            ->first();

        $lastNumber = 0;

        if ($latestCustomer && preg_match('/VIP-(\d+)/', $latestCustomer->vip_number, $matches)) {
            $lastNumber = (int) $matches[1];
        }

        $nextNumber = $lastNumber + 1;

        return 'VIP-' . str_pad($nextNumber, 8, '0', STR_PAD_LEFT);
    }
}
