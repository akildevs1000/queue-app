<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PinLoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login_pin' => 'required|numeric',
        ]);

        // Find user by login_pin
        $user = User::where('login_pin', $request->login_pin)->first();

        if (! $user) {
            return response()->json([
                'message' => 'Invalid PIN'
            ], 401);
        }

        // OPTIONAL: delete old tokens (single-device login)
        $user->tokens()->delete();

        // Create Sanctum token
        $token = $user->createToken('pin-login')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user,
        ]);
    }
}
