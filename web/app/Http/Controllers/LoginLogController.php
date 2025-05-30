<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    public function index(Request $request)
    {
        return LoginLog::when($request->user()->type !== 'master', fn($q) => $q->where('user_id', $request->user()->id))
            ->orderByDesc('logged_in_at')
            ->paginate(10);
    }

    public function lastLogin(Request $request)
    {
        return LoginLog::where('user_id', $request->user()->id)
            ->latest()
            ->first();
    }
}
