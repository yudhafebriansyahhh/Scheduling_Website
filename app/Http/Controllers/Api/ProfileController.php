<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Fotografer;
use App\Models\Editor;

class ProfileController extends Controller
{
    /**
     * Menampilkan profil user login
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ambil profile berdasarkan role
        if ($user->role === 'fotografer') {
            $profile = $user->fotografer;
        } elseif ($user->role === 'editor') {
            $profile = $user->editor;
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Role tidak dikenali'
            ], 400);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Detail profil',
            'data'    => [
                'id'     => $user->id,
                'role'   => $user->role,
                'nama'   => $profile->nama ?? null,
                'alamat' => $profile->alamat ?? null,
                'no_hp'  => $profile->no_hp ?? null,
                'email'  => $profile->email ?? $user->email,
                'photo'  => $profile && $profile->photo ? url('storage/'.$profile->photo) : null,
            ]
        ]);
    }

    /**
     * Update profil user login
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            Log::info('Update Profile - User ID: ' . $user->id . ', Role: ' . $user->role);

            // Validasi input
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'nama'   => 'required|string|max:255',
                'alamat' => 'nullable|string|max:255',
                'no_hp'  => 'nullable|string|max:20',
                'photo'  => 'nullable|file|image|mimes:jpg,jpeg,png,gif|max:2048',
            ], [
                'photo.image' => 'File harus berupa gambar',
                'photo.mimes' => 'Format foto harus jpg, jpeg, png, atau gif',
                'photo.max'   => 'Ukuran foto maksimal 2MB',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed: ', $validator->errors()->toArray());
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Pilih profile berdasarkan role
            if ($user->role === 'fotografer') {
                $profile = $user->fotografer;
                $folder = 'fotografers';
                if (!$profile) {
                    $profile = Fotografer::create([
                        'user_id' => $user->id,
                        'email'   => $user->email,
                        'nama'    => $user->name,
                    ]);
                    Log::info('Created new Fotografer profile');
                }
            } elseif ($user->role === 'editor') {
                $profile = $user->editor;
                $folder = 'editors';
                if (!$profile) {
                    $profile = Editor::create([
                        'user_id' => $user->id,
                        'email'   => $user->email,
                        'nama'    => $user->name,
                    ]);
                    Log::info('Created new Editor profile');
                }
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Role tidak dikenali: ' . $user->role
                ], 400);
            }

            // Handle file upload jika ada
            $photoPath = $profile->photo;

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');

                if (!$file->isValid()) {
                    return response()->json([
                        'status' => false,
                        'message' => 'File yang diupload tidak valid'
                    ], 400);
                }

                // Hapus foto lama
                if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                    Storage::disk('public')->delete($photoPath);
                }

                // Buat folder jika belum ada
                if (!Storage::disk('public')->exists($folder)) {
                    Storage::disk('public')->makeDirectory($folder);
                }

                // Simpan file
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $stored = Storage::disk('public')->putFileAs($folder, $file, $filename);

                if ($stored) {
                    $photoPath = $folder . '/' . $filename;
                } else {
                    return response()->json([
                        'status' => false,
                        'message' => 'Gagal menyimpan file foto'
                    ], 500);
                }
            }

            // Update data profile
            $profile->update([
                'nama'   => $request->nama,
                'alamat' => $request->alamat,
                'no_hp'  => $request->no_hp,
                'photo'  => $photoPath,
            ]);

            $profile->refresh();

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

        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
