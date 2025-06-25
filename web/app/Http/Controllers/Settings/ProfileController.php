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
            'media_type' => ['required', 'in:youtube,video,gif,image'],
            'media_url' => ['required'], // we'll override this below
            'media_url.*' => ['file', 'mimes:jpg,jpeg,png,gif,mp4'], // adjust types if needed
            'media_height' => ['required', 'integer'],
            'media_width' => ['required', 'integer'],
        ]);

        // Handle file upload (multiple files)
        $mediaPaths = [];

        if ($request->hasFile('media_url')) {
            foreach ($request->file('media_url') as $file) {
                $mediaPaths[] = $file->store('uploads', 'public'); // save to storage/app/public/uploads
            }
        }

        // Convert to JSON string or save as array if your DB column is casted
        $validated['media_url'] = json_encode($mediaPaths);

        $request->user()->update($validated);

        return back()->with('success', 'Settings updated successfully');
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
