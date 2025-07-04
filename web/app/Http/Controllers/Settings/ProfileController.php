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
use Illuminate\Support\Facades\Storage;
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
            'ip' => ['required', 'ip'],
            'port' => ['required', 'integer'],
            'media_type' => ['required', 'in:youtube,video,gif,image'],
            // 'media_url' => ['required'],
            // 'media_url.*' => [
            //     'file',
            //     'max:2048', // 2MB 
            //     'mimes:jpg,jpeg,png,gif,mp4'
            // ],
            'media_height' => ['nullable', 'integer'],
            'media_width' => ['nullable', 'integer'],
        ]);

        $user = $request->user();

        $validated['media_url'] = $this->handleMediaUpload($user, $request, 'media_url', 'media_type');

        $user->update($validated);

        // Reload fresh user data from DB
        $updatedUser = $user->fresh();

        // Transform media_url paths to full URLs if needed
        if (in_array($updatedUser->media_type, ['image', 'video', 'gif']) && is_array($updatedUser->media_url)) {
            $updatedUser->media_url = array_map(function ($path) {
                return url(Storage::url($path));
            }, $updatedUser->media_url);
        }

        return back()->with('tv_settings', $updatedUser);
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
