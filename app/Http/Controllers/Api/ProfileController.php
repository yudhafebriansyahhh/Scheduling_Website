<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Fotografer;
use App\Models\Editor;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $profile = null;
        if ($user->role === 'fotografer') {
            $profile = $user->fotografer;
        } elseif ($user->role === 'editor') {
            $profile = $user->editor;
        }

        if (!$profile) {
            return response()->json([
                'status' => false,
                'message' => 'Profil belum tersedia untuk role: '.$user->role
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Detail profil',
            'data'    => [
                'id'     => $user->id,
                'role'   => $user->role,
                'nama'   => $profile->nama,
                'alamat' => $profile->alamat,
                'no_hp'  => $profile->no_hp,
                'email'  => $profile->email ?? $user->email,
                'photo'  => $profile->photo ? url('storage/'.$profile->photo) : null,
            ]
        ]);
    }

    public function update(Request $request)
{
    $user = $request->user();

    $validator = \Validator::make($request->all(), [
        'nama'   => 'required|string|max:255',
        'alamat' => 'nullable|string|max:255',
        'no_hp'  => 'nullable|string|max:20',
        'photo'  => 'nullable|file|image|mimes:jpg,jpeg,png,gif|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Validasi gagal',
            'errors' => $validator->errors()
        ], 422);
    }

    // tentukan profil & folder berdasarkan role
    if ($user->role === 'fotografer') {
        $profile = $user->fotografer ?? Fotografer::create([
            'user_id' => $user->id,
            'email'   => $user->email,
            'nama'    => $user->name,
        ]);
        $folder = 'fotografers';
    } elseif ($user->role === 'editor') {
        $profile = $user->editor ?? Editor::create([
            'user_id' => $user->id,
            'email'   => $user->email,
            'nama'    => $user->name,
        ]);
        $folder = 'editors';
    } else {
        return response()->json([
            'status' => false,
            'message' => 'Role tidak dikenali'
        ], 400);
    }

    $photoPath = $profile->photo;

    // cek upload foto
    if ($request->hasFile('photo')) {
        $file = $request->file('photo');

        // hapus foto lama
        if ($photoPath && Storage::disk('public')->exists($photoPath)) {
            Storage::disk('public')->delete($photoPath);
        }

        $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $stored = Storage::disk('public')->putFileAs($folder, $file, $filename);

        if ($stored) {
            $photoPath = $folder.'/'.$filename;
        }
    }

    // update profile
    $profile->update([
        'nama'   => $request->input('nama'),   // gunakan input()
        'alamat' => $request->input('alamat'),
        'no_hp'  => $request->input('no_hp'),
        'photo'  => $photoPath,
    ]);

    return response()->json([
        'status'  => true,
        'message' => 'Profil berhasil diperbarui',
        'data'    => [
            'id'     => $user->id,
            'role'   => $user->role,
            'nama'   => $profile->nama,
            'alamat' => $profile->alamat,
            'no_hp'  => $profile->no_hp,
            'email'  => $profile->email ?? $user->email,
            'photo'  => $profile->photo ? url('storage/'.$profile->photo) : null,
        ]
    ]);
}

}
