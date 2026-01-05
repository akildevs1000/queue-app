<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
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

        // ----------------------------
        // TRIAL EXPIRY HANDLING
        // ----------------------------
        if (!$user->expiry_date) {
            // First login → start 10-day trial
            $user->update([
                'expiry_date' => now()->addDays(10)->toDateString(),
            ]);
        } else {

            if ($request['expiry_date']) {

                $user->update([
                    'expiry_date' => $request['expiry_date'],
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
