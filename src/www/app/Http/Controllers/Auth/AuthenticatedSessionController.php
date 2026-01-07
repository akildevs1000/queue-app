<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        if (!$user->machine_id) {
            $user->update([
                'machine_id'  => $request['machine_id'],
            ]);
        }

        // Block login if machine ID doesn't match
        if ($user->machine_id && $user->machine_id != $request['machine_id']) {

            Log::info($user->machine_id);
            Log::info($request['machine_id']);

            auth()->logout();

            return redirect()->route('login')->withErrors([
                'error' => "Machine Id Mismatch",
            ]);
        }

        // ----------------------------
        // TRIAL EXPIRY HANDLING
        // ----------------------------
        if (!$user->expiry_date) {
            // First login → start 10-day trial
            $user->update([
                'expiry_date' => now()->addDays(10)->toDateString(),
                'machine_id'  => $request['machine_id'],
            ]);
        } else {

            if ($request['expiry_date']) {

                $user->update([
                    'expiry_date' => $request['expiry_date'],
                    'license_key' => $request['license_key'],
                ]);

                $user->refresh();
            }
            // Check if trial expired
            $expiry = Carbon::parse($user->expiry_date)->startOfDay();
            $today  = now()->startOfDay();

            if ($expiry->lt($today)) {
                // Trial expired → logout and block access
                auth()->logout();

                return redirect()->route('login')->withErrors([
                    'subsription' => "Your subsription expired on {$expiry->format('d-M-Y')}.",
                ]);
            }
        }

        // ----------------------------
        // Login successful
        // ----------------------------
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
