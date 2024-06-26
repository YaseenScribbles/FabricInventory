<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        if (Auth::attempt($credentials) && Auth::user()->active) {
            $user = Auth::user();
            return response()->json(['message' => 'logged in', 'user' => new UserResource($user)]);
        } else {
            if (Auth::attempt($credentials) && !Auth::user()->active) {
                return response()->json(['message' => 'Please contact administrator'], 401);
            }
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'logged out']);
    }
}
