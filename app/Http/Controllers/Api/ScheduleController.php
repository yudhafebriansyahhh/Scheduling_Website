<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Schedule;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $user = auth()->user(); // user yang sedang login

    $query = Schedule::select('id','tanggal', 'jamMulai', 'jamSelesai', 'namaEvent', 'fotografer_id', 'editor_id');

    if ($user->role === 'fotografer') {
        $fotografer = \App\Models\Fotografer::where('user_id', $user->id)->first();
        if ($fotografer) {
            $query->where('fotografer_id', $fotografer->id);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Fotografer tidak ditemukan untuk user ini'
            ], 404);
        }
    } elseif ($user->role === 'editor') {
        $editor = \App\Models\Editor::where('user_id', $user->id)->first();
        if ($editor) {
            $query->where('editor_id', $editor->id);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Editor tidak ditemukan untuk user ini'
            ], 404);
        }
    } elseif ($user->role === 'admin') {
        // admin bisa lihat semua, jadi tidak ada where
    }

    $schedules = $query
        ->orderBy('tanggal', 'desc')
        ->orderBy('jamMulai', 'desc')
        ->get();

    return response()->json([
        'status' => 'success',
        'user' => $user,
        'data' => $schedules
    ]);
}




    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
{
    $user = auth()->user();
    $schedule = Schedule::find($id);

    if (!$schedule) {
        return response()->json([
            'status' => 'error',
            'message' => 'Schedule tidak ditemukan'
        ], 404);
    }

    // validasi input
    $rules = [
        'catatan' => 'nullable|string',
    ];

    if ($user->role === 'fotografer') {
        $rules['linkGdriveFotografer'] = 'nullable|string';
    } elseif ($user->role === 'editor') {
        $rules['linkGdriveEditor'] = 'nullable|string';
    } elseif ($user->role === 'admin') {
        $rules['linkGdriveFotografer'] = 'nullable|string';
        $rules['linkGdriveEditor'] = 'nullable|string';
    }

    $validated = $request->validate($rules);

    // cek kepemilikan schedule untuk fotografer/editor
    if ($user->role === 'fotografer') {
        $fotografer = \App\Models\Fotografer::where('user_id', $user->id)->first();
        if (!$fotografer || $schedule->fotografer_id !== $fotografer->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mengedit schedule ini'
            ], 403);
        }

        $schedule->catatan = $validated['catatan'] ?? $schedule->catatan;
        $schedule->linkGdriveFotografer = $validated['linkGdriveFotografer'] ?? $schedule->linkGdriveFotografer;
    } elseif ($user->role === 'editor') {
        $editor = \App\Models\Editor::where('user_id', $user->id)->first();
        if (!$editor || $schedule->editor_id !== $editor->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mengedit schedule ini'
            ], 403);
        }

        $schedule->catatan = $validated['catatan'] ?? $schedule->catatan;
        $schedule->linkGdriveEditor = $validated['linkGdriveEditor'] ?? $schedule->linkGdriveEditor;
    } elseif ($user->role === 'admin') {
        // admin bisa update semuanya
        $schedule->catatan = $validated['catatan'] ?? $schedule->catatan;
        if (isset($validated['linkGdriveFotografer'])) {
            $schedule->linkGdriveFotografer = $validated['linkGdriveFotografer'];
        }
        if (isset($validated['linkGdriveEditor'])) {
            $schedule->linkGdriveEditor = $validated['linkGdriveEditor'];
        }
    }

    $schedule->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Schedule berhasil diperbarui',
        'data' => $schedule
    ]);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
