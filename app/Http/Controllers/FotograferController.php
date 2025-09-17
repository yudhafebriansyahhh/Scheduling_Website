<?php

namespace App\Http\Controllers;
use App\Models\Fotografer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class FotograferController extends Controller
{
    public function index()
    {
        $fotografers = Fotografer::with('user')->latest()->get();

        return Inertia::render('Admin/KelolaFotografer', [
            'fotografers' => $fotografers
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
                'role'     => 'fotografer', // Jika ada kolom role
                'email_verified_at' => now(), // Auto verify
            ]);

            // STEP 2: Handle upload foto jika ada
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('fotografers', 'public');
            }

            // STEP 3: Buat data editor dengan user_id yang baru dibuat
            $fotografer = Fotografer::create([
                'user_id' => $user->id, // 👈 INI YANG PENTING - ambil ID dari user yang baru dibuat
                'nama'    => $validated['nama'],
                'alamat'  => $validated['alamat'] ?? '',
                'no_hp'   => $validated['no_hp'],
                'email'   => $validated['email'],
                'photo'   => $photoPath,
            ]);

            // Commit transaction jika semua berhasil
            DB::commit();

            return redirect()->route('fotografer.index')->with('success', 'Editor berhasil ditambahkan!');

        } catch (\Exception $e) {
            // Rollback transaction jika ada error
            DB::rollBack();

            // Hapus foto yang sudah diupload jika ada error
            if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                Storage::disk('public')->delete($photoPath);
            }

            // Log error untuk debugging
            \Log::error('Error creating editor: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menambah fotografer: ' . $e->getMessage()])
                        ->withInput();
        }
    }

    public function update(Request $request, Fotografer $fotografer)
    {
        // Validasi input - exclude email yang sedang diedit
        $validated = $request->validate([
            'nama'   => 'required|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'no_hp'  => 'required|string|max:20',
            'email'  => 'required|email|unique:users,email,' . $fotografer->user_id,
            'photo'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        try {
            DB::beginTransaction();

            // Handle upload foto baru
            if ($request->hasFile('photo')) {
                // Hapus foto lama jika ada
                if ($fotografer->photo && Storage::disk('public')->exists($fotografer->photo)) {
                    Storage::disk('public')->delete($fotografer->photo);
                }
                // Upload foto baru
                $validated['photo'] = $request->file('photo')->store('fotografers', 'public');
            }

            // Update data fotografer
            $fotografer->update([
                'nama'   => $validated['nama'],
                'alamat' => $validated['alamat'] ?? '',
                'no_hp'  => $validated['no_hp'],
                'email'  => $validated['email'],
                'photo'  => $validated['photo'] ?? $fotografer->photo,
            ]);

            // Update juga data user terkait
            if ($fotografer->user) {
                $fotografer->user->update([
                    'name'  => $validated['nama'],
                    'email' => $validated['email'],
                ]);
            }

            DB::commit();

            return back()->with('success', 'Fotografer berhasil diupdate!');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error updating fotografer: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat mengupdate fotografer: ' . $e->getMessage()]);
        }
    }

    public function destroy(Fotografer $fotografer)
    {
        try {
            DB::beginTransaction();

            // Hapus foto jika ada
            if ($fotografer->photo && Storage::disk('public')->exists($fotografer->photo)) {
                Storage::disk('public')->delete($fotografer->photo);
            }

            // Simpan user untuk dihapus
            $user = $fotografer->user;

            // Hapus foto$fotografer terlebih dahulu
            $fotografer->delete();

            // Kemudian hapus user terkait
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return back()->with('success', 'Fotografer berhasil dihapus!');

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Error deleting fotografer: ' . $e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menghapus fotografer: ' . $e->getMessage()]);
        }
    }

    public function show(Fotografer $fotografer)
    {
        $fotografer->load('user');

        return Inertia::render('Admin/DetailFotografer', [
            'fotografer' => $fotografer
        ]);
    }
}
