<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Schedule;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $user = auth()->user(); // user yang sedang login

    if ($user->role === 'fotografer') {
        $fotografer = \App\Models\Fotografer::where('user_id', $user->id)->first();
        if (!$fotografer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Fotografer tidak ditemukan untuk user ini'
            ], 404);
        }

        $mainScheduleIds = Schedule::where('fotografer_id', $fotografer->id)->pluck('id');
        $assistScheduleIds = \App\Models\ScheduleFotograferAssist::where('fotografer_id', $fotografer->id)
            ->pluck('schedule_id');
        $allScheduleIds = $mainScheduleIds->merge($assistScheduleIds)->unique();

        $query = Schedule::select(
            'id','tanggal','jamMulai','jamSelesai','namaEvent','fotografer_id','editor_id','catatan',
            'linkGdriveFotografer','linkGdriveEditor','lapangan','jamFotografer','jamEditor'
        )->whereIn('id', $allScheduleIds);

    } elseif ($user->role === 'editor') {
        $editor = \App\Models\Editor::where('user_id', $user->id)->first();
        if (!$editor) {
            return response()->json([
                'status' => 'error',
                'message' => 'Editor tidak ditemukan untuk user ini'
            ], 404);
        }

        $mainScheduleIds = Schedule::where('editor_id', $editor->id)->pluck('id');
        $assistScheduleIds = \App\Models\ScheduleEditorAssist::where('editor_id', $editor->id)
            ->pluck('schedule_id');
        $allScheduleIds = $mainScheduleIds->merge($assistScheduleIds)->unique();

        $query = Schedule::select(
            'id','tanggal','jamMulai','jamSelesai','namaEvent','fotografer_id','editor_id','catatan',
            'linkGdriveFotografer','linkGdriveEditor','lapangan','jamFotografer','jamEditor'
        )->whereIn('id', $allScheduleIds);

    } elseif ($user->role === 'admin') {
        $query = Schedule::select(
            'id','tanggal','jamMulai','jamSelesai','namaEvent','fotografer_id','editor_id','catatan',
            'linkGdriveFotografer','linkGdriveEditor','lapangan','jamFotografer','jamEditor'
        );
    } else {
        return response()->json([
            'status' => 'error',
            'message' => 'Role tidak dikenali'
        ], 403);
    }

    $schedules = $query->orderBy('tanggal', 'desc')
        ->orderBy('jamMulai', 'desc')
        ->get();

    $formattedData = $schedules->map(function ($schedule) use ($user) {
        $scheduleData = [
            'id' => $schedule->id,
            'tanggal' => $schedule->tanggal->format('Y-m-d'),
            'jamMulai' => Carbon::parse($schedule->jamMulai)->format('H:i'),
            'jamSelesai' => Carbon::parse($schedule->jamSelesai)->format('H:i'),
            'namaEvent' => $schedule->namaEvent,
            'fotografer_id' => $schedule->fotografer_id,
            'editor_id' => $schedule->editor_id,
            'catatan' => $schedule->catatan,
            'linkGdriveFotografer' => $schedule->linkGdriveFotografer,
            'linkGdriveEditor' => $schedule->linkGdriveEditor,
            'lapangan' => $schedule->lapangan,       // <-- Tambahan field lapangan
            'jamFotografer' => $schedule->jamFotografer,
            'jamEditor' => $schedule->jamEditor
        ];

        // Role spesifik
        if ($user->role === 'fotografer') {
            $fotografer = \App\Models\Fotografer::where('user_id', $user->id)->first();
            if ($schedule->fotografer_id == $fotografer->id) {
                $scheduleData['user_role_in_schedule'] = 'fotografer_utama';
            } else {
                $assistData = \App\Models\ScheduleFotograferAssist::where('schedule_id', $schedule->id)
                    ->where('fotografer_id', $fotografer->id)
                    ->first();
                if ($assistData) {
                    $scheduleData['user_role_in_schedule'] = 'fotografer_assist';
                    $scheduleData['jam_assist'] = Carbon::parse($assistData->jamAssist)->format('H:i');
                }
            }
        }

        if ($user->role === 'editor') {
            $editor = \App\Models\Editor::where('user_id', $user->id)->first();
            if ($schedule->editor_id == $editor->id) {
                $scheduleData['user_role_in_schedule'] = 'editor_utama';
            } else {
                $assistData = \App\Models\ScheduleEditorAssist::where('schedule_id', $schedule->id)
                    ->where('editor_id', $editor->id)
                    ->first();
                if ($assistData) {
                    $scheduleData['user_role_in_schedule'] = 'editor_assist';
                    $scheduleData['jam_assist'] = Carbon::parse($assistData->jamAssist)->format('H:i');
                }
            }
        }

        return $scheduleData;
    });

    return response()->json([
        'status' => 'success',
        'user' => $user,
        'data' => $formattedData
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
            
            // Cek apakah user adalah fotografer utama ATAU fotografer assist
            $isMainFotografer = $schedule->fotografer_id === $fotografer->id;
            $isAssistFotografer = \App\Models\ScheduleFotograferAssist::where('schedule_id', $schedule->id)
                ->where('fotografer_id', $fotografer->id)
                ->exists();
            
            if (!$isMainFotografer && !$isAssistFotografer) {
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

        // Format response data dengan tanggal yang sudah diformat
        $formattedSchedule = [
            'id' => $schedule->id,
            'tanggal' => date('Y-m-d', strtotime($schedule->tanggal)),
            'jamMulai' => Carbon::parse($schedule->jamMulai)->format('H:i'),
            'jamSelesai' => Carbon::parse($schedule->jamSelesai)->format('H:i'),
            'namaEvent' => $schedule->namaEvent,
            'fotografer_id' => $schedule->fotografer_id,
            'editor_id' => $schedule->editor_id,
            'catatan' => $schedule->catatan,
            'linkGdriveFotografer' => $schedule->linkGdriveFotografer,
            'linkGdriveEditor' => $schedule->linkGdriveEditor,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Schedule berhasil diperbarui',
            'data' => $formattedSchedule
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
