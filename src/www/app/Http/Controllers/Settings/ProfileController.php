<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Jobs\UpdateTvSettings;
use App\Models\User;
use App\Traits\HandlesMedia;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HandlesMedia;

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
        return Inertia::render('settings/tv-settings', [
            'tv_settings' => session('tv_settings'),
        ]);
    }

    public function tvSettingsUpdate(Request $request)
    {
        $validated = $request->validate([
            'media_type' => ['required', 'in:youtube,image'],
            'media_url'  => ['required'],
        ]);

        // Extra safety for image uploads
        if ($validated['media_type'] === 'image') {

            // Ensure base64 image
            if (!str_starts_with($validated['media_url'], 'data:image')) {
                throw ValidationException::withMessages([
                    'media_url' => 'Invalid image format.',
                ]);
            }
        }

        $user = $request->user();

        $payload = [
            'media_type' => $validated['media_type'],
            'media_url'  => $validated['media_url'],
        ];

        Log::info($validated['media_type']);
        Log::info($validated['media_url']);

        $user->update($payload);

        return back()->with('tv_settings', $user->fresh());
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
