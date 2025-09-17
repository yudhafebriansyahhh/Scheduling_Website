<?php

namespace App\Http\Controllers;

use App\Models\Editor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EditorController extends Controller
{
    public function index()
    {
        $editors = Editor::all();

        return Inertia::render('Admin/KelolaEditor', [
            'editors' => $editors
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'noHp' => 'required|string|max:20',
            'email' => 'required|email|unique:editors,email',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120' // 5MB
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('editors', 'public');
        }

        $editor = Editor::create($validated);

        return back()->with([
            'message' => 'Editor berhasil ditambahkan!',
            'editor' => $editor
        ]);
    }

    public function update(Request $request, Editor $editor)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'noHp' => 'required|string|max:20',
            'email' => 'required|email|unique:editors,email,' . $editor->id,
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($editor->photo) {
                Storage::disk('public')->delete($editor->photo);
            }
            $validated['photo'] = $request->file('photo')->store('editors', 'public');
        }

        $editor->update($validated);

        return back()->with([
            'message' => 'Editor berhasil diupdate!',
            'editor' => $editor
        ]);
    }

    public function destroy(Editor $editor)
    {
        // Hapus foto jika ada
        if ($editor->photo) {
            Storage::disk('public')->delete($editor->photo);
        }

        $editor->delete();

        return back()->with([
            'message' => 'Editor berhasil dihapus!'
        ]);
    }
}
