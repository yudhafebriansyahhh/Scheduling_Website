<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\Assist;
use App\Models\Fotografer;
use App\Models\Editor;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $user = auth()->user();

    if ($user->role === 'fotografer') {
        $fotografer = Fotografer::where('user_id', $user->id)->first();
        if (!$fotografer) {
            return response()->json(['status' => 'error', 'message' => 'Fotografer tidak ditemukan'], 404);
        }

        // Ambil jadwal utama
        $query = Schedule::where('fotografer_id', $fotografer->id);

    } elseif ($user->role === 'editor') {
        $editor = Editor::where('user_id', $user->id)->first();
        if (!$editor) {
            return response()->json(['status' => 'error', 'message' => 'Editor tidak ditemukan'], 404);
        }

        // Ambil jadwal utama
        $query = Schedule::where('editor_id', $editor->id);

    } elseif ($user->role === 'admin') {
        $query = Schedule::query();
    } else {
        return response()->json(['status' => 'error', 'message' => 'Role tidak dikenali'], 403);
    }

    $schedules = $query->orderBy('tanggal', 'desc')->orderBy('jamMulai', 'desc')->get();

    $formattedData = $schedules->map(function ($schedule) use ($user) {
        return [
            'id' => $schedule->id,
            'tanggal' => $schedule->tanggal instanceof Carbon ? $schedule->tanggal->format('Y-m-d') : date('Y-m-d', strtotime($schedule->tanggal)),
            'jamMulai' => Carbon::parse($schedule->jamMulai)->format('H:i'),
            'jamSelesai' => Carbon::parse($schedule->jamSelesai)->format('H:i'),
            'namaEvent' => $schedule->namaEvent,
            'fotografer_id' => $schedule->fotografer_id,
            'editor_id' => $schedule->editor_id,
            'catatan' => $schedule->catatan,
            'linkGdrive' => $schedule->linkGdrive,
            'lapangan' => $schedule->lapangan,
            'jamFotografer' => $schedule->jamFotografer,
            'jamEditor' => $schedule->jamEditor,
        ];
    });

    return response()->json([
        'status' => 'success',
        'user' => $user,
        'data' => $formattedData
    ]);
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

    $rules = [
        'catatan' => 'nullable|string',
        'linkGdrive' => 'nullable|string',
    ];

    $validated = $request->validate($rules);

    // cek kepemilikan schedule
    if ($user->role === 'fotografer') {
        $fotografer = Fotografer::where('user_id', $user->id)->first();
        $isMain = $schedule->fotografer_id === $fotografer->id;

        if (!$isMain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mengedit schedule ini'
            ], 403);
        }

    } elseif ($user->role === 'editor') {
        $editor = Editor::where('user_id', $user->id)->first();
        $isMain = $schedule->editor_id === $editor->id;

        if (!$isMain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak berhak mengedit schedule ini'
            ], 403);
        }
    }
    // admin bisa edit semua

    // update field yang boleh
    $schedule->catatan = $validated['catatan'] ?? $schedule->catatan;
    $schedule->linkGdrive = $validated['linkGdrive'] ?? $schedule->linkGdrive;
    $schedule->save();

    $formattedSchedule = [
        'id' => $schedule->id,
        'tanggal' => date('Y-m-d', strtotime($schedule->tanggal)),
        'jamMulai' => Carbon::parse($schedule->jamMulai)->format('H:i'),
        'jamSelesai' => Carbon::parse($schedule->jamSelesai)->format('H:i'),
        'namaEvent' => $schedule->namaEvent,
        'fotografer_id' => $schedule->fotografer_id,
        'editor_id' => $schedule->editor_id,
        'catatan' => $schedule->catatan,
        'linkGdrive' => $schedule->linkGdrive,
    ];

    return response()->json([
        'status' => 'success',
        'message' => 'Schedule berhasil diperbarui',
        'data' => $formattedSchedule
    ]);
}

}
