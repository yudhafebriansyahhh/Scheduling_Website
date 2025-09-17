<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EditorController extends Controller
{
    public function index()
    {
        $editors = Editor::with('user')->latest()->get();

        return Inertia::render('Admin/KelolaEditor', [
            'editors' => $editors
        ]);
    }

    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'nama'   => 'required|string|max:255',
            'email'  => 'required|email|unique:users,email',
            'no_hp'  => 'required|string|max:20',
            'photo'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
            'alamat' => 'nullable|string|max:500'
        ]);

        try {
            // Mulai database transaction
            DB::beginTransaction();

            // STEP 1: Buat user terlebih dahulu
            $user = User::create([
                'name'     => $validated['nama'],
                'email'    => $validated['email'],
                'password' => Hash::make('12345678'), // Default password
                'role'     => 'editor', // Jika ada kolom role
                'email_verified_at' => now(), // Auto verify
            ]);

            // STEP 2: Handle upload foto jika ada
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('editors', 'public');
            }

            // STEP 3: Buat data editor dengan user_id yang baru dibuat
            $editor = Editor::create([
                'user_id' => $user->id, // 👈 INI YANG PENTING - ambil ID dari user yang baru dibuat
                'nama'    => $validated['nama'],
                'alamat'  => $validated['alamat'] ?? '',
                'no_hp'   => $validated['no_hp'],
                'email'   => $validated['email'],
                'photo'   => $photoPath,
            ]);

            // Commit transaction jika semua berhasil
            DB::commit();

            return redirect()->route('editor.index')->with('success', 'Editor berhasil ditambahkan!');

        } catch (\Exception $e) {
            // Rollback transaction jika ada error
            DB::rollBack();

            // Hapus foto yang sudah diupload jika ada error
            if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            // Log error untuk debugging
            \Log::error('Error creating editor: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menambah editor: ' . $e->getMessage()])
                        ->withInput();
        }
    }

    public function update(Request $request, Editor $editor)
    {
        // Validasi input - exclude email yang sedang diedit
        $validated = $request->validate([
            'nama'   => 'required|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'no_hp'  => 'required|string|max:20',
            'email'  => 'required|email|unique:users,email,' . $editor->user_id,
            'photo'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        try {
            DB::beginTransaction();

            // Handle upload foto baru
            if ($request->hasFile('photo')) {
                // Hapus foto lama jika ada
                if ($editor->photo && Storage::disk('public')->exists($editor->photo)) {
                    Storage::disk('public')->delete($editor->photo);
                }
                // Upload foto baru
                $validated['photo'] = $request->file('photo')->store('editors', 'public');
            }

            // Update data editor
            $editor->update([
                'nama'   => $validated['nama'],
                'alamat' => $validated['alamat'] ?? '',
                'no_hp'  => $validated['no_hp'],
                'email'  => $validated['email'],
                'photo'  => $validated['photo'] ?? $editor->photo,
            ]);

            // Update juga data user terkait
            if ($editor->user) {
                $editor->user->update([
                    'name'  => $validated['nama'],
                    'email' => $validated['email'],
                ]);
            }

            DB::commit();

            return back()->with('success', 'Editor berhasil diupdate!');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error updating editor: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat mengupdate editor: ' . $e->getMessage()]);
        }
    }

    public function destroy(Editor $editor)
    {
        try {
            DB::beginTransaction();

            // Hapus foto jika ada
            if ($editor->photo && Storage::disk('public')->exists($editor->photo)) {
                Storage::disk('public')->delete($editor->photo);
            }

            // Simpan user untuk dihapus
            $user = $editor->user;

            // Hapus editor terlebih dahulu
            $editor->delete();

            // Kemudian hapus user terkait
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return back()->with('success', 'Editor berhasil dihapus!');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error deleting editor: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menghapus editor: ' . $e->getMessage()]);
        }
    }

    public function show(Editor $editor)
    {
        $editor->load('user');

        return Inertia::render('Admin/DetailEditor', [
            'editor' => $editor
        ]);
    }
}
