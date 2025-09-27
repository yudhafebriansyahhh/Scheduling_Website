<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Fotografer;
use App\Models\Editor;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Login gagal, email atau password salah'], 401);
        }

        // ambil data tambahan sesuai role
        $extraData = null;
        if ($user->role === 'fotografer') {
            $fotografer = Fotografer::where('user_id', $user->id)->first();
            $extraData = [
                'alamat' => $fotografer->alamat ?? null,
                'no_hp'  => $fotografer->no_hp ?? null,
                'photo'  => $fotografer->photo ? asset('storage/' . $fotografer->photo) : null,
            ];
        } elseif ($user->role === 'editor') {
            $editor = Editor::where('user_id', $user->id)->first();
            $extraData = [
                'alamat' => $editor->alamat ?? null,
                'no_hp'  => $editor->no_hp ?? null,
                'photo'  => $editor->photo ? asset('storage/' . $editor->photo) : null,
            ];
        }

        $token = $user->createToken('android_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $user->role,
                'alamat' => $extraData['alamat'] ?? null,
                'no_hp'  => $extraData['no_hp'] ?? $user->no_hp,
                'photo'  => $extraData['photo'] ?? null,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => 'required|string|confirmed|min:6',
            'role'     => 'required|string|max:255',
            'no_hp'    => 'required|string|max:225',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'no_hp'    => $request->no_hp,
        ]);

        // isi tabel tambahan
        if ($request->role === 'fotografer') {
            Fotografer::create([
                'user_id' => $user->id,
                'nama'    => $request->name,
                'alamat'  => $request->alamat ?? null,
                'no_hp'   => $request->no_hp,
                'email'   => $request->email,
                'photo'   => null,
            ]);
        } elseif ($request->role === 'editor') {
            Editor::create([
                'user_id' => $user->id,
                'nama'    => $request->name,
                'alamat'  => $request->alamat ?? null,
                'no_hp'   => $request->no_hp,
                'email'   => $request->email,
                'photo'   => null,
            ]);
        }

        $token = $user->createToken('android_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => [
                'id'     => $user->id,
                'name'   => $user->name,
                'email'  => $user->email,
                'role'   => $user->role,
                'alamat' => $request->alamat ?? null,
                'no_hp'  => $request->no_hp,
                'photo'  => null,
            ],
            'token' => $token,
        ], 201);
    }
}
