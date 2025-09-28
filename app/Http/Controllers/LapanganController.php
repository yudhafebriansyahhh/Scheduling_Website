<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lapangan;

class LapanganController extends Controller
{
    public function index()
    {
        $lapangans = Lapangan::orderBy('created_at', 'desc')->get();

        return inertia('Admin/KelolaLapangan', [
            'lapangans' => $lapangans
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_lapangan' => 'required|string|max:255|unique:lapangans,nama_lapangan',
        ], [
            'nama_lapangan.required' => 'Nama lapangan harus diisi',
            'nama_lapangan.unique' => 'Nama lapangan sudah ada, gunakan nama lain',
            'nama_lapangan.max' => 'Nama lapangan tidak boleh lebih dari 255 karakter',
        ]);

        Lapangan::create([
            'nama_lapangan' => $request->nama_lapangan,
        ]);

        return redirect()->back()->with('success', 'Lapangan berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $lapangan = Lapangan::findOrFail($id);

        $request->validate([
            'nama_lapangan' => 'required|string|max:255|unique:lapangans,nama_lapangan,' . $id,
        ], [
            'nama_lapangan.required' => 'Nama lapangan harus diisi',
            'nama_lapangan.unique' => 'Nama lapangan sudah ada, gunakan nama lain',
            'nama_lapangan.max' => 'Nama lapangan tidak boleh lebih dari 255 karakter',
        ]);

        $lapangan->update([
            'nama_lapangan' => $request->nama_lapangan,
        ]);

        return redirect()->back()->with('success', 'Data lapangan berhasil diupdate!');
    }

    public function destroy($id)
    {
        $lapangan = Lapangan::findOrFail($id);

        // Check if lapangan is being used in schedules
        if ($lapangan->schedules()->count() > 0) {
            return redirect()->back()->with('error', 'Lapangan tidak dapat dihapus karena masih digunakan dalam jadwal!');
        }

        $lapangan->delete();

        return redirect()->back()->with('success', 'Lapangan berhasil dihapus!');
    }
}
