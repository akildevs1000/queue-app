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
            'media_url' => ['required'],
            'media_height' => ['required'],
            'media_width' => ['required'],
        ]);


        // // Convert media_url if type is image (multiple URLs expected)
        // if ($validated['media_type'] === 'image') {
        //     // Normalize input: split by newline or comma, then clean and encode
        //     $urls = preg_split('/[\n,]+/', $validated['media_url']);
        //     $urls = array_filter(array_map('trim', $urls));
        //     $validated['media_url'] = json_encode(array_values($urls));
        // }

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
