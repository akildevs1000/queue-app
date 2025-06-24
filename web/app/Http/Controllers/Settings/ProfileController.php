<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function tvSettings(): Response
    {
        return Inertia::render('settings/tv-settings');
    }

    public function tvSettingsUpdate(Request $request)
    {
        $validated = $request->validate([
            'ip' => ['required', 'ip'],
            'port' => ['required', 'integer'],
            'media_url' => ['required', function ($attribute, $value, $fail) {
                // Check if it's a PNG
                if (str_ends_with($value, '.png')) {
                    return;
                }

                if (str_ends_with($value, '.jpg')) {
                    return;
                }

                if (str_ends_with($value, '.jpeg')) {
                    return;
                }

                if (str_ends_with($value, '.gif')) {
                    return;
                }

                // Check if it's an MP4
                if (str_ends_with($value, '.mp4')) {
                    return;
                }

                // Check if it's a valid YouTube video ID (11-character alphanumeric)
                if (preg_match('/^[\w-]{11}$/', $value)) {
                    return;
                }

                // Otherwise, fail validation
                $fail('The media_url must be a .png, .mp4, or a valid YouTube video ID.');
            }],
            'media_height' => ['required'],
            'media_width' => ['required'],
        ]);

        $request->user()->update($validated);

        return back();
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
